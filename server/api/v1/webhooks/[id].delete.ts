import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  sendNotFoundError,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const id = event.context.params?.id

    // Find webhook by ID
    const webhook = webhookStorage.getWebhookById(id as string)
    if (!webhook) {
      return sendNotFoundError(event, 'Webhook', id)
    }

    // Remove webhook
    const deleted = webhookStorage.deleteWebhook(id as string)
    if (!deleted) {
      return sendNotFoundError(event, 'Webhook', id)
    }

    return sendSuccessResponse(event, {
      message: 'Webhook deleted successfully',
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
