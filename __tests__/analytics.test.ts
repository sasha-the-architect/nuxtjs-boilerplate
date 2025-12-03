import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  trackEvent,
  trackPageView,
  trackResourceClick,
  trackResourceView,
  trackSearch,
  trackFilter,
} from '~/utils/analytics'

// Mock the fetch API
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock console.error to prevent test output pollution
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Analytics Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock fetch to its initial state
    mockFetch.mockReset()
  })

  describe('trackEvent', () => {
    it('should send analytics event to the API', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
        ok: true,
      })

      const result = await trackEvent({
        type: 'test_event',
        properties: { test: 'value' },
      })

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test_event',
          properties: { test: 'value' },
        }),
      })
    })

    it('should return false when API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ success: false, message: 'Error occurred' }),
        ok: true,
      })

      const result = await trackEvent({
        type: 'test_event',
      })

      expect(result).toBe(false)
    })

    it('should return false when fetch throws an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await trackEvent({
        type: 'test_event',
      })

      expect(result).toBe(false)
    })
  })

  describe('trackPageView', () => {
    it('should track a page view event', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
        ok: true,
      })

      const result = await trackPageView('/test-page', 'Test Page')

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"type":"page_view"'),
      })
    })
  })

  describe('trackResourceClick', () => {
    it('should track a resource click event', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
        ok: true,
      })

      const result = await trackResourceClick(
        'resource-123',
        'Test Resource',
        'AI Tools'
      )

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'resource_click',
          resourceId: 'resource-123',
          category: 'AI Tools',
          properties: {
            title: 'Test Resource',
          },
        }),
      })
    })
  })

  describe('trackResourceView', () => {
    it('should track a resource view event', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
        ok: true,
      })

      const result = await trackResourceView(
        'resource-123',
        'Test Resource',
        'AI Tools'
      )

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'resource_view',
          resourceId: 'resource-123',
          category: 'AI Tools',
          properties: {
            title: 'Test Resource',
          },
        }),
      })
    })
  })

  describe('trackSearch', () => {
    it('should track a search event', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
        ok: true,
      })

      const result = await trackSearch('test query', 5)

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"type":"search"'),
      })
    })
  })

  describe('trackFilter', () => {
    it('should track a filter event', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
        ok: true,
      })

      const result = await trackFilter('category', 'AI Tools')

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'filter_applied',
          properties: {
            filterType: 'category',
            filterValue: 'AI Tools',
          },
        }),
      })
    })
  })
})
