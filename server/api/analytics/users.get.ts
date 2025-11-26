// server/api/analytics/users.get.ts
// User behavior analytics API endpoint

import { analyticsStorage, UserMetrics } from '~/utils/analytics'

export default defineEventHandler(async event => {
  try {
    const query = getQuery(event)
    const limit = parseInt(query.limit as string) || 10

    const userMetrics = await analyticsStorage.getUserMetrics()

    // Sort by page views (most active sessions first)
    const sortedUserMetrics = userMetrics
      .sort((a, b) => b.pageViews - a.pageViews)
      .slice(0, limit)

    // Get device type distribution
    const deviceDistribution = sortedUserMetrics.reduce(
      (acc: Record<string, number>, metric) => {
        const deviceType = metric.deviceType
        acc[deviceType] = (acc[deviceType] || 0) + 1
        return acc
      },
      {}
    )

    return {
      success: true,
      data: sortedUserMetrics,
      deviceDistribution,
      count: sortedUserMetrics.length,
    }
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user analytics',
    })
  }
})
