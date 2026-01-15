import { webhookStorage } from '~/server/utils/webhookStorage'
import { sendSuccessResponse } from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  // This would typically filter by user in a real implementation
  // For now, return all keys
  const apiKeys = webhookStorage.getAllApiKeys()
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const keysWithoutSecrets = apiKeys.map(({ key: _key, ...rest }) => rest)

  return sendSuccessResponse(event, {
    data: keysWithoutSecrets,
    count: keysWithoutSecrets.length,
  })
})
