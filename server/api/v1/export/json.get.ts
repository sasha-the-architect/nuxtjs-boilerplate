import { defineEventHandler, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { handleApiRouteError } from '~/server/utils/api-response'

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

    // Set appropriate content type for JSON
    setResponseHeader(event, 'Content-Type', 'application/json')
    setResponseHeader(
      event,
      'Content-Disposition',
      'attachment; filename="resources.json"'
    )

    return resources
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
