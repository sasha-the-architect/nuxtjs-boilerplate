// composables/useAnalytics.ts
// Composable for client-side analytics tracking

import type { Resource } from '~/types/resource'
import type { AnalyticsEvent } from '~/utils/analytics'

export const useAnalytics = () => {
  const trackEvent = async (
    eventType: AnalyticsEvent['eventType'],
    metadata: AnalyticsEvent['metadata'] = {}
  ) => {
    try {
      // Create a session ID based on a random value (in production, you might use a more persistent identifier)
      const sessionId =
        localStorage.getItem('sessionId') ||
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', sessionId)
      }

      // Prepare the event data
      const analyticsEvent: AnalyticsEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        eventType,
        sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        metadata,
        createdAt: new Date(),
      }

      // Send the event to the server
      await $fetch('/api/analytics/track', {
        method: 'POST',
        body: analyticsEvent,
      })
    } catch (error) {
      console.error('Error tracking analytics event:', error)
    }
  }

  const trackResourceClick = (resource: Resource) => {
    trackEvent('resource_click', {
      resourceId: resource.id,
      resourceUrl: resource.url,
      resourceName: resource.name,
      category: resource.category,
    })
  }

  const trackResourceBookmark = (resource: Resource) => {
    trackEvent('bookmark', {
      resourceId: resource.id,
      resourceUrl: resource.url,
      resourceName: resource.name,
    })
  }

  const trackResourceShare = (resource: Resource) => {
    trackEvent('share', {
      resourceId: resource.id,
      resourceUrl: resource.url,
      resourceName: resource.name,
    })
  }

  const trackSearch = (
    query: string,
    resultsCount: number,
    noResults: boolean
  ) => {
    trackEvent('search', {
      query,
      resultsCount,
      noResults,
    })
  }

  const trackFilter = (filter: string, value: string) => {
    trackEvent('filter', {
      filter,
      value,
    })
  }

  return {
    trackEvent,
    trackResourceClick,
    trackResourceBookmark,
    trackResourceShare,
    trackSearch,
    trackFilter,
  }
}
