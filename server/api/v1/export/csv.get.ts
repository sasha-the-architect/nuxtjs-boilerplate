import { defineEventHandler, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { resourcesToCsv } from '~/utils/csv'
import { logError } from '~/utils/errorLogger'

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

    // Set the appropriate content type for CSV
    setResponseHeader(event, 'Content-Type', 'text/csv')
    setResponseHeader(
      event,
      'Content-Disposition',
      'attachment; filename="resources.csv"'
    )

    return csvContent
  } catch (error) {
    logError(
      `Error exporting resources as CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-export-csv'
    )

    return {
      success: false,
      message: 'An error occurred while exporting resources as CSV',
      error:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : undefined,
    }
  }
})
