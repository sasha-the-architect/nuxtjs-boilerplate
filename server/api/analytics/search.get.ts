// server/api/analytics/search.get.ts
// Search analytics API endpoint

import { analyticsStorage, SearchMetrics } from '~/utils/analytics'

export default defineEventHandler(async event => {
  try {
    const query = getQuery(event)
    const searchQuery = query.query as string | undefined
    const limit = parseInt(query.limit as string) || 10

    let searchMetrics = await analyticsStorage.getSearchMetrics(searchQuery)

    // Sort by count (most popular first)
    searchMetrics = searchMetrics
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return {
      success: true,
      data: searchMetrics,
      count: searchMetrics.length,
    }
  } catch (error) {
    console.error('Error fetching search analytics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch search analytics',
    })
  }
})
