import { setResponseHeader } from 'h3'
import { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

/**
 * GET /api/v1/export/json
 *
 * Export all resources as JSON format
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Set the appropriate content type for JSON
    setResponseHeader(event, 'Content-Type', 'application/json')
    setResponseHeader(
      event,
      'Content-Disposition',
      'attachment; filename="resources.json"'
    )

    return resources
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error exporting resources as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-export-json'
    )

    return {
      success: false,
      message: 'An error occurred while exporting resources',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
