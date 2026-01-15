// server/api/analytics/resource/[id].get.ts
// API endpoint for retrieving analytics data for a specific resource
import { defineEventHandler, getQuery } from 'h3'
import { getResourceAnalytics } from '~/server/utils/analytics-db'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const resourceId = event.context.params?.id

    if (!resourceId) {
      return sendBadRequestError(event, 'Resource ID is required')
    }

    // Parse date range from query parameters
    const query = getQuery(event)
    const startDate = query.startDate
      ? new Date(query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default to last 30 days
    const endDate = query.endDate
      ? new Date(query.endDate as string)
      : new Date()

    // Get resource analytics from database
    const analyticsData = await getResourceAnalytics(
      resourceId,
      startDate,
      endDate
    )

    const responseData = {
      analytics: analyticsData,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    }

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    console.error('Resource analytics error:', error)
    return handleApiRouteError(event, error)
  }
})
