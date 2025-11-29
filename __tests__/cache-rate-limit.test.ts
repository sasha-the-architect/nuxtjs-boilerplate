import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cacheManager } from '../server/utils/cache'
import {
  rateLimitConfigs,
  getRateLimiterForPath,
} from '../server/utils/enhanced-rate-limit'

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
  })

  describe('Rate Limiting', () => {
    it('should get correct rate limiter for different paths', () => {
      // Test that the correct rate limiter type is returned by checking config properties
      const searchLimiter = getRateLimiterForPath('/api/v1/search')
      expect(searchLimiter.config.maxRequests).toBe(
        rateLimitConfigs.search.config.maxRequests
      )
      expect(searchLimiter.config.message).toBe(
        rateLimitConfigs.search.config.message
      )

      const exportLimiter = getRateLimiterForPath('/api/v1/export/csv')
      expect(exportLimiter.config.maxRequests).toBe(
        rateLimitConfigs.export.config.maxRequests
      )
      expect(exportLimiter.config.message).toBe(
        rateLimitConfigs.export.config.message
      )

      const resourcesLimiter = getRateLimiterForPath('/api/v1/resources')
      expect(resourcesLimiter.config.maxRequests).toBe(
        rateLimitConfigs.heavy.config.maxRequests
      )
      expect(resourcesLimiter.config.message).toBe(
        rateLimitConfigs.heavy.config.message
      )

      const categoriesLimiter = getRateLimiterForPath('/api/v1/categories')
      expect(categoriesLimiter.config.maxRequests).toBe(
        rateLimitConfigs.heavy.config.maxRequests
      )
      expect(categoriesLimiter.config.message).toBe(
        rateLimitConfigs.heavy.config.message
      )

      const otherLimiter = getRateLimiterForPath('/api/v1/some-other')
      expect(otherLimiter.config.maxRequests).toBe(
        rateLimitConfigs.api.config.maxRequests
      )
      expect(otherLimiter.config.message).toBe(
        rateLimitConfigs.api.config.message
      )

      const generalLimiter = getRateLimiterForPath('/other-path')
      expect(generalLimiter.config.maxRequests).toBe(
        rateLimitConfigs.general.config.maxRequests
      )
      expect(generalLimiter.config.message).toBe(
        rateLimitConfigs.general.config.message
      )
    })

    it('should allow requests within limit', async () => {
      const key = 'test-allowed-key'
      const result = await rateLimitConfigs.general.isAllowed(key)
      expect(result.allowed).toBe(true)
    })

    it('should track remaining requests', async () => {
      const key = 'test-remaining-key'

      // Use up some tokens
      const result1 = await rateLimitConfigs.search.isAllowed(key)
      const result2 = await rateLimitConfigs.search.isAllowed(key)

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)

      const status = await rateLimitConfigs.search.getStatus(key)
      expect(status.remaining).toBeLessThanOrEqual(5) // Should have less than initial amount
    })
  })
})
