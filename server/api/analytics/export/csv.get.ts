// server/api/analytics/export/csv.get.ts
// API endpoint for exporting analytics data as CSV
import { getQuery, setResponseHeader, setResponseStatus } from 'h3'
import { exportAnalyticsToCsv } from '~/server/utils/analytics-db'

export default defineEventHandler(async event => {
  try {
    const query = getQuery(event)

    // Parse date range from query parameters
    const startDate = query.startDate
      ? new Date(query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default to last 30 days
    const endDate = query.endDate
      ? new Date(query.endDate as string)
      : new Date()

    // Export analytics to CSV from database
    const csvContent = exportAnalyticsToCsv(startDate, endDate)

    // Set response headers for CSV download
    setResponseHeader(event, 'Content-Type', 'text/csv')
    setResponseHeader(
      event,
      'Content-Disposition',
      `attachment; filename="analytics-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`
    )
    setResponseHeader(
      event,
      'Content-Length',
      Buffer.byteLength(csvContent).toString()
    )

    setResponseStatus(event, 200)
    return csvContent
  } catch (error: any) {
    console.error('Analytics CSV export error:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: error.message || 'Internal server error',
    }
  }
})
