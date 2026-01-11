import { defineEventHandler } from 'h3'
import type { Resource } from '~/types/resource'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { convertResourcesToHierarchicalTags } from '~/utils/tags'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendNotFoundError,
  handleApiRouteError,
} from '~/server/utils/api-response'

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
      return sendBadRequestError(event, 'Resource ID is required')
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
      return sendNotFoundError(event, 'Resource', id)
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

    return sendSuccessResponse(event, response.data)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
