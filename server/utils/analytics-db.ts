import { readBody, getHeaders, getRequestIP } from 'h3'
import Database from 'better-sqlite3'

// Define the database path
const DB_PATH = process.env.DATABASE_URL || './data/analytics.db'

// Create the database directory if it doesn't exist
import { mkdirSync } from 'fs'
import { dirname } from 'path'
mkdirSync(dirname(DB_PATH), { recursive: true })

// Initialize database
const db = new Database(DB_PATH)

// Create analytics_events table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    resourceId TEXT,
    category TEXT,
    url TEXT,
    userAgent TEXT,
    ip TEXT,
    timestamp INTEGER NOT NULL,
    properties TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_analytics_events_resourceId ON analytics_events(resourceId);
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(type);
`)

// Interface matching the existing AnalyticsEvent
export interface AnalyticsEvent {
  type: string
  resourceId?: string
  category?: string
  url?: string
  userAgent?: string
  ip?: string
  timestamp: number
  properties?: Record<string, any>
}

/**
 * Insert a new analytics event into the database
 */
export function insertAnalyticsEvent(event: AnalyticsEvent): boolean {
  try {
    const stmt = db.prepare(`
      INSERT INTO analytics_events (type, resourceId, category, url, userAgent, ip, timestamp, properties)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      event.type,
      event.resourceId || null,
      event.category || null,
      event.url || null,
      event.userAgent || null,
      event.ip || null,
      event.timestamp,
      event.properties ? JSON.stringify(event.properties) : null
    )

    return true
  } catch (error) {
    console.error('Error inserting analytics event:', error)
    return false
  }
}

/**
 * Get analytics events by date range
 */
export function getAnalyticsEventsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 10000
): AnalyticsEvent[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM analytics_events 
      WHERE timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp DESC
      LIMIT ?
    `)

    const rows = stmt.all(
      startDate.getTime(),
      endDate.getTime(),
      limit
    ) as any[]

    return rows.map(row => ({
      type: row.type,
      resourceId: row.resourceId || undefined,
      category: row.category || undefined,
      url: row.url || undefined,
      userAgent: row.userAgent || undefined,
      ip: row.ip || undefined,
      timestamp: row.timestamp,
      properties: row.properties ? JSON.parse(row.properties) : undefined,
    }))
  } catch (error) {
    console.error('Error getting analytics events by date range:', error)
    return []
  }
}

/**
 * Get analytics events by resource ID
 */
export function getAnalyticsEventsForResource(
  resourceId: string,
  startDate: Date,
  endDate: Date,
  eventType?: string
): AnalyticsEvent[] {
  try {
    let query = `
      SELECT * FROM analytics_events 
      WHERE resourceId = ? AND timestamp >= ? AND timestamp <= ?
    `
    const params: any[] = [resourceId, startDate.getTime(), endDate.getTime()]

    if (eventType) {
      query += ` AND type = ?`
      params.push(eventType)
    }

    query += ` ORDER BY timestamp DESC`

    const stmt = db.prepare(query)
    const rows = stmt.all(...params) as any[]

    return rows.map(row => ({
      type: row.type,
      resourceId: row.resourceId || undefined,
      category: row.category || undefined,
      url: row.url || undefined,
      userAgent: row.userAgent || undefined,
      ip: row.ip || undefined,
      timestamp: row.timestamp,
      properties: row.properties ? JSON.parse(row.properties) : undefined,
    }))
  } catch (error) {
    console.error('Error getting analytics events for resource:', error)
    return []
  }
}

/**
 * Get aggregated analytics data for dashboard
 */
export function getAggregatedAnalytics(
  startDate: Date,
  endDate: Date
): {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsByCategory: Record<string, number>
  resourceViews: Record<string, number>
  dailyTrends: Array<{ date: string; count: number }>
} {
  try {
    // Get all events in the date range
    const events = getAnalyticsEventsByDateRange(startDate, endDate, 100000)

    // Aggregate data
    const result = {
      totalEvents: events.length,
      eventsByType: {} as Record<string, number>,
      eventsByCategory: {} as Record<string, number>,
      resourceViews: {} as Record<string, number>,
      dailyTrends: [] as Array<{ date: string; count: number }>,
    }

    // Populate event type counts
    for (const event of events) {
      result.eventsByType[event.type] =
        (result.eventsByType[event.type] || 0) + 1

      if (event.category) {
        result.eventsByCategory[event.category] =
          (result.eventsByCategory[event.category] || 0) + 1
      }

      if (event.resourceId && event.type === 'resource_view') {
        result.resourceViews[event.resourceId] =
          (result.resourceViews[event.resourceId] || 0) + 1
      }
    }

    // Calculate daily trends
    const dailyCounts: Record<string, number> = {}
    for (const event of events) {
      const eventDate = new Date(event.timestamp)
      const dateStr = eventDate.toISOString().split('T')[0] // YYYY-MM-DD format
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1
    }

    result.dailyTrends = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return result
  } catch (error) {
    console.error('Error getting aggregated analytics:', error)
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByCategory: {},
      resourceViews: {},
      dailyTrends: [],
    }
  }
}

/**
 * Get resource-specific analytics
 */
export function getResourceAnalytics(
  resourceId: string,
  startDate: Date,
  endDate: Date
): {
  resourceId: string
  viewCount: number
  uniqueVisitors: number
  lastViewed: string
  dailyViews: Array<{ date: string; count: number }>
} {
  try {
    const events = getAnalyticsEventsForResource(
      resourceId,
      startDate,
      endDate,
      'resource_view'
    )

    // Calculate unique visitors
    const uniqueVisitorIps = new Set<string>()
    for (const event of events) {
      if (event.ip) {
        uniqueVisitorIps.add(event.ip)
      }
    }

    // Calculate daily views
    const dailyCounts: Record<string, number> = {}
    for (const event of events) {
      const eventDate = new Date(event.timestamp)
      const dateStr = eventDate.toISOString().split('T')[0] // YYYY-MM-DD format
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1
    }

    const dailyViews = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const lastViewed =
      events.length > 0
        ? new Date(Math.max(...events.map(e => e.timestamp))).toISOString()
        : new Date().toISOString()

    return {
      resourceId,
      viewCount: events.length,
      uniqueVisitors: uniqueVisitorIps.size,
      lastViewed,
      dailyViews,
    }
  } catch (error) {
    console.error('Error getting resource analytics:', error)
    return {
      resourceId,
      viewCount: 0,
      uniqueVisitors: 0,
      lastViewed: new Date().toISOString(),
      dailyViews: [],
    }
  }
}

/**
 * Export analytics events to CSV format
 */
export function exportAnalyticsToCsv(startDate: Date, endDate: Date): string {
  try {
    const events = getAnalyticsEventsByDateRange(startDate, endDate, 100000)

    // Create CSV content
    let csvContent =
      'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties\n'

    for (const event of events) {
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

    return csvContent
  } catch (error) {
    console.error('Error exporting analytics to CSV:', error)
    return 'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties\n'
  }
}

/**
 * Clean up old analytics events based on retention policy
 */
export function cleanupOldEvents(retentionDays: number = 30): number {
  try {
    const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000
    const stmt = db.prepare('DELETE FROM analytics_events WHERE timestamp < ?')
    const result = stmt.run(cutoffDate)

    return result.changes
  } catch (error) {
    console.error('Error cleaning up old analytics events:', error)
    return 0
  }
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  db.close()
}
