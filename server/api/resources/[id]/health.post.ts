import { Resource } from '~/types/resource'
import { getRouterParam } from '#imports'
import {
  updateResourceHealth,
  getResourceHealthStatus,
} from '~/server/utils/resourceHealth'

export default defineEventHandler(async event => {
  const resourceId = getRouterParam(event, 'id')

  // Get all resources to find the specific resource
  const { allResources } = await import('~/server/api/v1/resources.get')
  const resources = await allResources()
  const resource = resources.find((r: Resource) => r.id === resourceId)

  if (!resource) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found',
    })
  }

  // Perform health check
  const healthStatus = await updateResourceHealth(resource)

  // Update resource with health information
  resource.lastHealthCheck = new Date().toISOString()
  resource.healthScore = healthStatus.isHealthy ? 100 : 0 // Simplified health scoring

  return {
    success: true,
    healthStatus,
    resource: {
      id: resource.id,
      url: resource.url,
      status: resource.status || 'active',
      lastHealthCheck: resource.lastHealthCheck,
      healthScore: resource.healthScore,
    },
  }
})
