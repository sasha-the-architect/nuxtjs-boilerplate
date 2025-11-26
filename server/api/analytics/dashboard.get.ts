// server/api/analytics/dashboard.get.ts
// Analytics dashboard API endpoint

import { analyticsStorage } from '~/utils/analytics'

export default defineEventHandler(async event => {
  try {
    const query = getQuery(event)
    const dateFrom = query.from ? new Date(query.from as string) : undefined
    const dateTo = query.to ? new Date(query.to as string) : undefined

    // For this implementation, we're using in-memory storage
    // In a real implementation, this would filter data based on date range
    const metrics = await analyticsStorage.getDashboardMetrics()

    // Add date filtering if needed (though our in-memory implementation doesn't support it yet)
    return {
      success: true,
      data: metrics,
      dateRange: {
        from: dateFrom ? dateFrom.toISOString() : null,
        to: dateTo ? dateTo.toISOString() : null,
      },
    }
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch analytics dashboard',
    })
  }
})
