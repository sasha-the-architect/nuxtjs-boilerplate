import { defineEventHandler, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { resourcesToCsv } from '~/utils/csv'
import { handleApiRouteError } from '~/server/utils/api-response'

/**
 * GET /api/v1/export/csv
 *
 * Export all resources as CSV format
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Convert resources to CSV
    const csvContent = resourcesToCsv(resources)

    // Set appropriate content type for CSV
    setResponseHeader(event, 'Content-Type', 'text/csv')
    setResponseHeader(
      event,
      'Content-Disposition',
      'attachment; filename="resources.csv"'
    )

    return csvContent
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
