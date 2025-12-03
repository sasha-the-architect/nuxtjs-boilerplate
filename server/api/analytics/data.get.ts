// server/api/analytics/data.get.ts
// API endpoint for retrieving analytics data for the dashboard
import { getQuery, setResponseStatus } from 'h3'
import db from '~/server/utils/db'

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

    // Fetch events from database by date range
    const dbEvents = await db.analyticsEvent.findMany({
      where: {
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
    const filteredEvents = dbEvents.map(event => ({
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

    // Aggregate analytics data
    const analyticsData = {
      totalEvents: filteredEvents.length,
      eventsByType: {} as Record<string, number>,
      eventsByCategory: {} as Record<string, number>,
      resourceViews: {} as Record<string, number>,
      topResources: [] as Array<{ id: string; title: string; views: number }>,
      topCategories: [] as Array<{ name: string; count: number }>,
      dailyTrends: [] as Array<{ date: string; count: number }>,
    }

    // Populate event type counts
    for (const event of filteredEvents) {
      analyticsData.eventsByType[event.type] =
        (analyticsData.eventsByType[event.type] || 0) + 1

      if (event.category) {
        analyticsData.eventsByCategory[event.category] =
          (analyticsData.eventsByCategory[event.category] || 0) + 1
      }

      if (event.resourceId && event.type === 'resource_view') {
        analyticsData.resourceViews[event.resourceId] =
          (analyticsData.resourceViews[event.resourceId] || 0) + 1
      }
    }

    // Get top resources by view count
    const resourceViewEntries = Object.entries(analyticsData.resourceViews)
      .map(([id, views]) => ({ id, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10) // Top 10

    // For each top resource, we'd normally fetch the title from the resources data
    // Since we don't have access to the actual resource data here, we'll just return the IDs
    analyticsData.topResources = resourceViewEntries.map(item => ({
      id: item.id,
      title: `Resource ${item.id}`, // Placeholder - in real implementation, fetch from resources
      views: item.views,
    }))

    // Get top categories by event count
    const categoryEntries = Object.entries(analyticsData.eventsByCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10

    analyticsData.topCategories = categoryEntries

    // Calculate daily trends
    const dailyCounts: Record<string, number> = {}
    for (const event of filteredEvents) {
      const eventDate = new Date(event.timestamp)
      const dateStr = eventDate.toISOString().split('T')[0] // YYYY-MM-DD format
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1
    }

    analyticsData.dailyTrends = Object.entries(dailyCounts)
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
    console.error('Analytics data error:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: error.message || 'Internal server error',
    }
  }
})
