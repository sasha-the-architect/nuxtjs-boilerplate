import type { ApiKey } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  await rateLimit(event)
  const body = await readBody<{
    name: string
    permissions?: string[]
    expiresAt?: string
  }>(event)

  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required',
    })
  }

  // Generate API key
  const apiKey = `ak_${randomUUID().replace(/-/g, '')}`

  const newKey: ApiKey = {
    id: `key_${randomUUID()}`,
    name: body.name,
    key: apiKey,
    permissions: body.permissions || ['read'],
    createdAt: new Date().toISOString(),
    expiresAt: body.expiresAt,
    active: true,
  }

  webhookStorage.createApiKey(newKey)

  // Return key with the actual API key value
  return {
    success: true,
    data: newKey,
  }
})
