/**
 * GET /api/resource-health
 *
 * Retrieve health status of all resources
 */

import {
  getAllResourceHealthStatuses,
  getResourceHealthStats,
} from '../utils/resourceHealth'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const healthStatuses = getAllResourceHealthStatuses()
    const stats = getResourceHealthStats()

    return sendSuccessResponse(event, {
      resources: healthStatuses,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
