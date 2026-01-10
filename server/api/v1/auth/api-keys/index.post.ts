import type { ApiKey } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendSuccessResponse,
  sendValidationError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { createApiKeySchema } from '~/server/utils/validation-schemas'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const body = await readBody(event)

    // Validate using Zod schema
    const validationResult = createApiKeySchema.safeParse(body)

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

    // Generate API key
    const apiKey = `ak_${randomUUID().replace(/-/g, '')}`

    const newKey: ApiKey = {
      id: `key_${randomUUID()}`,
      name: validatedData.name,
      key: apiKey,
      permissions: validatedData.scopes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: validatedData.expiresIn
        ? new Date(Date.now() + validatedData.expiresIn * 1000).toISOString()
        : undefined,
      active: true,
    }

    webhookStorage.createApiKey(newKey)

    // Return key with actual API key value
    sendSuccessResponse(event, newKey)
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
