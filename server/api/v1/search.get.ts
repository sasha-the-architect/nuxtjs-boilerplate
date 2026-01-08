import { defineEventHandler, getQuery } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import {
  cacheManager,
  cacheSetWithTags,
  invalidateCacheByTag,
} from '~/server/utils/enhanced-cache'
import {
  rateLimit,
  getRateLimiterForPath,
} from '~/server/utils/enhanced-rate-limit'
import {
  filterResourcesByHierarchicalTags,
  convertResourcesToHierarchicalTags,
} from '~/utils/tags'
import {
  sendSuccessResponse,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'

/**
 * GET /api/v1/search
 *
 * Search resources with advanced filtering options
 *
 * Query parameters:
 * - q: Search query term
 * - limit: Number of resources to return (default: 20, max: 100)
 * - offset: Number of resources to skip (default: 0)
 * - category: Filter by category
 * - pricing: Filter by pricing model
 * - difficulty: Filter by difficulty level
 * - tags: Filter by tags (comma-separated)
 * - hierarchicalTags: Filter by hierarchical tags (comma-separated)
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting for search endpoint (which is more restrictive)
    await rateLimit(event)

    // Generate cache key based on query parameters
    const query = getQuery(event)
    const cacheKey = `search:${JSON.stringify(query)}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return cachedResult
    }

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Parse query parameters with validation
    // Validate and parse limit parameter
    let limit = 20 // default
    if (query.limit !== undefined) {
      const parsedLimit = parseInt(query.limit as string)
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 100) // max 100
      } else {
        return sendBadRequestError(
          event,
          'Invalid limit parameter. Must be a positive integer.'
        )
      }
    }

    // Validate and parse offset parameter
    let offset = 0 // default
    if (query.offset !== undefined) {
      const parsedOffset = parseInt(query.offset as string)
      if (!isNaN(parsedOffset) && parsedOffset >= 0) {
        offset = parsedOffset
      } else {
        return sendBadRequestError(
          event,
          'Invalid offset parameter. Must be a non-negative integer.'
        )
      }
    }

    // Parse other parameters
    const searchQuery = query.q as string | undefined
    const category = query.category as string | undefined
    const pricing = query.pricing as string | undefined
    const difficulty = query.difficulty as string | undefined
    const tagsParam = query.tags as string | undefined
    const hierarchicalTagsParam = query.hierarchicalTags as string | undefined

    // Apply filters
    if (category) {
      resources = resources.filter(
        resource => resource.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (pricing) {
      resources = resources.filter(
        resource =>
          resource.pricingModel.toLowerCase() === pricing.toLowerCase()
      )
    }

    if (difficulty) {
      resources = resources.filter(
        resource =>
          resource.difficulty.toLowerCase() === difficulty.toLowerCase()
      )
    }

    if (tagsParam) {
      // Validate tags parameter - ensure it's a string before splitting
      if (typeof tagsParam === 'string') {
        const tags = tagsParam.split(',').map(tag => tag.trim().toLowerCase())
        resources = resources.filter(resource =>
          resource.tags.some(tag => tags.includes(tag.toLowerCase()))
        )
      } else {
        return sendBadRequestError(
          event,
          'Invalid tags parameter. Must be a comma-separated string.'
        )
      }
    }

    // Apply hierarchical tags filter if provided
    if (hierarchicalTagsParam) {
      if (typeof hierarchicalTagsParam === 'string') {
        const hierarchicalTagIds = hierarchicalTagsParam
          .split(',')
          .map(tagId => tagId.trim())
        resources = filterResourcesByHierarchicalTags(
          resources,
          hierarchicalTagIds
        )
      } else {
        return sendBadRequestError(
          event,
          'Invalid hierarchicalTags parameter. Must be a comma-separated string.'
        )
      }
    }

    // Apply search if query exists
    if (searchQuery) {
      if (typeof searchQuery !== 'string') {
        return sendBadRequestError(
          event,
          'Invalid search query parameter. Must be a string.'
        )
      }
      const searchTerm = searchQuery.toLowerCase()
      resources = resources.filter(
        resource =>
          resource.title.toLowerCase().includes(searchTerm) ||
          resource.description.toLowerCase().includes(searchTerm) ||
          resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Convert resources to include hierarchical tags
    const resourcesWithHierarchicalTags =
      convertResourcesToHierarchicalTags(resources)

    // Apply pagination
    const total = resourcesWithHierarchicalTags.length
    const paginatedResources = resourcesWithHierarchicalTags.slice(
      offset,
      offset + limit
    )

    // Prepare response
    const response = {
      success: true,
      data: paginatedResources,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    }

    // Cache the result with tags for easier invalidation
    // Use shorter TTL for search results since they change more frequently
    await cacheSetWithTags(cacheKey, response, 120, [
      'search',
      'api-v1',
      'search-results',
    ])

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response
    return sendSuccessResponse(event, response)
  } catch (error) {
    // Log error using our error logging service
    logError(
      `Error searching resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-search',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    return handleApiRouteError(event, error)
  }
})
