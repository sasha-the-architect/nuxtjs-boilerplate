import { Resource } from '~/types/resource'
import { validateUrl, updateLinkHealth } from '~/utils/linkValidator'
import { logError } from '~/utils/errorLogger'

interface LinkValidationRequest {
  resourceIds?: string[] // Optional: only validate specific resources
  all?: boolean // Optional: validate all resources (default: true if resourceIds not provided)
}

interface LinkValidationResponse {
  success: boolean
  message: string
  results?: Array<{
    resourceId: string
    url: string
    previousStatus?: string
    newStatus: string
    statusCode?: number
    responseTime?: number
    error?: string
  }>
  error?: string
}

/**
 * POST /api/v1/link-validation
 *
 * Validates URLs for resources and updates their health status
 * Can validate all resources or specific ones based on request parameters
 */
export default defineEventHandler(async event => {
  try {
    // Parse request body
    const body = (await readBody(event)) as LinkValidationRequest
    const validateAll = body.all !== false && !body.resourceIds?.length // Default to true if no specific IDs provided
    const specificResourceIds = body.resourceIds

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Filter resources to validate
    let resourcesToValidate: Resource[]
    if (specificResourceIds && specificResourceIds.length > 0) {
      resourcesToValidate = resources.filter(resource =>
        specificResourceIds.includes(resource.id)
      )
    } else if (validateAll) {
      resourcesToValidate = [...resources]
    } else {
      // If neither specific IDs nor validateAll is true, return empty result
      resourcesToValidate = []
    }

    const validationResults = []

    // Validate each resource URL
    for (const resource of resourcesToValidate) {
      const previousStatus = resource.linkHealth?.status
      const linkHealth = await updateLinkHealth(resource.url)

      validationResults.push({
        resourceId: resource.id,
        url: resource.url,
        previousStatus,
        newStatus: linkHealth.status,
        statusCode: linkHealth.statusCode,
        responseTime: linkHealth.responseTime,
        error: linkHealth.error,
      })
    }

    return {
      success: true,
      message: `Validation completed for ${validationResults.length} resources`,
      results: validationResults,
    } as LinkValidationResponse
  } catch (error: any) {
    logError(
      `Error during link validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-link-validation',
      {
        errorType: error?.constructor?.name,
      }
    )

    return {
      success: false,
      message: 'An error occurred during link validation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as LinkValidationResponse
  }
})
