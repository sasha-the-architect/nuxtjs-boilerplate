import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

/**
 * GET /api/v1/categories
 *
 * Retrieve a list of all available categories with counts
 */
export default defineEventHandler(async event => {
  await rateLimit(event)

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

    // Cache result for 1 hour (3600 seconds) since categories don't change often
    const response = { success: true, data: categories }
    await cacheManager.set(cacheKey, response, 3600)

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')

    return sendSuccessResponse(event, categories)
  } catch (error) {
    // Log error using our error logging service
    logError(
      `Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-categories'
    )

    return handleApiRouteError(event, error)
  }
})
