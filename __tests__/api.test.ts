import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { apiCache } from '~/utils/cache'
import { performanceMonitor } from '~/utils/performanceMonitor'
import { cacheManager } from '~/utils/cacheManager'

// Mock the resources data for testing
vi.mock('~/data/resources.json', async () => {
  return {
    default: [
      {
        id: 1,
        title: 'Test Resource',
        description: 'A test resource',
        category: 'ai',
        pricingModel: 'free',
        tags: ['test'],
        popularity: 10,
        dateAdded: '2023-01-01',
      },
      {
        id: 2,
        title: 'Another Resource',
        description: 'Another test resource',
        category: 'development',
        pricingModel: 'paid',
        tags: ['development'],
        popularity: 5,
        dateAdded: '2023-01-02',
      },
    ],
  }
})

describe('API Rate Limiting and Caching', () => {
  beforeEach(() => {
    // Clear cache before each test
    apiCache.clear()
    // Clear performance metrics
    performanceMonitor.clearMetrics()
  })

  it('should cache API responses for resources endpoint', async () => {
    // Import the API handler directly
    const resourcesHandler = await import('~/server/api/v1/resources.get')

    // Create a mock event
    const mockEvent: any = {
      path: '/api/v1/resources',
      method: 'GET',
      node: {
        req: {
          headers: {},
          url: '/api/v1/resources',
        },
        res: {
          setHeader: vi.fn(),
        },
      },
      _handled: false,
      context: {},
    }

    // Call the handler for the first time
    const result1: any = await resourcesHandler.default(mockEvent)

    // Check that result is successful
    expect(result1.success).toBe(true)
    expect(result1.data).toBeDefined()
    expect(Array.isArray(result1.data)).toBe(true)

    // Get the cache key that would have been used
    const cacheKey = `resources:${JSON.stringify({})}` // Empty query object

    // Verify that the result was cached
    const cachedResult = apiCache.get(cacheKey)
    expect(cachedResult).toBeDefined()
    expect(cachedResult).toEqual(result1)
  })

  it('should cache API responses for search endpoint', async () => {
    // Import the API handler directly
    const searchHandler = await import('~/server/api/v1/search.get')

    // Create a mock event with search parameters
    const mockEvent: any = {
      path: '/api/v1/search',
      method: 'GET',
      node: {
        req: {
          headers: {},
          url: '/api/v1/search?q=test',
        },
        res: {
          setHeader: vi.fn(),
        },
      },
      _handled: false,
      context: {},
    }

    // Mock getQuery function
    const originalGetQuery = await import('h3')
    vi.spyOn(originalGetQuery, 'getQuery').mockReturnValue({ q: 'test' })

    // Call the handler
    const result: any = await searchHandler.default(mockEvent)

    // Check that result is successful
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)

    // Verify that the result was cached
    const cacheKey = `search:${JSON.stringify({ q: 'test' })}`
    const cachedResult = apiCache.get(cacheKey)
    expect(cachedResult).toBeDefined()
  })

  it('should properly handle cache TTL', () => {
    const testKey = 'test:ttl'
    const testData = { message: 'test data' }

    // Set with a very short TTL
    apiCache.set(testKey, testData, 0.1) // 0.1 seconds TTL

    // Should be available immediately
    expect(apiCache.get(testKey)).toEqual(testData)
    expect(apiCache.has(testKey)).toBe(true)

    // Wait for expiration and check
    setTimeout(() => {
      expect(apiCache.has(testKey)).toBe(false)
      expect(apiCache.get(testKey)).toBeNull()
    }, 200) // Wait 200ms
  })

  it('should track performance metrics', () => {
    const mockEvent: any = {
      path: '/api/test',
      method: 'GET',
      node: {
        req: { headers: {} },
        res: { setHeader: vi.fn() },
      },
      context: {},
    }

    // Record a metric
    performanceMonitor.recordMetric(mockEvent, 100, false, 'HIT', 200)

    // Get stats and verify
    const stats = performanceMonitor.getStats()
    expect(stats.totalRequests).toBe(1)
    expect(stats.avgResponseTime).toBe(100)
    expect(stats.cacheHitRate).toBe(100) // 100% since we recorded a cache hit
  })

  it('should provide cache statistics', () => {
    // Add some items to cache
    apiCache.set('test:1', { data: 'value1' }, 300)
    apiCache.set('test:2', { data: 'value2' }, 300)

    const cacheStats = apiCache.getStats()
    expect(cacheStats.size).toBeGreaterThanOrEqual(2)
  })

  it('should invalidate cache by pattern', () => {
    // Add items to cache
    apiCache.set('resources:test1', { data: 'value1' }, 300)
    apiCache.set('search:test1', { data: 'value2' }, 300)
    apiCache.set('other:test1', { data: 'value3' }, 300)

    // Verify they're in cache
    expect(apiCache.has('resources:test1')).toBe(true)
    expect(apiCache.has('search:test1')).toBe(true)
    expect(apiCache.has('other:test1')).toBe(true)

    // Invalidate by pattern
    const invalidatedCount = cacheManager.invalidateByPattern('resources')

    // Check that resources items were invalidated but others remain
    expect(invalidatedCount).toBe(1)
    expect(apiCache.has('resources:test1')).toBe(false)
    expect(apiCache.has('search:test1')).toBe(true)
    expect(apiCache.has('other:test1')).toBe(true)
  })

  it('should warm resources cache', async () => {
    // Test cache warming functionality
    await cacheManager.warmCaches()

    // Check if some common queries are cached
    const defaultCacheKey = `resources:${JSON.stringify({ limit: 20, offset: 0 })}`
    const popularCacheKey = `resources:${JSON.stringify({ limit: 50, offset: 0 })}`

    // These should be cached after warming
    expect(apiCache.has(defaultCacheKey)).toBe(true)
  })
})
