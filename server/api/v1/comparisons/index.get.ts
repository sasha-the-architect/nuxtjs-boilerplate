import type { Resource } from '~/types/resource'
import type { ResourceComparison } from '~/types/comparison'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    // Get query parameters
    const query = getQuery(event)
    const resourceIds = query.ids
      ? Array.isArray(query.ids)
        ? query.ids
        : [query.ids]
      : []

    if (!resourceIds || resourceIds.length === 0) {
      sendBadRequestError(event, 'Resource IDs are required for comparison')
      return
    }

    // Validate resource IDs format
    if (resourceIds.some(id => typeof id !== 'string' || !id.trim())) {
      sendBadRequestError(event, 'Invalid resource ID format')
      return
    }

    // Generate cache key
    const sortedResourceIds = [...resourceIds].sort()
    const cacheKey = `comparison:${sortedResourceIds.join('-')}`

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

    // Fetch requested resources
    const requestedResources = resourceIds
      .map(id => resources.find(r => r.id === id))
      .filter(Boolean) as Resource[]

    if (requestedResources.length !== resourceIds.length) {
      // Some resources were not found
      const foundIds = new Set(requestedResources.map(r => r.id))
      const missingIds = resourceIds.filter(id => !foundIds.has(id))

      sendNotFoundError(event, 'Resources', missingIds.join(', '))
      return
    }

    // Generate comparison data
    const comparisonData: ResourceComparison = {
      id: `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resources: requestedResources.map(r => r.id),
      criteria: [],
      scores: {},
      createdAt: new Date().toISOString(),
      isPublic: true,
      slug: undefined,
    }

    const responseData = {
      comparison: comparisonData,
      resources: requestedResources,
    }

    // Cache result for 5 minutes
    await cacheSetWithTags(
      cacheKey,
      { success: true, data: responseData },
      300,
      ['comparisons', 'api-v1', 'resource-comparisons', ...resourceIds]
    )

    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    // Log error using our error logging service
    logError(
      `Error fetching comparison data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-comparisons',
      {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        resourceIds: getQuery(event).ids,
      }
    )

    return handleApiRouteError(event, error)
  }
})
