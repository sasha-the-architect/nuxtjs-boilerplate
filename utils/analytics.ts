// utils/analytics.ts
// Analytics data models and utilities for privacy-compliant user behavior tracking

import type { Resource } from '~/types/resource'

export interface AnalyticsEvent {
  id: string
  timestamp: number
  eventType:
    | 'page_view'
    | 'resource_click'
    | 'search'
    | 'filter'
    | 'bookmark'
    | 'share'
  userId?: string // Anonymous ID, not personal data
  sessionId: string
  url: string
  userAgent?: string
  ip?: string // For geographic analysis, not personal identification
  metadata?: {
    [key: string]: any
  }
  createdAt: Date
}

export interface AnalyticsData {
  events: AnalyticsEvent[]
  resourceMetrics: ResourceMetrics[]
  searchMetrics: SearchMetrics[]
  userMetrics: UserMetrics[]
}

export interface ResourceMetrics {
  resourceId: string
  resourceUrl: string
  clicks: number
  views: number
  bookmarks: number
  shares: number
  lastAccessed: Date
  popularPeriods: { hour: number; count: number }[] // Track hourly usage patterns
}

export interface SearchMetrics {
  query: string
  count: number
  resultsCount: number
  timestamp: Date
  noResults: boolean
}

export interface UserMetrics {
  sessionId: string
  pageViews: number
  sessionDuration: number
  pages: string[]
  deviceType: 'mobile' | 'tablet' | 'desktop'
  location?: string
  timestamp: Date
}

export interface DashboardMetrics {
  totalPageViews: number
  uniqueVisitors: number
  avgSessionDuration: number
  topResources: ResourceMetrics[]
  popularSearches: SearchMetrics[]
  userGrowth: { date: string; count: number }[]
  monthlyActiveUsers: number
  weeklyActiveUsers: number
  dailyActiveUsers: number
  bounceRate: number
}

export interface AnalyticsStorage {
  saveEvent(event: AnalyticsEvent): Promise<void>
  getEvents(from?: Date, to?: Date): Promise<AnalyticsEvent[]>
  getResourceMetrics(resourceId?: string): Promise<ResourceMetrics[]>
  getSearchMetrics(query?: string): Promise<SearchMetrics[]>
  getUserMetrics(): Promise<UserMetrics[]>
  getDashboardMetrics(): Promise<DashboardMetrics>
}

// In-memory analytics storage for development
// In production, this would connect to a database or file system
class InMemoryAnalyticsStorage implements AnalyticsStorage {
  private events: AnalyticsEvent[] = []
  private resourceMetrics: ResourceMetrics[] = []
  private searchMetrics: SearchMetrics[] = []
  private userMetrics: UserMetrics[] = []

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    this.events.push(event)

    // Update resource metrics if this is a resource-related event
    if (event.metadata?.resourceId) {
      await this.updateResourceMetrics(event)
    }

    // Update search metrics if this is a search event
    if (event.eventType === 'search') {
      await this.updateSearchMetrics(event)
    }

