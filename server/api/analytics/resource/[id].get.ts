// server/api/analytics/resource/[id].get.ts
// API endpoint for retrieving analytics data for a specific resource
import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { getResourceAnalytics } from '~/server/utils/analytics-db'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const resourceId = event.context.params?.id

    if (!resourceId) {
      setResponseStatus(event, 400)
      return {
        success: false,
        message: 'Resource ID is required',
      }
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

    setResponseStatus(event, 200)
    return {
      success: true,
      data: analyticsData,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    }
  } catch (error: any) {
    console.error('Resource analytics error:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: error.message || 'Internal server error',
    }
  }
})
