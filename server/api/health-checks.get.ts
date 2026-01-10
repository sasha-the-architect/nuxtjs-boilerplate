import { defineEventHandler } from 'h3'
import { getAllResourceHealthStatuses } from '~/server/utils/resourceHealth'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    const healthStatuses = getAllResourceHealthStatuses()

    const responseData = {
      totalChecks: healthStatuses.length,
      healthStatuses,
      summary: {
        healthy: healthStatuses.filter(h => h.isHealthy).length,
        unhealthy: healthStatuses.filter(h => h.isHealthy === false).length,
        unknown: healthStatuses.filter(h => h.lastStatus === null).length,
      },
      lastUpdated: new Date().toISOString(),
    }

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