    // Update user metrics
    await this.updateUserMetrics(event)
  }

  private async updateResourceMetrics(event: AnalyticsEvent): Promise<void> {
    const resourceId = event.metadata?.resourceId
    if (!resourceId) return

    let resourceMetric = this.resourceMetrics.find(
      r => r.resourceId === resourceId
    )
    if (!resourceMetric) {
      resourceMetric = {
        resourceId,
        resourceUrl: event.metadata?.resourceUrl || '',
        clicks: 0,
        views: 0,
        bookmarks: 0,
        shares: 0,
        lastAccessed: new Date(event.timestamp),
        popularPeriods: Array(24)
          .fill(0)
          .map((_, i) => ({ hour: i, count: 0 })),
      }
      this.resourceMetrics.push(resourceMetric)
    }

    // Update metric based on event type
    switch (event.eventType) {
      case 'page_view':
        resourceMetric.views++
        break
      case 'resource_click':
        resourceMetric.clicks++
        break
      case 'bookmark':
        resourceMetric.bookmarks++
        break
      case 'share':
        resourceMetric.shares++
        break
    }

    // Update popular periods (hourly)
    const hour = new Date(event.timestamp).getHours()
    const period = resourceMetric.popularPeriods.find(p => p.hour === hour)
    if (period) {
      period.count++
    }

    resourceMetric.lastAccessed = new Date(event.timestamp)
  }

  private async updateSearchMetrics(event: AnalyticsEvent): Promise<void> {
    if (event.eventType !== 'search') return

    const query = event.metadata?.query
    if (!query) return

    let searchMetric = this.searchMetrics.find(s => s.query === query)
    if (!searchMetric) {
      searchMetric = {
        query,
        count: 0,
        resultsCount: event.metadata?.resultsCount || 0,
        timestamp: new Date(event.timestamp),
        noResults: event.metadata?.noResults || false,
      }
      this.searchMetrics.push(searchMetric)
    }

    searchMetric.count++
    searchMetric.timestamp = new Date(event.timestamp)
  }

  private async updateUserMetrics(event: AnalyticsEvent): Promise<void> {
    let userMetric = this.userMetrics.find(u => u.sessionId === event.sessionId)
    if (!userMetric) {
      userMetric = {
        sessionId: event.sessionId,
        pageViews: 0,
        sessionDuration: 0,
        pages: [],
        deviceType: this.getDeviceType(event.userAgent),
        timestamp: new Date(event.timestamp),
      }
      this.userMetrics.push(userMetric)
    }

    userMetric.pageViews++
    userMetric.pages.push(event.url)
  }

  private getDeviceType(userAgent?: string): 'mobile' | 'tablet' | 'desktop' {
    if (!userAgent) return 'desktop'

    const agent = userAgent.toLowerCase()
    if (/mobile|android|iphone|ipod|ipad/i.test(agent)) {
      if (/tablet|ipad/i.test(agent)) return 'tablet'
      return 'mobile'
    }
    return 'desktop'
  }

  async getEvents(from?: Date, to?: Date): Promise<AnalyticsEvent[]> {
    let events = this.events

    if (from) {
      events = events.filter(e => new Date(e.timestamp) >= from)
    }

    if (to) {
      events = events.filter(e => new Date(e.timestamp) <= to)
    }

    return events
  }

  async getResourceMetrics(resourceId?: string): Promise<ResourceMetrics[]> {
    if (resourceId) {
      return this.resourceMetrics.filter(r => r.resourceId === resourceId)
    }
    return this.resourceMetrics
  }

  async getSearchMetrics(query?: string): Promise<SearchMetrics[]> {
    if (query) {
      return this.searchMetrics.filter(s => s.query === query)
    }
    return this.searchMetrics
  }

  async getUserMetrics(): Promise<UserMetrics[]> {
    return this.userMetrics
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Calculate metrics
    const totalPageViews = this.events.filter(
      e => e.eventType === 'page_view'
    ).length
    const uniqueVisitors = new Set(this.events.map(e => e.sessionId)).size

    // Calculate session durations (simplified)
    const sessions = new Map<string, { start: number; end: number }>()
    this.events.forEach(event => {
      if (!sessions.has(event.sessionId)) {
        sessions.set(event.sessionId, {
          start: event.timestamp,
          end: event.timestamp,
        })
      } else {
        const session = sessions.get(event.sessionId)!
        session.end = Math.max(session.end, event.timestamp)
      }
    })

    const sessionDurations = Array.from(sessions.values()).map(
      s => s.end - s.start
    )
    const avgSessionDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
        : 0

    // Top resources by clicks
    const topResources = [...this.resourceMetrics]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Popular searches
    const popularSearches = [...this.searchMetrics]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // User growth
    const userGrowth = this.events
      .filter(e => e.eventType === 'page_view')
      .reduce((acc: { date: string; count: number }[], event) => {
        const date = new Date(event.timestamp).toISOString().split('T')[0]
        const existing = acc.find(d => d.date === date)
        if (existing) {
          existing.count++
        } else {
          acc.push({ date, count: 1 })
        }
        return acc
      }, [])
      .sort((a, b) => a.date.localeCompare(b.date))

    // Active users
    const dailyActiveUsers = new Set(
      this.events
        .filter(
          e =>
            new Date(e.timestamp) >=
            new Date(now.getTime() - 24 * 60 * 60 * 1000)
        )
        .map(e => e.sessionId)
    ).size

    const weeklyActiveUsers = new Set(
      this.events
        .filter(e => new Date(e.timestamp) >= weekAgo)
        .map(e => e.sessionId)
    ).size

    const monthlyActiveUsers = new Set(
      this.events
        .filter(e => new Date(e.timestamp) >= monthAgo)
        .map(e => e.sessionId)
    ).size

    // Bounce rate (simplified: sessions with only one page view)
    const singlePageSessions = Array.from(sessions.values()).filter(session => {
      const eventsInSession = this.events.filter(
        e =>
          e.sessionId ===
          Array.from(sessions.keys())[
            Array.from(sessions.values()).indexOf(session)
          ]
      )
      return (
        eventsInSession.filter(e => e.eventType === 'page_view').length === 1
      )
    }).length

    const totalSessions = sessions.size
    const bounceRate =
      totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0

    return {
      totalPageViews,
      uniqueVisitors,
      avgSessionDuration,
      topResources,
      popularSearches,
      userGrowth,
      monthlyActiveUsers,
      weeklyActiveUsers,
      dailyActiveUsers,
      bounceRate,
    }
  }
}

// Create a singleton instance for the app
const analyticsStorage: AnalyticsStorage = new InMemoryAnalyticsStorage()

export { analyticsStorage }
