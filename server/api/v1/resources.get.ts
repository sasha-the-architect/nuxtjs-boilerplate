import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { convertResourcesToHierarchicalTags } from '~/utils/tags'
import {
  sendSuccessResponse,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'

/**
 * GET /api/v1/resources
 *
 * Retrieve a list of resources with optional filtering and pagination
 *
 * Query parameters:
 * - limit: Number of resources to return (default: 20, max: 100)
 * - offset: Number of resources to skip (default: 0)
 * - category: Filter by category
 * - pricing: Filter by pricing model
 * - difficulty: Filter by difficulty level
 * - search: Search term to filter by title/description
 * - sort: Sort option (default: 'popularity-desc')
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    // Generate cache key based on query parameters
    const query = getQuery(event)
    const cacheKey = `resources:${JSON.stringify(query)}`

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

    // Validate and parse other parameters
    const category = query.category as string | undefined
    const pricing = query.pricing as string | undefined
    const difficulty = query.difficulty as string | undefined
    const search = query.search as string | undefined
    const sort = query.sort as string | undefined

    // Validate sort parameter
    const validSortOptions = [
      'alphabetical-asc',
      'alphabetical-desc',
      'date-added-desc',
      'popularity-desc',
    ]
    if (sort && !validSortOptions.includes(sort)) {
      return sendBadRequestError(
        event,
        `Invalid sort parameter. Valid options: ${validSortOptions.join(', ')}`
      )
    }

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

    if (search) {
      const searchTerm = search.toLowerCase()
      resources = resources.filter(
        resource =>
          resource.title.toLowerCase().includes(searchTerm) ||
          resource.description.toLowerCase().includes(searchTerm) ||
          resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply sorting
    switch (sort) {
      case 'alphabetical-asc':
        resources.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'alphabetical-desc':
        resources.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'date-added-desc':
        resources.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        )
        break
      case 'popularity-desc':
      default:
        resources.sort((a, b) => b.popularity - a.popularity)
        break
    }

    // Apply pagination BEFORE hierarchical tag conversion for performance
    const total = resources.length
    const paginatedResources = resources.slice(offset, offset + limit)

    // Convert only paginated resources to include hierarchical tags
    const resourcesWithHierarchicalTags =
      convertResourcesToHierarchicalTags(paginatedResources)

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
    await cacheSetWithTags(cacheKey, response, 300, [
      'resources',
      'api-v1',
      'list',
    ])

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response
    return sendSuccessResponse(event, response)
  } catch (error) {
    // Log error using our error logging service
    logError(
      `Error fetching resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-resources',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    return handleApiRouteError(event, error)
  }
})
