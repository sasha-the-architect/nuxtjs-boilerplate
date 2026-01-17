import type { CreateWebhookRequest, Webhook } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { createWebhookSchema } from '~/server/utils/validation-schemas'
import {
  sendSuccessResponse,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const body = await readBody<CreateWebhookRequest>(event)

    const validationResult = createWebhookSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map(e => e.message)
        .join(', ')
      return sendBadRequestError(event, errorMessages)
    }

    const validatedBody = validationResult.data

    // Generate secret for webhook
    const secret = `whsec_${randomUUID()}`

    const newWebhook: Webhook = {
      id: `wh_${randomUUID()}`,
      url: validatedBody.url,
      events: validatedBody.events,
      active: validatedBody.active ?? true,
      secret,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryCount: 0,
      failureCount: 0,
    }

    webhookStorage.createWebhook(newWebhook)

    // Return without secret for security
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { secret: _secretValue, ...webhookWithoutSecret } = newWebhook

    return sendSuccessResponse(event, webhookWithoutSecret)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
