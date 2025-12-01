import { Resource } from '~/types/resource'
import { getRouterParam } from '#imports'

// In-memory storage for resource status updates (in production, this would be a database)
const resourceStatusHistory = new Map<string, any[]>()

export default defineEventHandler(async event => {
  const resourceId = getRouterParam(event, 'id')
  const { status, reason, notes } = await readBody(event)

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

  // Validate status value
  const validStatuses = [
    'active',
    'deprecated',
    'discontinued',
    'updated',
    'pending',
  ]
  if (!validStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid status value',
    })
  }

  // Get current user or default to 'system'
  const userId = event.context.auth?.userId || 'system'

  // Create status change record
  const statusChange = {
    id: Math.random().toString(36).substring(2, 15),
    fromStatus: resource.status || 'active',
    toStatus: status,
    reason: reason || 'Status updated manually',
    changedBy: userId,
    changedAt: new Date().toISOString(),
    notes: notes || '',
  }

  // Add to history
  if (!resourceStatusHistory.has(resourceId)) {
    resourceStatusHistory.set(resourceId, [])
  }
  const history = resourceStatusHistory.get(resourceId) || []
  history.push(statusChange)
  resourceStatusHistory.set(resourceId, history)

  // Update resource with new status
  resource.status = status
  if (!resource.statusHistory) {
    resource.statusHistory = []
  }
  resource.statusHistory.push(statusChange)

  // Update lastUpdated timestamp
  resource.lastUpdated = new Date().toISOString()

  // In a real application, this would update the resource in the database
  // For now, we'll return the updated resource information
  return {
    success: true,
    resource: {
      id: resource.id,
      status: resource.status,
      statusHistory: resource.statusHistory,
    },
    statusChange,
  }
})
