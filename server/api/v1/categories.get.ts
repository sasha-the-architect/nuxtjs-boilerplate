import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager } from '../../utils/enhanced-cache'

/**
 * GET /api/v1/categories
 *
 * Retrieve a list of all available categories with counts
 */
export default defineEventHandler(async event => {
  try {
    // Try to get from cache first
    const cacheKey = 'categories:all'
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      return cachedResult
    }

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

    // Prepare response
    const response = {
      success: true,
      data: categories,
    }

    // Cache the result for 1 hour (3600 seconds) since categories don't change often
    await cacheManager.set(cacheKey, response, 3600)

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')

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
