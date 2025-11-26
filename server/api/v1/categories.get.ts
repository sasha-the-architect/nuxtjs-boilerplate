import { setResponseHeader } from 'h3'
import { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { ServerCache } from '~/server/utils/cache'

/**
 * GET /api/v1/categories
 *
 * Retrieve a list of all available categories with counts
 */
export default defineEventHandler(async event => {
  try {
    // Check cache first
    const cache = ServerCache.getInstance()
    const cacheKey = ServerCache.getApiCacheKey(event, 'api:v1:categories')

    // Try to get from cache
    const cachedResult = await cache.get(cacheKey)
    if (cachedResult) {
      // Set cache hit header
      setResponseHeader(event, 'X-Cache', 'HIT')
      return cachedResult
    }

    // Set cache miss header
    setResponseHeader(event, 'X-Cache', 'MISS')

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Get unique categories with counts
    const categoryMap = new Map<string, number>()

    resources.forEach(resource => {
      const count = categoryMap.get(resource.category) || 0
      categoryMap.set(resource.category, count + 1)
    })

    const categories = Array.from(categoryMap.entries()).map(
      ([name, count]) => ({
        name,
        count,
      })
    )

    const response = {
      success: true,
      data: categories,
    }

    // Cache the response for 1 hour (3600 seconds) since categories rarely change
    await cache.set(cacheKey, response, { ttl: 3600 }) // Cache for 1 hour

    return response
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-categories'
    )

    return {
      success: false,
      message: 'An error occurred while fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
