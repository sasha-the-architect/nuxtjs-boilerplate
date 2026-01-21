import { randomUUID } from 'node:crypto'
import type { Webhook, WebhookPayload, WebhookQueueItem } from '~/types/webhook'
import { webhookStorage } from './webhookStorage'
import { getCircuitBreaker } from './circuit-breaker'
import { retryWithResult, retryPresets } from './retry'
import { createCircuitBreakerError } from './api-error'
import { webhookQueueManager } from './webhook-queue-manager'
import { webhookDeliveryService } from './webhook-delivery'
import { deadLetterManager } from './webhook-dead-letter'

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
  private circuitBreakerKeys: Map<string, string> = new Map()

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
    const circuitBreakerKey = this.getCircuitBreakerKey(webhook)
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 60000,
    })

    const result = await retryWithResult(
      async () => {
        return circuitBreaker.execute(
          async () => {
            const delivery = await webhookDeliveryService.deliver(
              webhook,
              payload
            )
            return delivery.status === 'success'
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

  private async queueWebhook(
    webhook: Webhook,
    payload: WebhookPayload,
    options: { maxRetries: number; initialDelayMs: number; priority: number }
  ): Promise<boolean> {
    const { maxRetries, priority } = options

    const queueItem: WebhookQueueItem = {
      id: `q_${randomUUID()}`,
      webhookId: webhook.id,
      event: payload.event,
      payload,
      priority,
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
    }

    webhookQueueManager.enqueue(queueItem)
    webhookQueueManager.startProcessor(async item => {
      await this.processQueueItem(item)
    })

    return true
  }

  private async processQueueItem(item: WebhookQueueItem): Promise<void> {
    const webhook = await webhookStorage.getWebhookById(item.webhookId)
    if (!webhook || !webhook.active) {
      webhookQueueManager.remove(item.id)
      return
    }

    const circuitBreakerKey = this.getCircuitBreakerKey(webhook)
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 60000,
    })

    let success = false
    let lastError: Error | null = null

    try {
      const delivery = await circuitBreaker.execute(
        async () => {
          return await webhookDeliveryService.deliver(webhook, item.payload)
        },
        () => {
          const lastFailureTime = circuitBreaker.getStats().lastFailureTime
          const lastFailureTimeIso = lastFailureTime
            ? new Date(lastFailureTime).toISOString()
            : undefined
          throw createCircuitBreakerError(webhook.url, lastFailureTimeIso)
        }
      )
      success = delivery.status === 'success'
    } catch (error) {
      lastError = error instanceof Error ? error : null
      success = false
    }

    if (success) {
      webhookQueueManager.remove(item.id)
    } else {
      await this.handleFailedDelivery(item, webhook, lastError)
    }
  }

  private async handleFailedDelivery(
    item: WebhookQueueItem,
    webhook: Webhook | null,
    error: Error | null
  ): Promise<void> {
    item.retryCount++

    if (item.retryCount >= item.maxRetries && webhook) {
      deadLetterManager.addToDeadLetter(item, webhook, error)
      webhookQueueManager.remove(item.id)
    } else {
      await this.scheduleRetry(item)
    }
  }

  private async scheduleRetry(item: WebhookQueueItem): Promise<void> {
    const delay = this.calculateRetryDelay(item.retryCount)
    const nextRetryAt = new Date(Date.now() + delay).toISOString()

    const updatedItem: WebhookQueueItem = {
      ...item,
      scheduledFor: nextRetryAt,
    }
    webhookQueueManager.remove(item.id)
    webhookQueueManager.enqueue(updatedItem)
  }

  private calculateRetryDelay(retryCount: number): number {
    const baseDelayMs = 1000
    const maxDelayMs = 30000

    let delay = baseDelayMs * Math.pow(2, retryCount)
    delay = Math.min(delay, maxDelayMs)

    const jitterRange = delay * 0.1
    const jitter = (Math.random() - 0.5) * jitterRange
    delay += jitter

    return Math.max(0, Math.floor(delay))
  }

  stopQueueProcessor(): void {
    webhookQueueManager.stopProcessor()
  }

  async retryDeadLetterWebhook(id: string): Promise<boolean> {
    return deadLetterManager.retry(id, async item => {
      webhookQueueManager.enqueue(item)
      webhookQueueManager.startProcessor(async queueItem => {
        await this.processQueueItem(queueItem)
      })
    })
  }

  async getQueueStats() {
    return {
      pending: await webhookQueueManager.getQueueSize(),
      deadLetter: await deadLetterManager.getDeadLetterCount(),
      isProcessing: webhookQueueManager.isRunning(),
      nextScheduled: await webhookQueueManager.getNextScheduledTime(),
    }
  }

  private getCircuitBreakerKey(webhook: Webhook): string {
    if (!this.circuitBreakerKeys.has(webhook.id)) {
      const key = `webhook:${webhook.url}`
      this.circuitBreakerKeys.set(webhook.id, key)
    }
    return this.circuitBreakerKeys.get(webhook.id)!
  }
}

export const webhookQueueSystem = new WebhookQueueSystem()
