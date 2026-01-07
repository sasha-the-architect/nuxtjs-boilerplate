import { createError, defineEventHandler, readBody } from 'h3'
import { Resource } from '~/types/resource'

// In-memory storage for resource status updates (in production, this would be a database)
const resourceStatusHistory = new Map<string, any[]>()

export default defineEventHandler(async event => {
  const { resourceIds, status, reason, notes } = await readBody(event)

  // Validate required fields
  if (!Array.isArray(resourceIds) || !status) {
    throw createError({
      statusCode: 400,
      statusMessage: 'resourceIds array and status are required',
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

  // Get all resources
  const { allResources } = await import('~/server/api/v1/resources.get')
  const resources = await allResources()

  // Get current user or default to 'system'
  const userId = event.context.auth?.userId || 'system'

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

    // Create status change record
    const statusChange = {
      id: Math.random().toString(36).substring(2, 15),
      fromStatus: resource.status || 'active',
      toStatus: status,
      reason: reason || 'Bulk status update',
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

    updatedResources.push({
      id: resource.id,
      status: resource.status,
      title: resource.title,
    })
  }

  return {
    success: true,
    updatedCount: updatedResources.length,
    errorCount: errors.length,
    updatedResources,
    errors,
  }
})
