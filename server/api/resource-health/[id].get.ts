import { getRouterParam } from 'h3'
import { getResourceHealthStatus } from '../../utils/resourceHealth'
import {
  sendSuccessResponse,
  sendNotFoundError,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      return sendBadRequestError(event, 'Resource ID is required')
    }

    const healthStatus = getResourceHealthStatus(id)

    if (!healthStatus) {
      return sendNotFoundError(event, 'Resource health status', id)
    }

    return sendSuccessResponse(event, healthStatus)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
