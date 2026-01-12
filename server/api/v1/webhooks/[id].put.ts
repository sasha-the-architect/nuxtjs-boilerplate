import type { UpdateWebhookRequest } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const id = event.context.params?.id as string
    const body = await readBody<UpdateWebhookRequest>(event)

    // Find webhook by ID
    const existingWebhook = webhookStorage.getWebhookById(id)
    if (!existingWebhook) {
      sendNotFoundError(event, 'Webhook', id)
      return
    }

    // Validate URL if provided
    if (body.url) {
      try {
        new URL(body.url)
      } catch {
        sendBadRequestError(event, 'Invalid URL format')
        return
      }
    }

    // Update webhook
    const updatedWebhook = webhookStorage.updateWebhook(id, body)
    if (!updatedWebhook) {
      sendNotFoundError(event, 'Webhook', id)
      return
    }

    // Return without secret for security
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { secret: _secretValue, ...webhookWithoutSecret } = updatedWebhook

    sendSuccessResponse(event, webhookWithoutSecret)
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
