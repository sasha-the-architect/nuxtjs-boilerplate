// server/api/analytics/resource/[id].get.ts
// API endpoint for retrieving analytics data for a specific resource
import { getQuery, setResponseStatus } from 'h3'
import db from '~/server/utils/db'

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

    // Fetch events by resource ID and date range from database
    const resourceEvents = await db.analyticsEvent.findMany({
      where: {
        resourceId: resourceId,
        type: 'resource_view',
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    })

    // Transform database events to the format expected by the frontend
    const transformedEvents = resourceEvents.map(event => ({
      type: event.type,
      resourceId: event.resourceId || undefined,
      category: event.category || undefined,
      url: event.url || undefined,
      userAgent: event.userAgent || undefined,
      ip: event.ip || undefined,
      timestamp: event.timestamp.getTime(),
      properties: event.properties
        ? JSON.parse(event.properties as string)
        : undefined,
    }))

    // Calculate unique visitors
    const uniqueVisitorIPs = new Set(transformedEvents.map(e => e.ip))
    const uniqueVisitors = uniqueVisitorIPs.size

    // Calculate analytics for this resource
    const analyticsData = {
      resourceId,
      viewCount: transformedEvents.length,
      uniqueVisitors,
      avgTimeOnPage: 0, // Placeholder - would need actual time tracking
      bounceRate: 0, // Placeholder - would need referral data
      lastViewed:
        transformedEvents.length > 0
          ? new Date(
              Math.max(...transformedEvents.map(e => e.timestamp))
            ).toISOString()
          : new Date().toISOString(),
      dailyViews: [] as Array<{ date: string; count: number }>, // Daily view count
    }

    // Calculate daily views
    const dailyCounts: Record<string, number> = {}
    for (const event of transformedEvents) {
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
