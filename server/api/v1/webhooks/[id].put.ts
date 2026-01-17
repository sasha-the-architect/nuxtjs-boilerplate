import type { UpdateWebhookRequest } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { updateWebhookSchema } from '~/server/utils/validation-schemas'
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

    const validationResult = updateWebhookSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map(e => e.message)
        .join(', ')
      sendBadRequestError(event, errorMessages)
      return
    }

    const validatedBody = validationResult.data

    // Find webhook by ID
    const existingWebhook = webhookStorage.getWebhookById(id)
    if (!existingWebhook) {
      sendNotFoundError(event, 'Webhook', id)
      return
    }

    // Update webhook
    const updatedWebhook = webhookStorage.updateWebhook(id, validatedBody)
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
