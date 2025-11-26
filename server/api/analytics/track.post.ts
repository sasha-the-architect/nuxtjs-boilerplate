// server/api/analytics/track.post.ts
// Endpoint to receive client-side analytics events

import { analyticsStorage, AnalyticsEvent } from '~/utils/analytics'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)

    // Validate the incoming event
    if (!body.eventType || !body.sessionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'eventType and sessionId are required',
      })
    }

    // Create an analytics event from the body
    const analyticsEvent: AnalyticsEvent = {
      id:
        body.id ||
        `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: body.timestamp || Date.now(),
      eventType: body.eventType,
      sessionId: body.sessionId,
      url: body.url || event.node.req.url || '',
      userAgent: body.userAgent || event.headers.get('user-agent') || '',
      ip: body.ip || getRequestIP(event),
      metadata: body.metadata || {},
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    }

    await analyticsStorage.saveEvent(analyticsEvent)

    return {
      success: true,
      eventId: analyticsEvent.id,
    }
  } catch (error) {
    console.error('Error saving analytics event:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save analytics event',
    })
  }
})
