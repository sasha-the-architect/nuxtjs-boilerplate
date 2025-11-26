import { describe, it, expect, beforeEach, vi } from 'vitest'
import { analyticsStorage } from '~/utils/analytics'

describe('Analytics System', () => {
  beforeEach(() => {
    // Reset analytics storage before each test
    // Note: In a real implementation, we'd use a fresh instance or clear the data
  })

  it('should save and retrieve analytics events', async () => {
    const event = {
      id: 'test-event-1',
      timestamp: Date.now(),
      eventType: 'page_view' as const,
      sessionId: 'test-session-1',
      url: '/test-page',
      userAgent: 'test-agent',
      ip: '127.0.0.1',
      metadata: { path: '/test-page' },
      createdAt: new Date(),
    }

    await analyticsStorage.saveEvent(event)
    const events = await analyticsStorage.getEvents()

    expect(events).toHaveLength(1)
    expect(events[0].id).toBe(event.id)
  })

  it('should calculate dashboard metrics', async () => {
    // Add a few test events
    const events = [
      {
        id: 'event-1',
        timestamp: Date.now(),
        eventType: 'page_view' as const,
        sessionId: 'session-1',
        url: '/page-1',
        userAgent: 'test-agent',
        ip: '127.0.0.1',
        metadata: { path: '/page-1' },
        createdAt: new Date(),
      },
      {
        id: 'event-2',
        timestamp: Date.now() + 1000,
        eventType: 'page_view' as const,
        sessionId: 'session-2',
        url: '/page-2',
        userAgent: 'test-agent',
        ip: '127.0.0.2',
        metadata: { path: '/page-2' },
        createdAt: new Date(),
      },
    ]

    for (const event of events) {
      await analyticsStorage.saveEvent(event)
    }

    const metrics = await analyticsStorage.getDashboardMetrics()

    expect(metrics.totalPageViews).toBeGreaterThanOrEqual(2)
    expect(metrics.uniqueVisitors).toBeGreaterThanOrEqual(2)
  })

  it('should handle resource metrics correctly', async () => {
    const resourceEvent = {
      id: 'resource-event-1',
      timestamp: Date.now(),
      eventType: 'resource_click' as const,
      sessionId: 'session-1',
      url: '/resources/test-resource',
      userAgent: 'test-agent',
      ip: '127.0.0.1',
      metadata: {
        resourceId: 'resource-1',
        resourceUrl: 'https://example.com',
        resourceName: 'Test Resource',
      },
      createdAt: new Date(),
    }

    await analyticsStorage.saveEvent(resourceEvent)

    const resourceMetrics =
      await analyticsStorage.getResourceMetrics('resource-1')

    expect(resourceMetrics).toHaveLength(1)
    expect(resourceMetrics[0].clicks).toBe(1)
    expect(resourceMetrics[0].resourceId).toBe('resource-1')
  })

  it('should handle search metrics correctly', async () => {
    const searchEvent = {
      id: 'search-event-1',
      timestamp: Date.now(),
      eventType: 'search' as const,
      sessionId: 'session-1',
      url: '/search?q=test',
      userAgent: 'test-agent',
      ip: '127.0.0.1',
      metadata: {
        query: 'test',
        resultsCount: 5,
        noResults: false,
      },
      createdAt: new Date(),
    }

    await analyticsStorage.saveEvent(searchEvent)

    const searchMetrics = await analyticsStorage.getSearchMetrics('test')

    expect(searchMetrics).toHaveLength(1)
    expect(searchMetrics[0].query).toBe('test')
    expect(searchMetrics[0].count).toBe(1)
  })
})
