import { Resource } from '~/types/resource'
import { getRouterParam } from '#imports'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendNotFoundError,
  handleApiRouteError,
} from '~/server/utils/api-response'

// In-memory storage for resource status updates (in production, this would be a database)
const resourceStatusHistory = new Map<string, unknown[]>()

export default defineEventHandler(async event => {
  try {
    const resourceId = getRouterParam(event, 'id') ?? ''
    const { status, reason, notes } = await readBody(event)

    // Get resources from data file
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || []
    const resource = resources.find((r: Resource) => r.id === resourceId)

    if (!resource) {
      return sendNotFoundError(event, 'Resource', resourceId)
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
      return sendBadRequestError(
        event,
        `Invalid status value. Valid options: ${validStatuses.join(', ')}`
      )
    }

    // Get current user or default to 'system'
    const userId = event.context.auth?.userId ?? 'system'

    // Create status change record
    const statusChange = {
      id: Math.random().toString(36).substring(2, 15),
      fromStatus: (resource.status ?? 'active') as string,
      toStatus: status,
      reason: (reason ?? 'Status updated manually') as string,
      changedBy: userId as string,
      changedAt: new Date().toISOString(),
      notes: (notes ?? '') as string,
    }

    // Add to history
    if (!resourceStatusHistory.has(resourceId)) {
      resourceStatusHistory.set(resourceId, [])
    }
    const existingHistory = resourceStatusHistory.get(resourceId) ?? []
    existingHistory.push(statusChange)
    resourceStatusHistory.set(resourceId, existingHistory)

    // Update resource with new status
    resource.status = status
    resource.lastUpdated = new Date().toISOString()

    // In a real application, this would update resource in database
    // For now, we'll return updated resource information
    return sendSuccessResponse(event, {
      resource: {
        id: resource.id,
        status: resource.status,
        statusHistory: existingHistory,
      },
      statusChange,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
