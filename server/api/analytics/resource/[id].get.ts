// server/api/analytics/resource/[id].get.ts
// API endpoint for retrieving analytics data for a specific resource
import { getQuery, setResponseStatus } from 'h3'

// Note: This uses the same in-memory storage as in events.post.ts
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
    const resourceId = event.context.params?.id

    if (!resourceId) {
      setResponseStatus(event, 400)
      return {
        success: false,
        message: 'Resource ID is required',
      }
    }

    // Parse date range from query parameters
    const query = getQuery(event)
    const startDate = query.startDate
      ? new Date(query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default to last 30 days
    const endDate = query.endDate
      ? new Date(query.endDate as string)
      : new Date()

    // Filter events by resource ID and date range
    const resourceEvents = global.analyticsEvents.filter(event => {
      const eventDate = new Date(event.timestamp)
      return (
        event.resourceId === resourceId &&
        eventDate >= startDate &&
        eventDate <= endDate &&
        event.type === 'resource_view'
      )
    })

    // Calculate analytics for this resource
    const analyticsData = {
      resourceId,
      viewCount: resourceEvents.length,
      uniqueVisitors: new Set(resourceEvents.map(e => e.ip)).size,
      avgTimeOnPage: 0, // Placeholder - would need actual time tracking
      bounceRate: 0, // Placeholder - would need referral data
      lastViewed:
        resourceEvents.length > 0
          ? new Date(
              Math.max(...resourceEvents.map(e => e.timestamp))
            ).toISOString()
          : new Date().toISOString(),
      dailyViews: [] as Array<{ date: string; count: number }>, // Daily view count
    }

    // Calculate daily views
    const dailyCounts: Record<string, number> = {}
    for (const event of resourceEvents) {
      const eventDate = new Date(event.timestamp)
      const dateStr = eventDate.toISOString().split('T')[0] // YYYY-MM-DD format
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1
    }

    analyticsData.dailyViews = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    setResponseStatus(event, 200)
    return {
      success: true,
      data: analyticsData,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    }
  } catch (error: any) {
    console.error('Resource analytics error:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: error.message || 'Internal server error',
    }
  }
})
