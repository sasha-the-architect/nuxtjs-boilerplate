import { getQuery, setResponseStatus } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/utils/enhanced-cache'
import { rateLimit } from '~/utils/enhanced-rate-limit'

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
        setResponseStatus(event, 400)
        return {
          success: false,
          message: 'Invalid search query parameter. Must be a string.',
          error: 'Bad Request',
        }
      }
    }

    // Validate and parse limit parameter
    let limit = 5 // default
    if (query.limit !== undefined) {
      const parsedLimit = parseInt(query.limit as string)
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 10) // max 10 suggestions
      } else {
        // Invalid limit provided, return error
        setResponseStatus(event, 400)
        return {
          success: false,
          message: 'Invalid limit parameter. Must be a positive integer.',
          error: 'Bad Request',
        }
      }
    }

    // Generate cache key based on query parameters
    const cacheKey = `suggestions:${searchQuery}:${limit}`

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

    // Import the suggestions composable
    const { useSearchSuggestions } = await import(
      '~/composables/useSearchSuggestions'
    )

    // Create suggestions engine
    const { getSearchSuggestions } = useSearchSuggestions(resources)

    // Generate suggestions
    const suggestions = getSearchSuggestions(searchQuery, limit)

    const response = {
      success: true,
      data: suggestions,
      query: searchQuery,
      limit: limit,
      timestamp: new Date().toISOString(),
    }

    // Cache the result with tags for easier invalidation
    // Use shorter TTL for suggestions since they change more frequently
    await cacheSetWithTags(cacheKey, response, 60, [
      'search',
      'suggestions',
      'api',
    ])

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response status
    setResponseStatus(event, 200)
    return response
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error in search suggestions API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-search-suggestions',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while generating search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
