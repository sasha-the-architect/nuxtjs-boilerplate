import { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

interface LinkHealthDashboardResponse {
  success: boolean
  data: {
    totalResources: number
    validLinks: number
    invalidLinks: number
    unknownLinks: number
    checkingLinks: number
    resources: Array<{
      id: string
      title: string
      url: string
      linkHealth: Resource['linkHealth']
    }>
  }
  error?: string
}

/**
 * GET /api/v1/link-validation
 *
 * Retrieves link health dashboard data showing status of all resource links
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Filter resources that have link health data
    const resourcesWithHealth = resources.filter(
      resource => resource.linkHealth
    )

    // Calculate statistics
    const totalResources = resources.length
    const validLinks = resourcesWithHealth.filter(
      r => r.linkHealth?.status === 'valid'
    ).length
    const invalidLinks = resourcesWithHealth.filter(
      r => r.linkHealth?.status === 'invalid'
    ).length
    const unknownLinks = resourcesWithHealth.filter(
      r => r.linkHealth?.status === 'unknown'
    ).length
    const checkingLinks = resourcesWithHealth.filter(
      r => r.linkHealth?.status === 'checking'
    ).length

    return {
      success: true,
      data: {
        totalResources,
        validLinks,
        invalidLinks,
        unknownLinks,
        checkingLinks,
        resources: resourcesWithHealth.map(r => ({
          id: r.id,
          title: r.title,
          url: r.url,
          linkHealth: r.linkHealth,
        })),
      },
    } as LinkHealthDashboardResponse
  } catch (error: any) {
    logError(
      `Error fetching link health dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-link-validation-dashboard',
      {
        errorType: error?.constructor?.name,
      }
    )

    return {
      success: false,
      message: 'An error occurred while fetching link health data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
