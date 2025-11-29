// server/api/analytics/events.post.ts
// API endpoint for collecting analytics events from the client
import { readBody, getHeaders, getRequestIP, setResponseStatus } from 'h3'

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

// In-memory storage for analytics events (in production, use a database)
const analyticsEvents: AnalyticsEvent[] = []

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
      const recentEvents = analyticsEvents.filter(
        e => e.ip === clientIP && now - e.timestamp < 60000
      )
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

    // Store the event
    analyticsEvents.push(analyticsEvent)

    // Keep only last 10000 events to prevent memory issues
    if (analyticsEvents.length > 10000) {
      analyticsEvents.splice(0, analyticsEvents.length - 10000)
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
      eventId: analyticsEvent.timestamp,
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
