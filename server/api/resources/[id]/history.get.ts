import { Resource } from '~/types/resource'
import { getRouterParam } from '#imports'

// In-memory storage for resource status updates (in production, this would be a database)
const resourceStatusHistory = new Map<string, any[]>()

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

  // Return resource with status history and update history
  return {
    id: resource.id,
    title: resource.title,
    status: resource.status || 'active',
    statusHistory: resource.statusHistory || [],
    updateHistory: resource.updateHistory || [],
  }
})
