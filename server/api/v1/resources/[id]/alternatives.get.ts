import { getQuery, setResponseHeader, setResponseStatus } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import {
  cacheManager,
  cacheSetWithTags,
  invalidateCacheByTag,
} from '../../../../utils/enhanced-cache'
import {
  rateLimit,
  getRateLimiterForPath,
} from '../../../../utils/enhanced-rate-limit'
import {
  useAlternatives,
  type Alternative,
} from '~/composables/useAlternatives'

/**
 * GET /api/v1/resources/[id]/alternatives
 *
 * Retrieve alternative resources for a specific resource
 *
 * Path parameters:
 * - id: The ID of the resource to find alternatives for
 *
 * Query parameters:
 * - limit: Number of alternatives to return (default: 6, max: 12)
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    // Extract resource ID from path
    const resourceId = event.context.params?.id
    if (!resourceId) {
      setResponseStatus(event, 400)
      return {
        success: false,
        message: 'Resource ID is required',
        error: 'Bad Request',
      }
    }

    // Generate cache key based on resource ID and query parameters
    const query = getQuery(event)
    const limit = Math.min(parseInt(query.limit as string) || 6, 12)
    const cacheKey = `alternatives:${resourceId}:${limit}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return cachedResult
    }

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Find the current resource
    const currentResource = resources.find(r => r.id === resourceId)
    if (!currentResource) {
      setResponseStatus(event, 404)
      return {
        success: false,
        message: 'Resource not found',
        error: 'Not Found',
      }
    }

    // Use the useAlternatives composable to find alternatives
    const alternativesComposable = useAlternatives(resources)
    const alternatives = alternativesComposable.findAlternatives(
      currentResource,
      limit
    )

    // Prepare response
    const response = {
      success: true,
      data: alternatives,
      resourceId,
      count: alternatives.length,
    }

    // Cache the result with tags for easier invalidation
    await cacheSetWithTags(cacheKey, response, 300, [
      'alternatives',
      'api-v1',
      'resource',
      resourceId,
    ])

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response
    setResponseStatus(event, 200)
    return response
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching alternatives for resource ${event.context.params?.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-resources-alternatives',
      {
        resourceId: event.context.params?.id,
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while fetching alternatives',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
