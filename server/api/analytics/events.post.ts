// server/api/analytics/events.post.ts
// API endpoint for collecting analytics events from the client
import { defineEventHandler, readBody, getHeaders, getRequestIP, setResponseStatus } from 'h3'
import {
  insertAnalyticsEvent,
  getAnalyticsEventsByDateRange,
} from '~/server/utils/analytics-db'

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

// Rate limiting: store last event time per IP
const ipEventTimes = new Map<string, number>()

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const headers = getHeaders(event)
    const clientIP = getRequestIP(event) || 'unknown'

    // Rate limiting: max 10 events per IP per minute
    const now = Date.now()
    const lastEventTime = ipEventTimes.get(clientIP) || 0
    if (now - lastEventTime < 60000) {
      // 60 seconds
      // For rate limiting, we still need to check recent events from the database
      // Get events from the last minute for this IP
      const oneMinuteAgo = new Date(now - 60000)
      const recentEvents = getAnalyticsEventsByDateRange(
        oneMinuteAgo,
        new Date(),
        1000
      ).filter(e => e.ip === clientIP)

      if (recentEvents.length >= 10) {
        setResponseStatus(event, 429)
        return {
          success: false,
          message: 'Rate limit exceeded: max 10 events per minute per IP',
        }
      }
    }

    // Validate required fields
    if (!body.type || typeof body.type !== 'string') {
      setResponseStatus(event, 400)
      return {
        success: false,
        message: 'Event type is required and must be a string',
      }
    }

    // Create analytics event object
    const analyticsEvent: AnalyticsEvent = {
      type: body.type,
      resourceId: body.resourceId,
      category: body.category,
      url: body.url,
      userAgent: headers['user-agent'] as string,
      ip: clientIP,
      timestamp: now,
      properties: body.properties || {},
    }

    // Store the event in the database
    const success = insertAnalyticsEvent(analyticsEvent)
    if (!success) {
      setResponseStatus(event, 500)
      return {
        success: false,
        message: 'Failed to store analytics event',
      }
    }

    // Update IP event time
    ipEventTimes.set(clientIP, now)

    // Clean up old IP entries (older than 1 hour)
    const oneHourAgo = now - 3600000
    for (const [ip, time] of ipEventTimes.entries()) {
      if (time < oneHourAgo) {
        ipEventTimes.delete(ip)
      }
    }

    return {
      success: true,
      eventId: analyticsEvent.timestamp, // Using timestamp as a unique identifier since we don't have a DB ID
    }
  } catch (error: any) {
    console.error('Analytics event error:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: error.message || 'Internal server error',
    }
  }
})
