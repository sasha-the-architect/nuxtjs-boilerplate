import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendNotFoundError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    const resourceId = getRouterParam(event, 'id')

    if (!resourceId) {
      sendBadRequestError(event, 'Resource ID is required')
      return
    }

    // Generate cache key
    const cacheKey = `alternatives:${resourceId}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return cachedResult
    }

    // Import resources from JSON (following the same pattern as other API endpoints)
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Find the specific resource
    const resource = resources.find(r => r.id === resourceId)

    if (!resource) {
      sendNotFoundError(event, 'Resource', resourceId)
      return
    }

    // Get alternative resources based on alternatives field and similarity
    let alternatives: Resource[] = []

    if (resource.alternatives && Array.isArray(resource.alternatives)) {
      // Get alternative resources by ID
      alternatives = resource.alternatives
        .map(altId => resources.find(r => r.id === altId))
        .filter(Boolean) as Resource[] // Remove any undefined values
    } else {
      // If no explicit alternatives, find similar resources based on category, tags, and technology
      const resourceCategory = resource.category
      const resourceTags = resource.tags || []
      const resourceTech = resource.technology || []

      alternatives = resources
        .filter(
          r =>
            r.id !== resourceId &&
            (r.category === resourceCategory ||
              r.tags?.some((tag: string) => resourceTags.includes(tag)) ||
              r.technology?.some((tech: string) => resourceTech.includes(tech)))
        )
        .slice(0, 6) // Limit to 6 alternatives
    }

    const response = {
      success: true,
      data: {
        resourceId,
        alternatives,
        count: alternatives.length,
      },
    }

    // Cache result
    await cacheSetWithTags(cacheKey, response, 300, [
      'alternatives',
      'api-v1',
      'resource-alternatives',
      resourceId,
    ])

    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    return response
  } catch (error) {
    // Log error using our error logging service
    logError(
      `Error fetching alternatives for resource ${getRouterParam(event, 'id')}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-alternatives',
      {
        resourceId: getRouterParam(event, 'id'),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      }
    )

    return handleApiRouteError(event, error)
  }
})
