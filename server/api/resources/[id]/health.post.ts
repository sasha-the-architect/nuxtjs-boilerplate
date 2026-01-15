import { Resource } from '~/types/resource'
import { getRouterParam } from '#imports'
import { updateResourceHealth } from '~/server/utils/resourceHealth'
import {
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const resourceId = getRouterParam(event, 'id')

    // Get all resources to find specific resource
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule
    const resource = resources.find((r: Resource) => r.id === resourceId)

    if (!resource) {
      sendNotFoundError(event, 'Resource', resourceId)
      return
    }

    // Perform health check
    const healthStatus = await updateResourceHealth(resource)

    sendSuccessResponse(event, {
      healthStatus,
      resource: {
        id: resource.id,
        url: resource.url,
        status: resource.status || 'active',
      },
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
