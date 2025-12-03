// utils/analytics.ts
// Client-side analytics tracking utilities
import logger from '~/utils/logger'

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
      // Development logging removed for production
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
      logger.error('Failed to track analytics event:', result.message)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error tracking analytics event:', error)
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
  resultsCount: number,
  filters?: Record<string, any>
): Promise<boolean> {
  return trackEvent({
    type: 'search',
    properties: {
      query,
      resultsCount,
      filters,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track advanced search with operators
export async function trackAdvancedSearch(
  query: string,
  resultsCount: number,
  operatorsUsed: string[],
  filters?: Record<string, any>
): Promise<boolean> {
  return trackEvent({
    type: 'advanced_search',
    properties: {
      query,
      resultsCount,
      operatorsUsed,
      filters,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track search with zero results
export async function trackZeroResultSearch(
  query: string,
  filters?: Record<string, any>
): Promise<boolean> {
  return trackEvent({
    type: 'zero_result_search',
    properties: {
      query,
      filters,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track search result click
export async function trackSearchResultClick(
  resourceId: string,
  query: string,
  position: number
): Promise<boolean> {
  return trackEvent({
    type: 'search_result_click',
    resourceId,
    properties: {
      query,
      position,
      timestamp: new Date().toISOString(),
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

// Track a recommendation interaction
export async function trackRecommendationClick(
  resourceId: string,
  recommendationReason: string,
  position: number,
  recommendationId?: string
): Promise<boolean> {
  return trackEvent({
    type: 'recommendation_click',
    resourceId,
    properties: {
      reason: recommendationReason,
      position,
      recommendationId,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track resource rating
export async function trackResourceRating(
  resourceId: string,
  rating: number, // 1-5 scale
  title: string
): Promise<boolean> {
  if (rating < 1 || rating > 5) {
    logger.error('Rating must be between 1 and 5')
    return false
  }

  return trackEvent({
    type: 'resource_rating',
    resourceId,
    properties: {
      rating,
      title,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track time spent on a resource page
export async function trackTimeSpent(
  resourceId: string,
  timeSpent: number, // in seconds
  title: string,
  category: string
): Promise<boolean> {
  return trackEvent({
    type: 'time_spent',
    resourceId,
    category,
    properties: {
      timeSpent,
      title,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track a bookmark event
export async function trackBookmark(
  resourceId: string,
  title: string,
  category: string,
  action: 'add' | 'remove' = 'add'
): Promise<boolean> {
  return trackEvent({
    type: 'bookmark_action',
    resourceId,
    category,
    properties: {
      title,
      action,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track a resource sharing event
export async function trackShare(
  resourceId: string,
  title: string,
  category: string,
  platform: string
): Promise<boolean> {
  return trackEvent({
    type: 'resource_shared',
    resourceId,
    category,
    properties: {
      title,
      platform,
      timestamp: new Date().toISOString(),
    },
  })
}
