import { webhookStorage } from '~/server/utils/webhookStorage'

export default defineEventHandler(async event => {
  const id = event.context.params?.id

  // Find API key by ID
  const apiKey = webhookStorage.getApiKeyById(id)
  if (!apiKey) {
    throw createError({
      statusCode: 404,
      statusMessage: 'API key not found',
    })
  }

  // Remove the API key
  const deleted = webhookStorage.deleteApiKey(id)
  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'API key not found',
    })
  }

  return {
    success: true,
    message: 'API key deleted successfully',
  }
})
