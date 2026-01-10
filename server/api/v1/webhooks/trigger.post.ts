import type { WebhookEvent, WebhookPayload } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { webhookQueueSystem } from '~/server/utils/webhookQueue'
import {
  sendBadRequestError,
  sendSuccessResponse,
  sendValidationError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { triggerWebhookSchema } from '~/server/utils/validation-schemas'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)

    // Validate using Zod schema
    const validationResult = triggerWebhookSchema.safeParse(body)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return sendValidationError(
        event,
        firstError.path[0] as string,
        firstError.message,
        (firstError as any).received
      )
    }

    const validatedData = validationResult.data

    const idempotencyKey =
      validatedData.idempotencyKey ||
      `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const existingDelivery =
      webhookStorage.getDeliveryByIdempotencyKey(idempotencyKey)
    if (existingDelivery) {
      sendSuccessResponse(event, {
        message: 'Webhook already delivered (idempotent request)',
        triggered: 0,
        queued: 0,
        existingDelivery: {
          id: existingDelivery.id,
          status: existingDelivery.status,
          createdAt: existingDelivery.createdAt,
        },
      })
      return
    }

    const webhooks = webhookStorage.getWebhooksByEvent(
      validatedData.event as WebhookEvent
    )

    if (webhooks.length === 0) {
      sendSuccessResponse(event, {
        message: 'No webhooks to trigger',
        triggered: 0,
        queued: 0,
      })
      return
    }

    const payload: WebhookPayload = {
      event: validatedData.event as WebhookEvent,
      data: validatedData.data,
      timestamp: new Date().toISOString(),
      idempotencyKey,
    }

    let queuedWebhooks = 0
    for (const webhook of webhooks) {
      await webhookQueueSystem.deliverWebhook(webhook, payload, {
        async: true,
        maxRetries: 3,
        priority: 0,
      })
      queuedWebhooks++
    }

    const queueStats = webhookQueueSystem.getQueueStats()

    sendSuccessResponse(event, {
      message: `Queued ${queuedWebhooks} webhooks for async delivery for event: ${validatedData.event}`,
      triggered: webhooks.length,
      queued: queuedWebhooks,
      idempotencyKey,
      queueStats: {
        pending: queueStats.pending,
        nextScheduled: queueStats.nextScheduled,
      },
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
