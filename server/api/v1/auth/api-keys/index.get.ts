import { webhookStorage } from '~/server/utils/webhookStorage'
import { sendSuccessResponse } from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  // This would typically filter by user in a real implementation
  // For now, return all keys
  const apiKeys = webhookStorage.getAllApiKeys()
  const keysWithoutSecrets = apiKeys.map(({ key: _key, ...key }) => key)

  return sendSuccessResponse(event, {
    data: keysWithoutSecrets,
    count: keysWithoutSecrets.length,
  })
})
