import { Resource } from '~/types/resource'
import { updateLinkHealth } from '~/utils/linkValidator'
import { logError } from '~/utils/errorLogger'

interface SingleLinkValidationResponse {
  success: boolean
  data?: {
    resourceId: string
    url: string
    previousStatus?: string
    newStatus: string
    statusCode?: number
    responseTime?: number
    error?: string
    lastChecked: string
  }
  error?: string
}

/**
 * POST /api/v1/link-validation/[id]
 *
 * Validates the URL for a specific resource by ID
 */
export default defineEventHandler(async event => {
  try {
    const resourceId = event.context.params?.id

    if (!resourceId) {
      return {
        success: false,
        message: 'Resource ID is required',
      }
    }

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Find the specific resource
    const resource = resources.find(r => r.id === resourceId)

    if (!resource) {
      return {
        success: false,
        message: `Resource with ID ${resourceId} not found`,
      }
    }

    // Get previous status before validation
    const previousStatus = resource.linkHealth?.status

    // Validate the URL
    const linkHealth = await updateLinkHealth(resource.url)

    return {
      success: true,
      data: {
        resourceId: resource.id,
        url: resource.url,
        previousStatus,
        newStatus: linkHealth.status,
        statusCode: linkHealth.statusCode,
        responseTime: linkHealth.responseTime,
        error: linkHealth.error,
        lastChecked: linkHealth.lastChecked,
      },
    } as SingleLinkValidationResponse
  } catch (error: any) {
    logError(
      `Error during single link validation for resource ${event.context.params?.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-link-validation-single',
      {
        resourceId: event.context.params?.id,
        errorType: error?.constructor?.name,
      }
    )

    return {
      success: false,
      message: 'An error occurred during link validation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as SingleLinkValidationResponse
  }
})
