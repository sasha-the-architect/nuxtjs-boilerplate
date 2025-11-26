import { getQuery, setResponseStatus } from 'h3'
import { apiAnalytics } from '../../utils/api-analytics'
import { cacheManager } from '../../utils/cache'
import { logError } from '../../../utils/errorLogger'

/**
 * GET /api/v1/analytics
 *
 * Retrieve API performance and usage analytics
 *
 * Query parameters:
 * - type: Type of analytics to retrieve (performance, endpoints, trends)
 * - hours: Number of hours to look back (default: 1)
 * - endpoint: Specific endpoint to analyze (optional)
 * - limit: Number of results to return for top endpoints (default: 10)
 */
export default defineEventHandler(async event => {
  const startTime = Date.now()

  try {
    const query = getQuery(event)

    // Generate cache key based on query parameters
    const cacheKey = `analytics:${JSON.stringify(query)}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      // Track performance metrics
      const responseTime = Date.now() - startTime
      await apiAnalytics.trackMetrics(event, responseTime)
      return cachedResult
    }

    const type = (query.type as string) || 'performance'
    const hours = parseInt(query.hours as string) || 1
    const endpoint = query.endpoint as string | undefined
    const limit = parseInt(query.limit as string) || 10

    let result: any

    switch (type) {
      case 'performance':
        result = await apiAnalytics.getPerformanceSummary(hours, endpoint)
        break
      case 'endpoints':
        result = await apiAnalytics.getTopEndpoints(hours, limit)
        break
      case 'trends':
        result = await apiAnalytics.getPerformanceTrends(hours, 60) // 60 minute intervals
        break
      default:
        setResponseStatus(event, 400)
        return {
          success: false,
          message:
            'Invalid analytics type. Valid options: performance, endpoints, trends',
          error: 'Bad Request',
        }
    }

    const response = {
      success: true,
      type,
      data: result,
      timestamp: new Date().toISOString(),
    }

    // Cache the result for 5 minutes (300 seconds) since analytics change slowly
    await cacheManager.set(cacheKey, response, 300)

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')

    // Set success response status
    setResponseStatus(event, 200)

    // Track performance metrics
    const responseTime = Date.now() - startTime
    await apiAnalytics.trackMetrics(event, responseTime)

    return response
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-analytics',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    // Track performance metrics for error case
    const responseTime = Date.now() - startTime
    await apiAnalytics.trackMetrics(event, responseTime)

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
