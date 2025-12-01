import type { Webhook, WebhookPayload, WebhookDelivery } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from './webhookStorage'

export class WebhookDeliveryService {
  async deliverWebhook(
    webhook: Webhook,
    payload: WebhookPayload
  ): Promise<boolean> {
    // Generate signature for security
    const signature = this.generateSignature(payload, webhook.secret)
    payload.signature = signature

    let responseCode: number | undefined
    let responseMessage: string | undefined
    let success = false

    try {
      // Send webhook request
      const response = await $fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': payload.event,
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': payload.timestamp,
        },
        body: JSON.stringify(payload),
        timeout: 10000, // 10 second timeout
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
      failureCount: success ? webhook.failureCount : webhook.failureCount + 1,
    })

    return success
  }

  async deliverWebhookWithRetry(
    webhook: Webhook,
    payload: WebhookPayload
  ): Promise<boolean> {
    // Try delivery up to 3 times with exponential backoff
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      const success = await this.deliverWebhook(webhook, payload)

      if (success) {
        return true
      }

      attempt++

      // If we've reached max retries, stop
      if (attempt >= maxRetries) {
        break
      }

      // Wait before retry (exponential backoff: 1s, 2s, 4s)
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      )
    }

    return false
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
