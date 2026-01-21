import { getQuery } from 'h3'
import type { Resource } from '~/types/resource'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'

/**
 * GET /api/search/suggestions
 *
 * Generate search suggestions based on query
 *
 * Query parameters:
 * - q: Search query term
 * - limit: Number of suggestions to return (default: 5, max: 10)
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting for search suggestions endpoint
    await rateLimit(event)

    // Get query parameters
    const query = getQuery(event)

    // Validate and parse query parameter
    let searchQuery = ''
    if (query.q !== undefined) {
      searchQuery = query.q as string
      if (typeof searchQuery !== 'string') {
        return sendBadRequestError(
          event,
          'Invalid search query parameter. Must be a string.'
        )
      }
    }

    // Validate and parse limit parameter
    let limit = 5 // default
    if (query.limit !== undefined) {
      const parsedLimit = parseInt(query.limit as string)
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 10) // max 10 suggestions
      } else {
        return sendBadRequestError(
          event,
          'Invalid limit parameter. Must be a positive integer.'
        )
      }
    }

    // Generate cache key based on query parameters
    const cacheKey = `suggestions:${searchQuery}:${limit}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return sendSuccessResponse(event, cachedResult)
    }

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Import the suggestions composable
    const { useSearchSuggestions } =
      await import('~/composables/useSearchSuggestions')

    // Create suggestions engine
    const { getSearchSuggestions } = useSearchSuggestions(resources)

    // Generate suggestions
    const suggestions = getSearchSuggestions(searchQuery, limit)

    // Cache result with tags for easier invalidation
    // Use shorter TTL for suggestions since they change more frequently
    const responseData = {
      data: suggestions,
      query: searchQuery,
      limit: limit,
      timestamp: new Date().toISOString(),
    }
    await cacheSetWithTags(cacheKey, responseData, 60, [
      'search',
      'suggestions',
      'api',
    ])

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Return standardized success response
    return sendSuccessResponse(event, {
      data: suggestions,
      query: searchQuery,
      limit: limit,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
