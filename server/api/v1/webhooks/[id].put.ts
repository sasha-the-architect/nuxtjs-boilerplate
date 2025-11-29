import type { UpdateWebhookRequest, Webhook } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  const body = await readBody<UpdateWebhookRequest>(event)

  // Find webhook by ID
  const existingWebhook = webhookStorage.getWebhookById(id)
  if (!existingWebhook) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Webhook not found',
    })
  }

  // Validate URL if provided
  if (body.url) {
    try {
      new URL(body.url)
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid URL format',
      })
    }
  }

  // Update webhook
  const updatedWebhook = webhookStorage.updateWebhook(id, body)
  if (!updatedWebhook) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Webhook not found',
    })
  }

  // Return without the secret for security
  const { secret: _, ...webhookWithoutSecret } = updatedWebhook

  return {
    success: true,
    data: webhookWithoutSecret,
  }
})
