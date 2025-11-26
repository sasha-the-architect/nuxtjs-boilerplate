import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cacheManager } from '../server/utils/cache'
import {
  rateLimitConfigs,
  getRateLimiterForPath,
  tieredRateLimitConfigs,
  getRateLimitAnalytics,
} from '../server/utils/rate-limit'

describe('Cache and Rate Limiting System', () => {
  beforeEach(() => {
    // Clear cache before each test
    cacheManager.clear()
  })

  describe('Cache Manager', () => {
    it('should store and retrieve values', async () => {
      const key = 'test-key'
      const value = { data: 'test-value' }

      const setResult = await cacheManager.set(key, value, 300) // 5 minutes TTL
      expect(setResult).toBe(true)

      const getResult = await cacheManager.get(key)
      expect(getResult).toEqual(value)
    })

    it('should return null for non-existent keys', async () => {
      const result = await cacheManager.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('should respect TTL and expire entries', async () => {
      const key = 'expiring-key'
      const value = 'test-value'

      // Mock Date.now to simulate time passing
      const originalNow = Date.now
      Date.now = vi.fn(() => 1000000)

      await cacheManager.set(key, value, 1) // 1 second TTL

      // Move time forward past TTL
      Date.now = vi.fn(() => 2000000) // 1 second later

      const result = await cacheManager.get(key)
      expect(result).toBeNull()

      // Restore original Date.now
      Date.now = originalNow
    })

    it('should handle cache has method', async () => {
      const key = 'test-has-key'
      const value = 'test-value'

      await cacheManager.set(key, value, 300)
      const hasKey = await cacheManager.has(key)
      expect(hasKey).toBe(true)

      const hasNonExistent = await cacheManager.has('non-existent')
      expect(hasNonExistent).toBe(false)
    })

    it('should delete keys', async () => {
      const key = 'delete-test-key'
      await cacheManager.set(key, 'test-value', 300)

      const hasBefore = await cacheManager.has(key)
      expect(hasBefore).toBe(true)

      const deleteResult = await cacheManager.delete(key)
      expect(deleteResult).toBe(true)

      const hasAfter = await cacheManager.has(key)
      expect(hasAfter).toBe(false)
    })

    it('should track cache statistics correctly', async () => {
      const key = 'stats-test-key'
      const value = 'test-value'

      // Initial stats
      const initialStats = cacheManager.getStats()
      expect(initialStats.hits).toBe(0)
      expect(initialStats.misses).toBe(0)
      expect(initialStats.total).toBe(0)
      expect(initialStats.hitRate).toBe(0)

      // First get should be a miss
      const missResult = await cacheManager.get(key)
      expect(missResult).toBeNull()
      const statsAfterMiss = cacheManager.getStats()
      expect(statsAfterMiss.misses).toBe(1)
      expect(statsAfterMiss.total).toBe(1)
      expect(statsAfterMiss.hitRate).toBe(0)

      // Set value
      await cacheManager.set(key, value, 300)

      // Second get should be a hit
      const hitResult = await cacheManager.get(key)
      expect(hitResult).toBe(value)
      const statsAfterHit = cacheManager.getStats()
      expect(statsAfterHit.hits).toBe(1)
      expect(statsAfterHit.total).toBe(2)
      expect(statsAfterHit.hitRate).toBe(0.5)
    })
  })

  describe('Rate Limiting', () => {
    it('should get correct rate limiter for different paths with basic tier', () => {
      expect(getRateLimiterForPath('/api/v1/search', 'basic')).toBe(
        tieredRateLimitConfigs.basic.search
      )
      expect(getRateLimiterForPath('/api/v1/export/csv', 'basic')).toBe(
        tieredRateLimitConfigs.basic.export
      )
      expect(getRateLimiterForPath('/api/v1/resources', 'basic')).toBe(
        tieredRateLimitConfigs.basic.heavy
      )
      expect(getRateLimiterForPath('/api/v1/categories', 'basic')).toBe(
        tieredRateLimitConfigs.basic.heavy
      )
      expect(getRateLimiterForPath('/api/v1/some-other', 'basic')).toBe(
        tieredRateLimitConfigs.basic.api
      )
      expect(getRateLimiterForPath('/other-path', 'basic')).toBe(
        tieredRateLimitConfigs.basic.general
      )
    })

    it('should get higher limits for premium users', () => {
      const basicLimiter = getRateLimiterForPath('/api/v1/search', 'basic')
      const premiumLimiter = getRateLimiterForPath('/api/v1/search', 'premium')

      // The premium limiter should have a higher maxRequests than basic
      expect(basicLimiter['config'].maxRequests).toBeLessThan(
        premiumLimiter['config'].maxRequests
      )
    })

    it('should allow requests within limit', async () => {
      const key = 'test-allowed-key'
      const result = await tieredRateLimitConfigs.basic.general.isAllowed(key)
      expect(result.allowed).toBe(true)
    })

    it('should track remaining requests', async () => {
      const key = 'test-remaining-key'

      // Use up some tokens
      const result1 = await tieredRateLimitConfigs.basic.search.isAllowed(key)
      const result2 = await tieredRateLimitConfigs.basic.search.isAllowed(key)

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)

      const status = await tieredRateLimitConfigs.basic.search.getStatus(key)
      expect(status.remaining).toBeLessThanOrEqual(30) // Should have less than initial amount
    })

    it('should handle rate limit analytics', () => {
      const analytics = getRateLimitAnalytics('test-key')
      expect(analytics.totalRequests).toBeGreaterThanOrEqual(0)
      expect(analytics.totalBlocked).toBeGreaterThanOrEqual(0)
      expect(analytics.recentRate).toBeGreaterThanOrEqual(0)
    })
  })
})
