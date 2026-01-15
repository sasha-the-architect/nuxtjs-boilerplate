import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const id = event.context.params?.id as string

    if (!id) {
      sendNotFoundError(event, 'API Key', 'id')
      return
    }

    // Find API key by ID
    const apiKey = webhookStorage.getApiKeyById(id)
    if (!apiKey) {
      sendNotFoundError(event, 'API Key', id)
      return
    }

    // Remove API key
    const deleted = webhookStorage.deleteApiKey(id)
    if (!deleted) {
      sendNotFoundError(event, 'API Key', id)
      return
    }

    sendSuccessResponse(event, {
      message: 'API key deleted successfully',
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
