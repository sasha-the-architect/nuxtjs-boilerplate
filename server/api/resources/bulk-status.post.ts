import { defineEventHandler, readBody } from 'h3'
import { Resource } from '~/types/resource'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const { resourceIds, status } = await readBody(event)

    // Validate required fields
    if (!Array.isArray(resourceIds) || !status) {
      sendBadRequestError(event, 'resourceIds array and status are required')
      return
    }

    // Validate status value
    const validStatuses = [
      'active',
      'deprecated',
      'discontinued',
      'updated',
      'pending',
    ]
    if (!validStatuses.includes(status)) {
      sendBadRequestError(event, 'Invalid status value')
      return
    }

    // Get all resources
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    const updatedResources = []
    const errors = []

    for (const resourceId of resourceIds) {
      const resource = resources.find((r: Resource) => r.id === resourceId)

      if (!resource) {
        errors.push({
          resourceId,
          error: 'Resource not found',
        })
        continue
      }

      // Update resource with new status
      const updatedResource: Resource = {
        ...resource,
        status,
        lastUpdated: new Date().toISOString(),
      }

      updatedResources.push({
        id: updatedResource.id,
        status: updatedResource.status,
        title: updatedResource.title,
      })
    }

    sendSuccessResponse(event, {
      updatedCount: updatedResources.length,
      errorCount: errors.length,
      updatedResources,
      errors,
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
