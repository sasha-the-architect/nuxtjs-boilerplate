import { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

/**
 * GET /api/v1/categories
 *
 * Retrieve a list of all available categories with counts
 */
export default defineEventHandler(async event => {
  try {
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

    return {
      success: true,
      data: categories,
    }
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
