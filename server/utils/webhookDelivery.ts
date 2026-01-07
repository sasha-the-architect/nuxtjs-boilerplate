import type { Webhook, WebhookPayload, WebhookDelivery } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from './webhookStorage'
import { getCircuitBreaker, getAllCircuitBreakerStats } from './circuit-breaker'
import { retryWithResult, retryPresets } from './retry'
import { createCircuitBreakerError } from './api-error'

export class WebhookDeliveryService {
  async deliverWebhook(
    webhook: Webhook,
    payload: WebhookPayload
  ): Promise<boolean> {
    const circuitBreakerKey = `webhook:${webhook.url}`
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 60000,
    })

    return circuitBreaker.execute(
      async () => {
        // Generate signature for security
        const signature = this.generateSignature(payload, webhook.secret || '')
        payload.signature = signature

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
            },
            body: JSON.stringify(payload),
            timeout: 10000,
          })

          responseCode = 200
          responseMessage = 'OK'
          success = true
        } catch (error: any) {
          responseCode = error.status || 0
          responseMessage = error.message || 'Unknown error'
          success = false
        }

        // Create delivery record
        const delivery: WebhookDelivery = {
          id: `del_${randomUUID()}`,
          webhookId: webhook.id,
          event: payload.event,
          payload,
          status: success ? 'success' : 'failed',
          responseCode,
          responseMessage,
          attemptCount: 1,
          createdAt: new Date().toISOString(),
        }

        webhookStorage.createDelivery(delivery)

        // Update webhook stats
        webhookStorage.updateWebhook(webhook.id, {
          lastDeliveryAt: new Date().toISOString(),
          lastDeliveryStatus: success ? 'success' : 'failed',
          deliveryCount: webhook.deliveryCount + 1,
          failureCount: success
            ? webhook.failureCount
            : webhook.failureCount + 1,
        })

        return success
      },
      () => false
    )
  }

  async deliverWebhookWithRetry(
    webhook: Webhook,
    payload: WebhookPayload
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
            // Generate signature for security
            const signature = this.generateSignature(
              payload,
              webhook.secret || ''
            )
            payload.signature = signature

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
                },
                body: JSON.stringify(payload),
                timeout: 10000,
              })

              responseCode = 200
              responseMessage = 'OK'
              success = true
            } catch (error: any) {
              responseCode = error.status || 0
              responseMessage = error.message || 'Unknown error'
              success = false
              throw error
            }

            // Create delivery record
            const delivery: WebhookDelivery = {
              id: `del_${randomUUID()}`,
              webhookId: webhook.id,
              event: payload.event,
              payload,
              status: success ? 'success' : 'failed',
              responseCode,
              responseMessage,
              attemptCount: 1,
              createdAt: new Date().toISOString(),
            }

            webhookStorage.createDelivery(delivery)

            // Update webhook stats
            webhookStorage.updateWebhook(webhook.id, {
              lastDeliveryAt: new Date().toISOString(),
              lastDeliveryStatus: success ? 'success' : 'failed',
              deliveryCount: webhook.deliveryCount + 1,
              failureCount: success
                ? webhook.failureCount
                : webhook.failureCount + 1,
            })

            return success
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
        maxRetries: 3,
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

  getWebhookDeliveryStats() {
    return getAllCircuitBreakerStats()
  }

  private generateSignature(payload: WebhookPayload, secret: string): string {
    // Create HMAC signature using the secret
    const crypto = require('node:crypto')
    const payloadString = JSON.stringify(payload)
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex')

    return `v1=${signature}`
  }
}

export const webhookDeliveryService = new WebhookDeliveryService()
