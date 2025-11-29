import type { WebhookEvent, WebhookPayload } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { webhookDeliveryService } from '~/server/utils/webhookDelivery'

export default defineEventHandler(async event => {
  const body = await readBody<{
    event: WebhookEvent
    data: any
  }>(event)

  if (!body.event) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event type is required',
    })
  }

  // Find active webhooks that listen to this event
  const webhooks = webhookStorage.getWebhooksByEvent(body.event)

  if (webhooks.length === 0) {
    return {
      success: true,
      message: 'No webhooks to trigger',
      triggered: 0,
    }
  }

  // Create payload
  const payload: WebhookPayload = {
    event: body.event,
    data: body.data,
    timestamp: new Date().toISOString(),
  }

  // Trigger webhooks in the background
  let successfulDeliveries = 0
  for (const webhook of webhooks) {
    const success = await webhookDeliveryService.deliverWebhookWithRetry(
      webhook,
      payload
    )
    if (success) {
      successfulDeliveries++
    }
  }

  return {
    success: true,
    message: `Triggered ${webhooks.length} webhooks for event: ${body.event}, ${successfulDeliveries} successful`,
    triggered: webhooks.length,
    successful: successfulDeliveries,
  }
})
