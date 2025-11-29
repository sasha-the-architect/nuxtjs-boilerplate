import { webhookStorage } from '~/server/utils/webhookStorage'

export default defineEventHandler(event => {
  // Only apply to API routes that require authentication
  if (
    !event.path?.startsWith('/api/v1/') ||
    event.path?.startsWith('/api/v1/auth/')
  ) {
    return
  }

  // Check for API key in headers or query
  const apiKey =
    getHeader(event, 'X-API-Key') || (getQuery(event).api_key as string)

  if (!apiKey) {
    // Some routes might be public, so we'll just log this for now
    // In a real implementation, you'd check if the route requires auth
    return
  }

  // Verify API key exists and is active
  const storedKey = webhookStorage.getApiKeyByValue(apiKey)

  if (!storedKey || !storedKey.active) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or inactive API key',
    })
  }

  // Update last used timestamp
  webhookStorage.updateApiKey(storedKey.id, {
    lastUsedAt: new Date().toISOString(),
  })

  // Add key info to event context for use in handlers
  event.context.apiKey = storedKey
})
