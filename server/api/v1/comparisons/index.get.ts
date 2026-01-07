import type { Resource } from '~/types/resource'
import type { ResourceComparison } from '~/types/comparison'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
{ createError, defineEventHandler, getQuery 

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
      throw createError({
        statusCode: 400,
        statusMessage: 'Resource IDs are required for comparison',
      })
    }

    // Validate resource IDs format
    if (resourceIds.some(id => typeof id !== 'string' || !id.trim())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid resource ID format',
      })
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

    // Fetch the requested resources
    const requestedResources = resourceIds
      .map(id => resources.find(r => r.id === id))
      .filter(Boolean) as Resource[]

    if (requestedResources.length !== resourceIds.length) {
      // Some resources were not found
      const foundIds = new Set(requestedResources.map(r => r.id))
      const missingIds = resourceIds.filter(id => !foundIds.has(id))

      throw createError({
        statusCode: 404,
        statusMessage: `Resources not found: ${missingIds.join(', ')}`,
      })
    }

    // Generate comparison data
    const comparisonData = {
      id: `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resources: requestedResources.map(r => r.id),
      createdAt: new Date().toISOString(),
      isPublic: true,
      slug: null,
    } as ResourceComparison

    const response = {
      success: true,
      data: comparisonData,
      resources: requestedResources,
    }

    // Cache the result for 5 minutes
    await cacheSetWithTags(cacheKey, response, 300, [
      'comparisons',
      'api-v1',
      'resource-comparisons',
      ...resourceIds,
    ])

    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    return response
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching comparison data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-comparisons',
      {
        errorType: error?.constructor?.name,
        resourceIds: getQuery(event).ids,
      }
    )

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch comparison data',
    })
  }
})
