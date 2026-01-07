// server/api/analytics/data.get.ts
// API endpoint for retrieving analytics data for the dashboard
import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { getAggregatedAnalytics } from '~/server/utils/analytics-db'
import { logError } from '~/utils/errorLogger'

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

    // Get aggregated analytics data from database
    const analyticsData = getAggregatedAnalytics(startDate, endDate)

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
    logError('Analytics data error:', error, 'analytics/data.get')
    setResponseStatus(event, 500)
    return {
      success: false,
      message: error.message || 'Internal server error',
    }
  }
})
