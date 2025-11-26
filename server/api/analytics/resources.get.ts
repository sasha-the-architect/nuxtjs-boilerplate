// server/api/analytics/resources.get.ts
// Resource-specific analytics API endpoint

import { analyticsStorage, ResourceMetrics } from '~/utils/analytics'

export default defineEventHandler(async event => {
  try {
    const query = getQuery(event)
    const resourceId = query.resourceId as string | undefined
    const limit = parseInt(query.limit as string) || 10

    let resourceMetrics = await analyticsStorage.getResourceMetrics(resourceId)

    // Sort by clicks (most popular first)
    resourceMetrics = resourceMetrics
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit)

    return {
      success: true,
      data: resourceMetrics,
      count: resourceMetrics.length,
    }
  } catch (error) {
    console.error('Error fetching resource analytics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch resource analytics',
    })
  }
})
