import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SearchAnalyticsTracker } from '~/utils/searchAnalytics'
import type { Resource } from '~/types/resource'

// Get the global localStorage mock that's already set up in test-setup.ts
const localStorageMock = global.localStorage

describe('SearchAnalyticsTracker', () => {
  let tracker: SearchAnalyticsTracker

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()

    // Create a new instance for each test
    tracker = new SearchAnalyticsTracker()
  })

  describe('trackSearch', () => {
    it('should track a search query with results', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      tracker.trackSearch('test query', [mockResource], 100)

      const popularSearches = tracker.getPopularSearches()
      expect(popularSearches).toHaveLength(1)
      expect(popularSearches[0].query).toBe('test query')
      expect(popularSearches[0].count).toBe(1)
    })

    it('should track zero-result searches', () => {
      tracker.trackSearch('no results query', [], 150)

      const zeroResultSearches = tracker.getZeroResultSearches()
      expect(zeroResultSearches).toHaveLength(1)
      expect(zeroResultSearches[0].query).toBe('no results query')
      expect(zeroResultSearches[0].count).toBe(1)
    })

    it('should not track empty queries', () => {
      tracker.trackSearch('', [], 100)
      tracker.trackSearch('   ', [], 100)

      const popularSearches = tracker.getPopularSearches()
      const zeroResultSearches = tracker.getZeroResultSearches()
      expect(popularSearches).toHaveLength(0)
      expect(zeroResultSearches).toHaveLength(0)
    })

    it('should increment count for duplicate queries', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      tracker.trackSearch('test query', [mockResource], 100)
      tracker.trackSearch('test query', [mockResource], 150)

      const popularSearches = tracker.getPopularSearches()
      expect(popularSearches).toHaveLength(1)
      expect(popularSearches[0].count).toBe(2)
    })

    it('should track performance when duration is provided', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      tracker.trackSearch('performance query', [mockResource], 200)

      const metrics = tracker.getQueryPerformance('performance query')
      expect(metrics).not.toBeNull()
      expect(metrics?.avgDuration).toBe(200)
      expect(metrics?.totalSearches).toBe(1)
    })

    it('should normalize queries to lowercase', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      tracker.trackSearch('Test Query', [mockResource], 100)
      tracker.trackSearch('TEST QUERY', [mockResource], 120)

      const popularSearches = tracker.getPopularSearches()
      expect(popularSearches).toHaveLength(1)
      expect(popularSearches[0].query).toBe('test query')
      expect(popularSearches[0].count).toBe(2)
    })
  })

  describe('getPopularSearches', () => {
    it('should return popular searches sorted by count', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Track queries with different counts
      tracker.trackSearch('first query', [mockResource], 100)
      tracker.trackSearch('second query', [mockResource], 100)
      tracker.trackSearch('first query', [mockResource], 100) // Count: 2
      tracker.trackSearch('first query', [mockResource], 100) // Count: 3

      const popularSearches = tracker.getPopularSearches()
      expect(popularSearches).toHaveLength(2) // Top 2 by default
      expect(popularSearches[0].query).toBe('first query')
      expect(popularSearches[0].count).toBe(3)
      expect(popularSearches[1].query).toBe('second query')
      expect(popularSearches[1].count).toBe(1)
    })

    it('should limit results by provided limit', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Track multiple queries
      for (let i = 0; i < 5; i++) {
        tracker.trackSearch(`query ${i}`, [mockResource], 100)
      }

      const popularSearches = tracker.getPopularSearches(3)
      expect(popularSearches).toHaveLength(3)
    })
  })

  describe('getZeroResultSearches', () => {
    it('should return zero-result searches sorted by count', () => {
      // Track queries with no results
      tracker.trackSearch('no results 1', [], 100)
      tracker.trackSearch('no results 2', [], 100)
      tracker.trackSearch('no results 1', [], 100) // Count: 2

      const zeroResultSearches = tracker.getZeroResultSearches()
      expect(zeroResultSearches).toHaveLength(2) // Top 2 by default
      expect(zeroResultSearches[0].query).toBe('no results 1')
      expect(zeroResultSearches[0].count).toBe(2)
      expect(zeroResultSearches[1].query).toBe('no results 2')
      expect(zeroResultSearches[1].count).toBe(1)
    })

    it('should limit results by provided limit', () => {
      // Track multiple zero-result queries
      for (let i = 0; i < 5; i++) {
        tracker.trackSearch(`no results ${i}`, [], 100)
      }

      const zeroResultSearches = tracker.getZeroResultSearches(3)
      expect(zeroResultSearches).toHaveLength(3)
    })
  })

  describe('getRelatedSearches', () => {
    it('should return related searches based on similar terms', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Track some related queries
      tracker.trackSearch('javascript framework', [mockResource], 100)
      tracker.trackSearch('javascript library', [mockResource], 100)
      tracker.trackSearch('react component', [mockResource], 100)
      tracker.trackSearch('vue component', [mockResource], 100)

      const related = tracker.getRelatedSearches('javascript')
      expect(related).toContain('javascript framework')
      expect(related).toContain('javascript library')
      expect(related).toHaveLength(2) // Since only these two contain 'javascript'
    })

    it('should return related searches based on similar words', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Track some queries with similar words
      tracker.trackSearch('react tutorial', [mockResource], 100)
      tracker.trackSearch('react guide', [mockResource], 100)
      tracker.trackSearch('vue tutorial', [mockResource], 100)

      const related = tracker.getRelatedSearches('react')
      expect(related).toContain('react tutorial')
      expect(related).toContain('react guide')
    })

    it('should limit results by provided limit', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Track multiple queries
      for (let i = 0; i < 10; i++) {
        tracker.trackSearch(`javascript related ${i}`, [mockResource], 100)
      }

      const related = tracker.getRelatedSearches('javascript', 5)
      expect(related).toHaveLength(5)
    })
  })

  describe('performance metrics', () => {
    it('should calculate query performance metrics', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Track the same query multiple times with different durations
      tracker.trackSearch('performance query', [mockResource], 100)
      tracker.trackSearch('performance query', [mockResource], 200)
      tracker.trackSearch('performance query', [mockResource], 150)

      const metrics = tracker.getQueryPerformance('performance query')
      expect(metrics).not.toBeNull()
      expect(metrics?.avgDuration).toBe(150) // (100 + 200 + 150) / 3
      expect(metrics?.minDuration).toBe(100)
      expect(metrics?.maxDuration).toBe(200)
      expect(metrics?.totalSearches).toBe(3)
    })

    it('should return null for queries without performance data', () => {
      const metrics = tracker.getQueryPerformance('nonexistent query')
      expect(metrics).toBeNull()
    })

    it('should calculate overall performance metrics', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Track multiple queries
      tracker.trackSearch('query 1', [mockResource], 100)
      tracker.trackSearch('query 2', [mockResource], 200)
      tracker.trackSearch('query 3', [mockResource], 150)

      const metrics = tracker.getOverallPerformance()
      expect(metrics).not.toBeNull()
      expect(metrics?.avgDuration).toBe(150) // (100 + 200 + 150) / 3
      expect(metrics?.minDuration).toBe(100)
      expect(metrics?.maxDuration).toBe(200)
      expect(metrics?.totalSearches).toBe(3)
    })

    it('should return null for overall performance when no data', () => {
      const metrics = tracker.getOverallPerformance()
      expect(metrics).toBeNull()
    })

    it('should return slow queries above threshold', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Track queries with different durations
      tracker.trackSearch('fast query', [mockResource], 50) // Below threshold
      tracker.trackSearch('slow query 1', [mockResource], 300) // Above threshold
      tracker.trackSearch('slow query 2', [mockResource], 250) // Above threshold
      tracker.trackSearch('medium query', [mockResource], 150) // Below threshold

      const slowQueries = tracker.getSlowQueries(200, 10) // Threshold 200ms
      expect(slowQueries).toHaveLength(2)
      expect(slowQueries[0].query).toBe('slow query 1')
      expect(slowQueries[1].query).toBe('slow query 2')
      expect(slowQueries[0].avgDuration).toBe(300)
      expect(slowQueries[1].avgDuration).toBe(250)
    })
  })

  describe('localStorage integration', () => {
    beforeEach(() => {
      // Clear localStorage mock calls after setting up a fresh tracker
      localStorageMock.setItem.mockClear()
      localStorageMock.getItem.mockClear()
    })

    it('should save data to localStorage', () => {
      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Clear any calls from constructor before the test
      localStorageMock.setItem.mockClear()

      tracker.trackSearch('saved query', [mockResource], 100)

      // Check that setItem was called (we can't check exact arguments due to timing of constructor calls)
      expect(localStorageMock.setItem).toHaveBeenCalled()

      // Check that it was called with popularSearches key at some point
      const setItemCalls = localStorageMock.setItem.mock.calls
      const popularSearchesCall = setItemCalls.find(
        call => call[0] === 'popularSearches'
      )
      expect(popularSearchesCall).toBeDefined()
      expect(popularSearchesCall![1]).toBeInstanceOf(String)
    })

    it('should load data from localStorage', () => {
      const mockPopularSearches = [
        { query: 'loaded query', count: 5, lastUsed: new Date().toISOString() },
      ]
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify(mockPopularSearches)
      )
      localStorageMock.getItem.mockReturnValueOnce('[]') // For zeroResultSearches
      localStorageMock.getItem.mockReturnValueOnce('[]') // For performanceHistory

      // Create a new tracker instance which should trigger loading
      const newTracker = new SearchAnalyticsTracker()

      const popularSearches = newTracker.getPopularSearches()
      expect(popularSearches).toHaveLength(1)
      expect(popularSearches[0].query).toBe('loaded query')
      expect(popularSearches[0].count).toBe(5)
    })

    it('should handle errors when loading from localStorage', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })

      // This should not throw an error
      expect(() => {
        new SearchAnalyticsTracker()
      }).not.toThrow()
    })

    it('should handle errors when saving to localStorage', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })

      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // This should not throw an error
      expect(() => {
        tracker.trackSearch('error test query', [mockResource], 100)
      }).not.toThrow()
    })
  })

  describe('clear', () => {
    it('should clear all analytics data', () => {
      // Get initial counts before adding data
      const initialPopularCount = tracker.getPopularSearches().length
      const initialZeroResultCount = tracker.getZeroResultSearches().length

      const mockResource: Resource = {
        id: '1',
        name: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Testing',
        tags: ['test', 'example'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Add some data
      tracker.trackSearch('test query', [mockResource], 100)
      tracker.trackSearch('zero result query', [], 150)

      // Verify data exists (accounting for any initial data)
      expect(tracker.getPopularSearches()).toHaveLength(initialPopularCount + 1)
      expect(tracker.getZeroResultSearches()).toHaveLength(
        initialZeroResultCount + 1
      )

      // Clear the data
      tracker.clear()

      // Verify data is cleared
      expect(tracker.getPopularSearches()).toHaveLength(0)
      expect(tracker.getZeroResultSearches()).toHaveLength(0)
    })

    it('should save cleared data to localStorage', () => {
      // Clear any existing calls
      localStorageMock.setItem.mockClear()

      tracker.clear()

      // Check that setItem was called with empty arrays
      const setItemCalls = localStorageMock.setItem.mock.calls
      const popularSearchesCall = setItemCalls.find(
        call => call[0] === 'popularSearches'
      )
      const zeroResultSearchesCall = setItemCalls.find(
        call => call[0] === 'zeroResultSearches'
      )
      const performanceHistoryCall = setItemCalls.find(
        call => call[0] === 'performanceHistory'
      )

      expect(popularSearchesCall).toBeDefined()
      expect(zeroResultSearchesCall).toBeDefined()
      expect(performanceHistoryCall).toBeDefined()

      expect(popularSearchesCall![1]).toBe('[]')
      expect(zeroResultSearchesCall![1]).toBe('[]')
      expect(performanceHistoryCall![1]).toBe('[]')
    })
  })
})
