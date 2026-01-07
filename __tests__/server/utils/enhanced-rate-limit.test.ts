import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  rateLimitConfigs,
  getRateLimiterForPath,
  getRateLimitAnalytics,
} from '~/server/utils/enhanced-rate-limit'

describe('Enhanced Rate Limiting', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token Bucket Algorithm', () => {
    it('should create new bucket with initial tokens for new key', async () => {
      const limiter = rateLimitConfigs.general
      const result = await limiter.isAllowed('new-user-key')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThan(0)
    })

    it('should consume tokens on each request', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'consume-tokens-key'

      const result1 = await limiter.isAllowed(key)
      const result2 = await limiter.isAllowed(key)

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBeLessThan(result1.remaining!)
    })

    it('should refill tokens based on time intervals', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'refill-tokens-key'

      const originalNow = Date.now
      Date.now = vi.fn(() => 1000000)

      const result1 = await limiter.isAllowed(key)
      const remaining1 = result1.remaining!

      Date.now = vi.fn(() => 1000000 + 65000)

      const result2 = await limiter.isAllowed(key)
      const remaining2 = result2.remaining!

      Date.now = originalNow

      expect(remaining2).toBeGreaterThanOrEqual(remaining1)
    })

    it('should not exceed max tokens during refill', async () => {
      const limiter = rateLimitConfigs.search
      const key = 'max-tokens-key'

      const originalNow = Date.now
      Date.now = vi.fn(() => 1000000)

      const result1 = await limiter.isAllowed(key)

      Date.now = vi.fn(() => 1000000 + 120000)

      const result2 = await limiter.isAllowed(key)
      const status = await limiter.getStatus(key)

      Date.now = originalNow

      expect(status.remaining).toBeLessThanOrEqual(30)
      expect(result2.remaining).toBeLessThanOrEqual(30)
    })

    it('should provide correct reset time when rate limited', async () => {
      const limiter = rateLimitConfigs.heavy
      const key = 'reset-time-key'

      await limiter.isAllowed(key)
      await limiter.isAllowed(key)

      const result = await limiter.isAllowed(key)

      expect(result.allowed).toBe(false)
      expect(result.resetTime).toBeDefined()
      expect(result.resetTime!).toBeGreaterThan(Date.now() / 1000)
    })
  })

  describe('Rate Limit Exceeded Behavior', () => {
    it('should block requests when tokens exhausted', async () => {
      const limiter = rateLimitConfigs.export
      const key = 'exhausted-key'

      let allowedCount = 0
      for (let i = 0; i < 10; i++) {
        const result = await limiter.isAllowed(key)
        if (result.allowed) allowedCount++
      }

      expect(allowedCount).toBeLessThanOrEqual(5)
    })

    it('should return error message when rate limited', async () => {
      const limiter = rateLimitConfigs.export
      const key = 'error-msg-key'

      for (let i = 0; i < 10; i++) {
        await limiter.isAllowed(key)
      }

      const result = await limiter.isAllowed(key)

      expect(result.allowed).toBe(false)
      expect(result.message).toContain('export')
    })

    it('should return zero remaining when rate limited', async () => {
      const limiter = rateLimitConfigs.export
      const key = 'zero-remaining-key'

      for (let i = 0; i < 10; i++) {
        await limiter.isAllowed(key)
      }

      const result = await limiter.isAllowed(key)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })
  })

  describe('Admin Bypass Functionality', () => {
    it('should bypass rate limit with valid admin key', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'bypass-key'

      for (let i = 0; i < 200; i++) {
        const result = await limiter.isAllowed(key, 'valid-admin-key')
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(100)
      }
    })

    it('should show max remaining for bypassed requests', async () => {
      const limiter = rateLimitConfigs.search
      const key = 'bypass-remaining-key'

      const result = await limiter.isAllowed(key, 'valid-admin-key')

      expect(result.remaining).toBe(limiter.getConfig().maxRequests)
    })

    it('should provide future reset time for bypassed requests', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'bypass-reset-key'

      const result = await limiter.isAllowed(key, 'valid-admin-key')

      expect(result.resetTime).toBeGreaterThan(Date.now() / 1000)
    })

    it('should respect rate limit without valid bypass key', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'no-bypass-key'

      const result1 = await limiter.isAllowed(key)
      const result2 = await limiter.isAllowed(key, 'invalid-bypass-key')

      expect(result2.remaining).toBeLessThan(result1.remaining!)
    })
  })

  describe('Rate Limit Analytics', () => {
    it('should track total requests per path', async () => {
      const limiter = getRateLimiterForPath('/api/v1/search')
      const key = 'analytics-key-1'

      await limiter.isAllowed(key)
      await limiter.isAllowed(key)

      const analytics = getRateLimitAnalytics()
      const searchAnalytics = analytics.get('/api/v1/search')

      expect(searchAnalytics?.totalRequests).toBeGreaterThan(0)
    })

    it('should track blocked requests', async () => {
      const limiter = rateLimitConfigs.export
      const key = 'blocked-key'

      await limiter.isAllowed(key)
      await limiter.isAllowed(key)

      for (let i = 0; i < 5; i++) {
        await limiter.isAllowed(key)
      }

      const analytics = getRateLimitAnalytics()
      const exportAnalytics = analytics.get('/api/v1/export')

      expect(exportAnalytics?.blockedRequests).toBeGreaterThan(0)
    })

    it('should track bypassed requests', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'bypass-analytics-key'

      await limiter.isAllowed(key, 'valid-admin-key')

      const analytics = getRateLimitAnalytics()
      const generalAnalytics = analytics.get('/api/v1/test')

      expect(generalAnalytics?.bypassedRequests).toBeGreaterThan(0)
    })

    it('should initialize analytics for new paths', () => {
      const analytics = getRateLimitAnalytics()
      const testAnalytics = analytics.get('/new/test/path')

      expect(testAnalytics).toBeDefined()
      expect(testAnalytics?.totalRequests).toBe(0)
      expect(testAnalytics?.blockedRequests).toBe(0)
      expect(testAnalytics?.bypassedRequests).toBe(0)
    })
  })

  describe('Rate Limiter Status', () => {
    it('should return correct remaining tokens', async () => {
      const limiter = rateLimitConfigs.search
      const key = 'status-key'

      const status1 = await limiter.getStatus(key)
      await limiter.isAllowed(key)
      const status2 = await limiter.getStatus(key)

      expect(status2.remaining).toBeLessThan(status1.remaining)
    })

    it('should return max tokens for new key', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'new-status-key'

      const status = await limiter.getStatus(key)

      expect(status.remaining).toBeGreaterThan(0)
      expect(status.limit).toBe(limiter.getConfig().maxRequests)
    })

    it('should return correct limit', async () => {
      const limiter = rateLimitConfigs.export
      const key = 'limit-key'

      const status = await limiter.getStatus(key)

      expect(status.limit).toBe(5)
    })

    it('should calculate refilled tokens correctly', async () => {
      const limiter = rateLimitConfigs.heavy
      const key = 'refill-status-key'

      const originalNow = Date.now
      Date.now = vi.fn(() => 1000000)

      await limiter.isAllowed(key)
      await limiter.isAllowed(key)

      Date.now = vi.fn(() => 1000000 + 65000)

      const status = await limiter.getStatus(key)

      Date.now = originalNow

      expect(status.remaining).toBeGreaterThan(0)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset rate limit for specific key', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'reset-key'

      await limiter.isAllowed(key)
      await limiter.isAllowed(key)

      const statusBefore = await limiter.getStatus(key)
      const remainingBefore = statusBefore.remaining

      await limiter.reset(key)

      const statusAfter = await limiter.getStatus(key)
      const remainingAfter = statusAfter.remaining

      expect(remainingAfter).toBeGreaterThan(remainingBefore)
    })

    it('should create new bucket after reset', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'reset-new-bucket-key'

      await limiter.isAllowed(key)
      await limiter.reset(key)

      const result = await limiter.isAllowed(key)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThan(0)
    })

    it('should handle reset for non-existent key', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'non-existent-key'

      const result = await limiter.isAllowed(key)
      const remainingBefore = result.remaining!

      await limiter.reset(key)

      const result2 = await limiter.isAllowed(key)
      const remainingAfter = result2.remaining!

      expect(remainingAfter).toBeGreaterThan(0)
    })
  })

  describe('Path-Based Rate Limiting', () => {
    it('should use search limiter for search paths', () => {
      const limiter = getRateLimiterForPath('/api/v1/search')
      const config = limiter.getConfig()

      expect(config.maxRequests).toBe(30)
      expect(config.message).toContain('search')
    })

    it('should use export limiter for export paths', () => {
      const limiter = getRateLimiterForPath('/api/v1/export/csv')
      const config = limiter.getConfig()

      expect(config.maxRequests).toBe(5)
      expect(config.message).toContain('export')
    })

    it('should use heavy limiter for resources paths', () => {
      const limiter = getRateLimiterForPath('/api/v1/resources')
      const config = limiter.getConfig()

      expect(config.maxRequests).toBe(10)
      expect(config.message).toContain('heavy computation')
    })

    it('should use heavy limiter for categories paths', () => {
      const limiter = getRateLimiterForPath('/api/v1/categories')
      const config = limiter.getConfig()

      expect(config.maxRequests).toBe(10)
    })

    it('should use API limiter for other API paths', () => {
      const limiter = getRateLimiterForPath('/api/v1/other')
      const config = limiter.getConfig()

      expect(config.maxRequests).toBe(50)
    })

    it('should use general limiter for non-API paths', () => {
      const limiter = getRateLimiterForPath('/other/path')
      const config = limiter.getConfig()

      expect(config.maxRequests).toBe(100)
    })
  })

  describe('Rate Limiter Configuration', () => {
    it('should return correct configuration', () => {
      const limiter = rateLimitConfigs.general
      const config = limiter.getConfig()

      expect(config.windowMs).toBe(900000)
      expect(config.maxRequests).toBe(100)
      expect(config.tokensPerInterval).toBe(10)
      expect(config.intervalMs).toBe(60000)
      expect(config.message).toBe('Too many requests, please try again later.')
    })

    it('should have different configs for different limiters', () => {
      const generalConfig = rateLimitConfigs.general.getConfig()
      const searchConfig = rateLimitConfigs.search.getConfig()
      const exportConfig = rateLimitConfigs.export.getConfig()

      expect(generalConfig.maxRequests).not.toBe(searchConfig.maxRequests)
      expect(searchConfig.maxRequests).not.toBe(exportConfig.maxRequests)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple keys independently', async () => {
      const limiter = rateLimitConfigs.general

      const result1 = await limiter.isAllowed('key-1')
      const result2 = await limiter.isAllowed('key-2')
      const result3 = await limiter.isAllowed('key-1')

      expect(result1.remaining).toBe(result3.remaining)
      expect(result1.remaining).not.toBe(result2.remaining)
    })

    it('should handle rapid consecutive requests', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'rapid-key'

      const promises = []
      for (let i = 0; i < 20; i++) {
        promises.push(limiter.isAllowed(key))
      }

      const results = await Promise.all(promises)

      const allowedCount = results.filter((r: any) => r.allowed).length

      expect(allowedCount).toBe(20)
    })

    it('should handle status calls without consuming tokens', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'status-no-consume-key'

      const status1 = await limiter.getStatus(key)
      await limiter.getStatus(key)
      await limiter.getStatus(key)
      const status2 = await limiter.getStatus(key)

      expect(status2.remaining).toBe(status1.remaining)
    })

    it('should handle tokens exactly at limit', async () => {
      const limiter = rateLimitConfigs.export
      const key = 'exact-limit-key'

      const results = []
      for (let i = 0; i < 5; i++) {
        const result = await limiter.isAllowed(key)
        results.push(result)
      }

      const allowedCount = results.filter(r => r.allowed).length

      expect(allowedCount).toBe(5)
    })

    it('should handle status for bypassed requests', async () => {
      const limiter = rateLimitConfigs.general
      const key = 'bypass-status-key'

      await limiter.isAllowed(key, 'valid-admin-key')

      const status = await limiter.getStatus(key, 'valid-admin-key')

      expect(status.remaining).toBe(limiter.getConfig().maxRequests)
    })
  })
})
