import type {
  Webhook,
  WebhookPayload,
  WebhookDelivery,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'
import { randomUUID, createHmac } from 'node:crypto'
import { webhookStorage } from './webhookStorage'
import { getCircuitBreaker } from './circuit-breaker'
import { retryWithResult, retryPresets, calculateBackoff } from './retry'
import { createCircuitBreakerError } from './api-error'

interface WebhookDeliveryOptions {
  maxRetries?: number
  initialDelayMs?: number
  priority?: number
  async?: boolean
}

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_INITIAL_DELAY = 1000
const DEFAULT_PRIORITY = 0

export class WebhookQueueSystem {
  private isProcessing = false
  private processorInterval: NodeJS.Timeout | null = null

  async deliverWebhook(
    webhook: Webhook,
    payload: WebhookPayload,
    options: WebhookDeliveryOptions = {}
  ): Promise<boolean> {
    const {
      maxRetries = DEFAULT_MAX_RETRIES,
      initialDelayMs = DEFAULT_INITIAL_DELAY,
      priority = DEFAULT_PRIORITY,
      async = false,
    } = options

    if (async) {
      return this.queueWebhook(webhook, payload, {
        maxRetries,
        initialDelayMs,
        priority,
      })
    }

    return this.deliverWebhookSync(webhook, payload, maxRetries)
  }

  private async deliverWebhookSync(
    webhook: Webhook,
    payload: WebhookPayload,
    maxRetries: number
  ): Promise<boolean> {
    const circuitBreakerKey = `webhook:${webhook.url}`
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 60000,
    })

    const result = await retryWithResult(
      async () => {
        return circuitBreaker.execute(
          async () => {
            return this.executeWebhookDelivery(webhook, payload)
          },
          () => {
            const lastFailureTime = circuitBreaker.getStats().lastFailureTime
            const lastFailureTimeIso = lastFailureTime
              ? new Date(lastFailureTime).toISOString()
              : undefined
            throw createCircuitBreakerError(webhook.url, lastFailureTimeIso)
          }
        )
      },
      {
        ...retryPresets.standard,
        maxRetries,
        retryableErrors: [
          408,
          429,
          500,
          502,
          503,
          504,
          'ECONNRESET',
          'ETIMEDOUT',
          'ENOTFOUND',
        ],
      }
    )

    return result.success
  }

  private async executeWebhookDelivery(
    webhook: Webhook,
    payload: WebhookPayload
  ): Promise<boolean> {
    const signature = this.generateSignature(payload, webhook.secret || '')
    const payloadWithSignature = { ...payload, signature }

    let responseCode: number | undefined
    let responseMessage: string | undefined
    let success = false

    try {
      await $fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': payload.event,
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': payload.timestamp,
          ...(payload.idempotencyKey && {
            'X-Webhook-Idempotency-Key': payload.idempotencyKey,
          }),
        },
        body: JSON.stringify(payloadWithSignature),
        timeout: 10000,
      })

      responseCode = 200
      responseMessage = 'OK'
      success = true
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string }
      responseCode = err.status || 0
      responseMessage = err.message || 'Unknown error'
      success = false
    }

    const delivery: WebhookDelivery = {
      id: `del_${randomUUID()}`,
      webhookId: webhook.id,
      event: payload.event,
      payload: payloadWithSignature,
      status: success ? 'success' : 'failed',
      responseCode,
      responseMessage,
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      idempotencyKey: payload.idempotencyKey,
      completedAt: success ? new Date().toISOString() : undefined,
    }

    webhookStorage.createDelivery(delivery)

    if (payload.idempotencyKey) {
      webhookStorage.setDeliveryByIdempotencyKey(
        payload.idempotencyKey,
        delivery
      )
    }

    webhookStorage.updateWebhook(webhook.id, {
      lastDeliveryAt: new Date().toISOString(),
      lastDeliveryStatus: success ? 'success' : 'failed',
      deliveryCount: webhook.deliveryCount + 1,
      failureCount: success ? webhook.failureCount : webhook.failureCount + 1,
    })

    return success
  }

  private async queueWebhook(
    webhook: Webhook,
    payload: WebhookPayload,
    options: { maxRetries: number; initialDelayMs: number; priority: number }
  ): Promise<boolean> {
    const queueItem: WebhookQueueItem = {
      id: `q_${randomUUID()}`,
      webhookId: webhook.id,
      event: payload.event,
      payload,
      priority: options.priority,
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: options.maxRetries,
    }

    webhookStorage.addToQueue(queueItem)
    this.startQueueProcessor()

    return true
  }

  private async processQueueItem(item: WebhookQueueItem): Promise<void> {
    const webhook = webhookStorage.getWebhookById(item.webhookId)
    if (!webhook || !webhook.active) {
      webhookStorage.removeFromQueue(item.id)
      return
    }

    const circuitBreakerKey = `webhook:${webhook.url}`
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 60000,
    })

    let success = false
    let lastError: unknown | null = null

    try {
      success = await circuitBreaker.execute(
        async () => {
          return this.executeWebhookDelivery(webhook, item.payload)
        },
        () => {
          const lastFailureTime = circuitBreaker.getStats().lastFailureTime
          const lastFailureTimeIso = lastFailureTime
            ? new Date(lastFailureTime).toISOString()
            : undefined
          throw createCircuitBreakerError(webhook.url, lastFailureTimeIso)
        }
      )
    } catch (error: unknown) {
      lastError = (error as Error) || null
      success = false
    }

    if (success) {
      webhookStorage.removeFromQueue(item.id)
    } else {
      await this.handleFailedDelivery(item, webhook, lastError)
    }
  }

  private async handleFailedDelivery(
    item: WebhookQueueItem,
    webhook: Webhook,
    error: Error | null
  ): Promise<void> {
    item.retryCount++

    if (item.retryCount >= item.maxRetries) {
      await this.moveToDeadLetterQueue(item, webhook, error)
      webhookStorage.removeFromQueue(item.id)
    } else {
      await this.scheduleRetry(item)
    }
  }

  private async scheduleRetry(item: WebhookQueueItem): Promise<void> {
    const delay = calculateBackoff(item.retryCount, 1000, 30000, true)
    const nextRetryAt = new Date(Date.now() + delay).toISOString()

    item.scheduledFor = nextRetryAt
    webhookStorage.removeFromQueue(item.id)
    webhookStorage.addToQueue(item)
  }

  private async moveToDeadLetterQueue(
    item: WebhookQueueItem,
    webhook: Webhook,
    error: Error | null
  ): Promise<void> {
    const deliveries = webhookStorage.getDeliveriesByWebhookId(webhook.id)
    const failedDeliveries = deliveries
      .filter(d => d.webhookId === webhook.id && d.status === 'failed')
      .slice(-item.retryCount)

    const deadLetterItem: DeadLetterWebhook = {
      id: `dl_${randomUUID()}`,
      webhookId: webhook.id,
      event: item.event,
      payload: item.payload,
      failureReason: error?.message || 'Max retries exceeded',
      lastAttemptAt: new Date().toISOString(),
      createdAt: item.createdAt,
      deliveryAttempts: failedDeliveries,
    }

    webhookStorage.addToDeadLetterQueue(deadLetterItem)
  }

  private startQueueProcessor(): void {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true
    this.processorInterval = setInterval(() => {
      this.processQueue()
    }, 5000)
  }

  private async processQueue(): Promise<void> {
    const queue = webhookStorage.getQueue()
    const now = new Date()

    for (const item of queue) {
      const scheduledFor = new Date(item.scheduledFor)

      if (scheduledFor <= now) {
        try {
          await this.processQueueItem(item)
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error)
        }
      }
    }
  }

  stopQueueProcessor(): void {
    if (this.processorInterval) {
      clearInterval(this.processorInterval)
      this.processorInterval = null
    }
    this.isProcessing = false
  }

  retryDeadLetterWebhook(id: string): boolean {
    const deadLetterItem = webhookStorage.getDeadLetterWebhookById(id)
    if (!deadLetterItem) {
      return false
    }

    const webhook = webhookStorage.getWebhookById(deadLetterItem.webhookId)
    if (!webhook) {
      return false
    }

    webhookStorage.removeFromDeadLetterQueue(id)

    const queueItem: WebhookQueueItem = {
      id: `q_${randomUUID()}`,
      webhookId: webhook.id,
      event: deadLetterItem.event,
      payload: deadLetterItem.payload,
      priority: 10,
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
    }

    webhookStorage.addToQueue(queueItem)
    this.startQueueProcessor()

    return true
  }

  getQueueStats() {
    const queue = webhookStorage.getQueue()
    const deadLetterQueue = webhookStorage.getDeadLetterQueue()

    return {
      pending: queue.length,
      deadLetter: deadLetterQueue.length,
      isProcessing: this.isProcessing,
      nextScheduled: queue.length > 0 ? queue[0].scheduledFor : null,
    }
  }

  private generateSignature(payload: WebhookPayload, secret: string): string {
    const payloadString = JSON.stringify(payload)
    const signature = createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex')

    return `v1=${signature}`
  }
}

export const webhookQueueSystem = new WebhookQueueSystem()
