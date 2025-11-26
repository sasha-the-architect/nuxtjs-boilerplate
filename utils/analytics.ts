// utils/analytics.ts
// Client-side analytics tracking utilities

export interface AnalyticsEvent {
  type: string
  resourceId?: string
  category?: string
  url?: string
  properties?: Record<string, any>
}

// Track an analytics event
export async function trackEvent(event: AnalyticsEvent): Promise<boolean> {
  try {
    // In development, log events to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', event)
    }

    // Send the event to the analytics API
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    const result = await response.json()

    if (!result.success) {
      console.error('Failed to track analytics event:', result.message)
      return false
    }

    return true
  } catch (error) {
    console.error('Error tracking analytics event:', error)
    return false
  }
}

// Track a page view
export async function trackPageView(
  url: string,
  title?: string
): Promise<boolean> {
  return trackEvent({
    type: 'page_view',
    url,
    properties: {
      title,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent:
        typeof navigator !== 'undefined'
          ? navigator.userAgent
          : 'test-environment',
    },
  })
}

// Track a resource click
export async function trackResourceClick(
  resourceId: string,
  title: string,
  category: string
): Promise<boolean> {
  return trackEvent({
    type: 'resource_click',
    resourceId,
    category,
    properties: {
      title,
    },
  })
}

// Track a resource view
export async function trackResourceView(
  resourceId: string,
  title: string,
  category: string
): Promise<boolean> {
  return trackEvent({
    type: 'resource_view',
    resourceId,
    category,
    properties: {
      title,
    },
  })
}

// Track a search
export async function trackSearch(
  query: string,
  resultsCount: number
): Promise<boolean> {
  return trackEvent({
    type: 'search',
    properties: {
      query,
      resultsCount,
    },
  })
}

// Track a filter application
export async function trackFilter(
  filterType: string,
  filterValue: string
): Promise<boolean> {
  return trackEvent({
    type: 'filter_applied',
    properties: {
      filterType,
      filterValue,
    },
  })
}
