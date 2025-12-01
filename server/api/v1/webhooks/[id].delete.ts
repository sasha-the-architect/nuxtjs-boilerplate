import { webhookStorage } from '~/server/utils/webhookStorage'

export default defineEventHandler(async event => {
  const id = event.context.params?.id

  // Find webhook by ID
  const webhook = webhookStorage.getWebhookById(id)
  if (!webhook) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Webhook not found',
    })
  }

  // Remove the webhook
  const deleted = webhookStorage.deleteWebhook(id)
  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Webhook not found',
    })
  }

  return {
    success: true,
    message: 'Webhook deleted successfully',
  }
})
