import { createError, setResponseStatus } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import {
  cacheManager,
  cacheSetWithTags,
  invalidateCacheByTag,
} from '../../../utils/enhanced-cache'
import {
  rateLimit,
  getRateLimiterForPath,
} from '../../../utils/enhanced-rate-limit'
import { convertResourcesToHierarchicalTags } from '~/utils/tags'

/**
 * GET /api/v1/resources/:id
 *
 * Retrieve a specific resource by its ID
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting for individual resource endpoints
    await rateLimit(event)

    // Get the resource ID from the URL parameter
    const id = event.context.params?.id

    if (!id) {
      const error = createError({
        statusCode: 400,
        statusMessage: 'Resource ID is required',
      })
      logError(
        'Resource ID parameter is missing in request',
        error,
        'api-v1-resources-by-id',
        {
          params: event.context.params,
          errorType: error?.constructor?.name,
        }
      )
      throw error
    }

    // Generate cache key for this specific resource
    const cacheKey = `resource:${id}`

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

    // Find the resource by ID
    const resource = resources.find(r => r.id === id)

    if (!resource) {
      const error = createError({
        statusCode: 404,
        statusMessage: 'Resource not found',
      })
      logError(
        `Resource with ID ${id} not found`,
        error,
        'api-v1-resources-by-id',
        {
          resourceId: id,
          errorType: error?.constructor?.name,
        }
      )
      throw error
    }

    // Convert resource to include hierarchical tags
    const resourcesWithHierarchicalTags = convertResourcesToHierarchicalTags([
      resource,
    ])
    const resourceWithHierarchicalTags = resourcesWithHierarchicalTags[0]

    // Prepare response
    const response = {
      success: true,
      data: resourceWithHierarchicalTags,
    }

    // Cache the result with tags for easier invalidation
    await cacheSetWithTags(cacheKey, response, 600, [
      'resource',
      'api-v1',
      `resource-${id}`,
    ]) // Cache for 10 minutes

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    return response
  } catch (error: any) {
    if (error.statusCode) {
      // Log the error but rethrow for H3 to handle properly
      logError(
        `Error fetching resource by ID: ${error.statusMessage || error.message}`,
        error,
        'api-v1-resources-by-id',
        {
          resourceId: event.context.params?.id,
          errorType: error?.constructor?.name,
          statusCode: error.statusCode,
        }
      )
      throw error
    }

    // Log error using our error logging service
    logError(
      `Unexpected error fetching resource by ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-resources-by-id',
      {
        resourceId: event.context.params?.id,
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while fetching the resource',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
