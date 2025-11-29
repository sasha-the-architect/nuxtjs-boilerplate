// server/api/analytics/export/csv.get.ts
// API endpoint for exporting analytics data as CSV
import { getQuery, setResponseHeader, setResponseStatus } from 'h3'

// Note: This is the same in-memory storage as in events.post.ts
// In a real application, you'd use a shared database or file
declare const global: {
  analyticsEvents?: any[]
  ipEventTimes?: Map<string, number>
}

// Initialize global analytics storage if it doesn't exist
if (!global.analyticsEvents) {
  global.analyticsEvents = []
}

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

    // Filter events by date range
    const filteredEvents = global.analyticsEvents.filter(event => {
      const eventDate = new Date(event.timestamp)
      return eventDate >= startDate && eventDate <= endDate
    })

    // Create CSV content
    let csvContent =
      'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties\n'

    for (const event of filteredEvents) {
      const timestamp = new Date(event.timestamp).toISOString()
      const properties = JSON.stringify(event.properties || {}).replace(
        /"/g,
        '""'
      ) // Escape quotes for CSV

      csvContent +=
        [
          `"${event.type || ''}"`,
          `"${event.resourceId || ''}"`,
          `"${event.category || ''}"`,
          `"${event.url || ''}"`,
          `"${event.ip || ''}"`,
          `"${timestamp}"`,
          `"${properties}"`,
        ].join(',') + '\n'
    }

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
