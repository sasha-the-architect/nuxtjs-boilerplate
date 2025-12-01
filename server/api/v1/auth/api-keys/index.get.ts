import type { ApiKey } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'

export default defineEventHandler(async event => {
  // This would typically filter by user in a real implementation
  // For now, return all keys
  const apiKeys = webhookStorage.getAllApiKeys()
  const keysWithoutSecrets = apiKeys.map(({ key: _, ...key }) => key)

  return {
    success: true,
    data: keysWithoutSecrets,
    count: keysWithoutSecrets.length,
  }
})
