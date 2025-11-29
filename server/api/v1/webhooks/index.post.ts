import type { CreateWebhookRequest, Webhook } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from '~/server/utils/webhookStorage'

export default defineEventHandler(async event => {
  const body = await readBody<CreateWebhookRequest>(event)

  // Validate required fields
  if (
    !body.url ||
    !body.events ||
    !Array.isArray(body.events) ||
    body.events.length === 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL and events are required',
    })
  }

  // Validate URL format
  try {
    new URL(body.url)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid URL format',
    })
  }

  // Generate secret for webhook
  const secret = `whsec_${randomUUID()}`

  const newWebhook: Webhook = {
    id: `wh_${randomUUID()}`,
    url: body.url,
    events: body.events,
    active: body.active ?? true,
    secret,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deliveryCount: 0,
    failureCount: 0,
  }

  webhookStorage.createWebhook(newWebhook)

  // Return without the secret for security
  const { secret: _, ...webhookWithoutSecret } = newWebhook

  return {
    success: true,
    data: webhookWithoutSecret,
  }
})
