import { Resource } from '~/types/resource'
import { getResourceHealthStats } from '~/server/utils/resourceHealth'

export default defineEventHandler(async () => {
  // Get all resources
  const { allResources } = await import('~/server/api/v1/resources.get')
  const resources = await allResources()

  // Count resources by status
  const statusCounts: Record<string, number> = {
    active: 0,
    deprecated: 0,
    discontinued: 0,
    updated: 0,
    pending: 0,
  }

  const resourcesByStatus: Record<string, Resource[]> = {
    active: [],
    deprecated: [],
    discontinued: [],
    updated: [],
    pending: [],
  }

  resources.forEach((resource: Resource) => {
    const status = resource.status || 'active'
    if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
      statusCounts[status]++
      resourcesByStatus[status].push(resource)
    } else {
      statusCounts.active++ // default to active if invalid status
      resourcesByStatus.active.push(resource)
    }
  })

  // Get health stats
  const healthStats = getResourceHealthStats()

  return {
    totalResources: resources.length,
    statusBreakdown: statusCounts,
    resourcesByStatus,
    healthStats,
    reportGeneratedAt: new Date().toISOString(),
  }
})
