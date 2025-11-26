// server/middleware/analytics.ts
// Analytics tracking middleware

import { analyticsStorage, AnalyticsEvent } from '~/utils/analytics'

export default defineEventHandler(async event => {
  // Only track on GET requests to avoid tracking API calls
  if (event.method !== 'GET') {
    return
  }

  // Don't track static assets or API endpoints
  const url = getRequestURL(event).pathname
  if (
    url.startsWith('/api/') ||
    url.startsWith('/_nuxt/') ||
    url.startsWith('/@') ||
    url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
  ) {
    return
  }

  // Create a session ID based on IP and user agent (for demo purposes)
  const ip = getRequestIP(event)
  const userAgent = getHeaders(event).get('user-agent') || ''
  const sessionId = `${ip}_${userAgent.substring(0, 10)}`

  // Create analytics event
  const analyticsEvent: AnalyticsEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    eventType: 'page_view',
    sessionId,
    url: getRequestURL(event).toString(),
    userAgent,
    ip,
    metadata: {
      path: url,
      referrer: getHeaders(event).get('referer') || '',
    },
    createdAt: new Date(),
  }

  try {
    // Save the event asynchronously (don't block the request)
    analyticsStorage.saveEvent(analyticsEvent).catch(error => {
      console.error('Failed to save analytics event:', error)
    })
  } catch (error) {
    console.error('Error in analytics middleware:', error)
  }
})
