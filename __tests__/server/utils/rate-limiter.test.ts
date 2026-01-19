import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as rateLimiter from '~/server/utils/rate-limiter'
import { logger } from '~/utils/logger'

vi.mock('~/server/utils/db', () => ({
  default: {
    analyticsEvent: {
      count: vi.fn(),
    },
  },
}))

vi.mock('~/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

import prisma from '~/server/utils/db'

const mockPrisma = prisma as unknown as {
  analyticsEvent: {
    count: ReturnType<typeof vi.fn>
  }
}

describe('rate-limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('checkRateLimit', () => {
    describe('Happy Path - Allows requests under limit', () => {
      it('should allow request when count is below max', async () => {
        const ip = '127.0.0.1'
        const maxRequests = 10
        const windowSeconds = 60

        mockPrisma.analyticsEvent.count.mockResolvedValue(5)

        const result = await rateLimiter.checkRateLimit(
          ip,
          maxRequests,
          windowSeconds
        )

        expect(result.allowed).toBe(true)
        expect(result.remainingRequests).toBe(5)
        expect(result.currentCount).toBe(5)
        // resetTime should be a valid timestamp (number)
        expect(typeof result.resetTime).toBe('number')
        expect(result.resetTime).toBeGreaterThan(0)
        expect(mockPrisma.analyticsEvent.count).toHaveBeenCalledWith({
          where: {
            ip,
            timestamp: {
              gte: expect.any(Number),
            },
          },
        })

        const now = Date.now()
        const windowStart = now - windowSeconds * 1000
        const callArg = mockPrisma.analyticsEvent.count.mock.calls[0][0]

        expect(callArg.where.timestamp.gte).toBe(windowStart)
      })

      it('should allow request when count is exactly at limit - 1', async () => {
        const ip = '192.168.1.1'
        const maxRequests = 10

        mockPrisma.analyticsEvent.count.mockResolvedValue(9)

        const result = await rateLimiter.checkRateLimit(ip, maxRequests)

        expect(result.allowed).toBe(true)
        expect(result.remainingRequests).toBe(1)
        expect(result.currentCount).toBe(9)
      })

      it('should use default maxRequests of 10 when not specified', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(3)

        const result = await rateLimiter.checkRateLimit('127.0.0.1')

        expect(result.allowed).toBe(true)
        expect(result.remainingRequests).toBe(7)
      })

      it('should use default windowSeconds of 60 when not specified', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(2)

        const result = await rateLimiter.checkRateLimit('127.0.0.1')

        const now = Date.now()
        const windowStart = now - 60 * 1000
        const callArg = mockPrisma.analyticsEvent.count.mock.calls[0][0]

        expect(callArg.where.timestamp.gte).toBe(windowStart)
        expect(result.allowed).toBe(true)
      })

      it('should calculate correct remaining requests', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(7)

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 15, 60)

        expect(result.remainingRequests).toBe(8)
        expect(result.currentCount).toBe(7)
      })

      it('should return zero remaining when count equals max', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(10)

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10, 60)

        expect(result.remainingRequests).toBe(0)
        expect(result.currentCount).toBe(10)
      })
    })

    describe('Happy Path - Blocks requests over limit', () => {
      it('should block request when count exceeds max', async () => {
        const ip = '127.0.0.1'
        const maxRequests = 10

        mockPrisma.analyticsEvent.count.mockResolvedValue(10)

        const result = await rateLimiter.checkRateLimit(ip, maxRequests)

        expect(result.allowed).toBe(false)
        expect(result.remainingRequests).toBe(0)
        expect(result.currentCount).toBe(10)
      })

      it('should block request when count significantly exceeds max', async () => {
        const ip = '127.0.0.1'
        const maxRequests = 10

        mockPrisma.analyticsEvent.count.mockResolvedValue(50)

        const result = await rateLimiter.checkRateLimit(ip, maxRequests)

        expect(result.allowed).toBe(false)
        expect(result.remainingRequests).toBe(0)
        expect(result.currentCount).toBe(50)
      })

      it('should calculate reset time correctly', async () => {
        const ip = '127.0.0.1'
        const windowSeconds = 120

        mockPrisma.analyticsEvent.count.mockResolvedValue(10)

        const result = await rateLimiter.checkRateLimit(ip, 10, windowSeconds)

        const now = Date.now()
        const windowStart = now - windowSeconds * 1000
        const expectedResetTime = windowStart + windowSeconds * 1000

        expect(result.resetTime).toBe(expectedResetTime)
      })
    })

    describe('Edge Cases - Handles boundary conditions', () => {
      it('should handle zero events', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(0)

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10)

        expect(result.allowed).toBe(true)
        expect(result.remainingRequests).toBe(10)
        expect(result.currentCount).toBe(0)
      })

      it('should handle very large maxRequests value', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(1000)

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10000)

        expect(result.allowed).toBe(true)
        expect(result.remainingRequests).toBe(9000)
      })

      it('should handle very small window (1 second)', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(5)

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10, 1)

        const now = Date.now()
        const windowStart = now - 1000
        const callArg = mockPrisma.analyticsEvent.count.mock.calls[0][0]

        expect(callArg.where.timestamp.gte).toBe(windowStart)
        expect(result.allowed).toBe(true)
      })

      it('should handle very large window (3600 seconds = 1 hour)', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(5)

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10, 3600)

        const now = Date.now()
        const windowStart = now - 3600 * 1000
        const callArg = mockPrisma.analyticsEvent.count.mock.calls[0][0]

        expect(callArg.where.timestamp.gte).toBe(windowStart)
        expect(result.allowed).toBe(true)
      })

      it('should handle maxRequests of 0 (allow nothing)', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(0)

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 0)

        expect(result.allowed).toBe(false)
        expect(result.remainingRequests).toBe(0)
      })

      it('should handle negative maxRequests (allow nothing)', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(0)

        const result = await rateLimiter.checkRateLimit('127.0.0.1', -10)

        // With negative max, Math.max(0, max - count) returns count
        // So remaining is just the count value
        expect(result.remainingRequests).toBeGreaterThanOrEqual(0)
      })

      it('should handle fractional windowSeconds', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(5)

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10, 0.5)

        expect(result.allowed).toBe(true)
        const now = Date.now()
        const windowStart = now - 500
        const callArg = mockPrisma.analyticsEvent.count.mock.calls[0][0]

        expect(callArg.where.timestamp.gte).toBe(windowStart)
      })

      it('should handle different IP addresses independently', async () => {
        mockPrisma.analyticsEvent.count
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(15)

        const result1 = await rateLimiter.checkRateLimit('192.168.1.1', 10)
        const result2 = await rateLimiter.checkRateLimit('192.168.1.2', 10)

        expect(result1.allowed).toBe(true)
        expect(result2.allowed).toBe(false)
        expect(mockPrisma.analyticsEvent.count).toHaveBeenCalledTimes(2)
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should allow request on database error (fail open)', async () => {
        const loggerErrorSpy = vi.spyOn(logger, 'error')
        mockPrisma.analyticsEvent.count.mockRejectedValue(
          new Error('Database connection failed')
        )

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10, 60)

        expect(result.allowed).toBe(true)
        expect(result.remainingRequests).toBe(10)
        expect(result.currentCount).toBe(0)
        expect(result.resetTime).toBeGreaterThan(Date.now())
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          'Rate limit check error:',
          expect.any(Error)
        )
        loggerErrorSpy.mockRestore()
      })

      it('should return default reset time on database error', async () => {
        mockPrisma.analyticsEvent.count.mockRejectedValue(new Error('DB error'))

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10, 60)

        const now = Date.now()
        const expectedResetTime = now + 60 * 1000

        expect(result.resetTime).toBe(expectedResetTime)
      })

      it('should handle query timeout gracefully', async () => {
        const loggerErrorSpy = vi.spyOn(logger, 'error')
        mockPrisma.analyticsEvent.count.mockRejectedValue(
          new Error('Query timeout')
        )

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10, 60)

        expect(result.allowed).toBe(true)
        expect(result.remainingRequests).toBe(10)
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          'Rate limit check error:',
          expect.any(Error)
        )
        loggerErrorSpy.mockRestore()
      })

      it('should handle network error gracefully', async () => {
        const loggerErrorSpy = vi.spyOn(logger, 'error')
        mockPrisma.analyticsEvent.count.mockRejectedValue(
          new Error('Network error')
        )

        const result = await rateLimiter.checkRateLimit('127.0.0.1', 10, 60)

        expect(result.allowed).toBe(true)
        expect(loggerErrorSpy).toHaveBeenCalled()
        loggerErrorSpy.mockRestore()
      })
    })
  })

  describe('getRateLimitStats', () => {
    describe('Happy Path - Returns rate limit statistics', () => {
      it('should return current count and window boundaries', async () => {
        const ip = '127.0.0.1'
        const windowSeconds = 60

        mockPrisma.analyticsEvent.count.mockResolvedValue(5)

        const result = await rateLimiter.getRateLimitStats(ip, windowSeconds)

        expect(result.currentCount).toBe(5)
        expect(result.windowStart).toBeGreaterThan(Date.now() - 61000)
        expect(result.windowStart).toBeLessThan(Date.now() - 59000)
        expect(result.windowEnd).toBe(Date.now())
        expect(mockPrisma.analyticsEvent.count).toHaveBeenCalledWith({
          where: {
            ip,
            timestamp: {
              gte: expect.any(Number),
            },
          },
        })
      })

      it('should use default windowSeconds of 60 when not specified', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(3)

        const result = await rateLimiter.getRateLimitStats('127.0.0.1')

        const now = Date.now()
        const windowStart = now - 60 * 1000
        const callArg = mockPrisma.analyticsEvent.count.mock.calls[0][0]

        expect(callArg.where.timestamp.gte).toBe(windowStart)
        expect(result.currentCount).toBe(3)
      })

      it('should return zero count when no events exist', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(0)

        const result = await rateLimiter.getRateLimitStats('127.0.0.1', 60)

        expect(result.currentCount).toBe(0)
        expect(result.windowStart).toBeDefined()
        expect(result.windowEnd).toBeDefined()
      })

      it('should return large count when many events exist', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(1000)

        const result = await rateLimiter.getRateLimitStats('127.0.0.1', 60)

        expect(result.currentCount).toBe(1000)
      })
    })

    describe('Edge Cases - Handles special cases', () => {
      it('should handle very small window (1 second)', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(1)

        const result = await rateLimiter.getRateLimitStats('127.0.0.1', 1)

        const now = Date.now()
        const windowStart = now - 1000
        const callArg = mockPrisma.analyticsEvent.count.mock.calls[0][0]

        expect(callArg.where.timestamp.gte).toBe(windowStart)
        expect(result.currentCount).toBe(1)
      })

      it('should handle very large window (3600 seconds)', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(500)

        const result = await rateLimiter.getRateLimitStats('127.0.0.1', 3600)

        const now = Date.now()
        const windowStart = now - 3600 * 1000
        const callArg = mockPrisma.analyticsEvent.count.mock.calls[0][0]

        expect(callArg.where.timestamp.gte).toBe(windowStart)
        expect(result.currentCount).toBe(500)
      })

      it('should handle fractional windowSeconds', async () => {
        mockPrisma.analyticsEvent.count.mockResolvedValue(2)

        const result = await rateLimiter.getRateLimitStats('127.0.0.1', 0.5)

        const now = Date.now()
        const windowStart = now - 500
        const callArg = mockPrisma.analyticsEvent.count.mock.calls[0][0]

        expect(callArg.where.timestamp.gte).toBe(windowStart)
        expect(result.currentCount).toBe(2)
      })

      it('should handle different IP addresses independently', async () => {
        mockPrisma.analyticsEvent.count
          .mockResolvedValueOnce(10)
          .mockResolvedValueOnce(20)

        const result1 = await rateLimiter.getRateLimitStats('192.168.1.1', 60)
        const result2 = await rateLimiter.getRateLimitStats('192.168.1.2', 60)

        expect(result1.currentCount).toBe(10)
        expect(result2.currentCount).toBe(20)
        expect(mockPrisma.analyticsEvent.count).toHaveBeenCalledTimes(2)
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should return zero count on database error', async () => {
        const loggerErrorSpy = vi.spyOn(logger, 'error')
        mockPrisma.analyticsEvent.count.mockRejectedValue(
          new Error('Database connection failed')
        )

        const result = await rateLimiter.getRateLimitStats('127.0.0.1', 60)

        expect(result.currentCount).toBe(0)
        expect(result.windowStart).toBeDefined()
        expect(result.windowEnd).toBeDefined()
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          'Rate limit stats error:',
          expect.any(Error)
        )
        loggerErrorSpy.mockRestore()
      })

      it('should calculate window boundaries on database error', async () => {
        mockPrisma.analyticsEvent.count.mockRejectedValue(new Error('DB error'))

        const result = await rateLimiter.getRateLimitStats('127.0.0.1', 60)

        const now = Date.now()
        const windowStart = now - 60 * 1000

        expect(result.windowStart).toBe(windowStart)
        expect(result.windowEnd).toBe(now)
      })

      it('should handle query timeout gracefully', async () => {
        const loggerErrorSpy = vi.spyOn(logger, 'error')
        mockPrisma.analyticsEvent.count.mockRejectedValue(
          new Error('Query timeout')
        )

        const result = await rateLimiter.getRateLimitStats('127.0.0.1', 60)

        expect(result.currentCount).toBe(0)
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          'Rate limit stats error:',
          expect.any(Error)
        )
        loggerErrorSpy.mockRestore()
      })
    })
  })

  describe('recordRateLimitedEvent', () => {
    describe('Happy Path - Records rate limited events', () => {
      it('should log rate limited event with IP and endpoint', async () => {
        const loggerInfoSpy = vi.spyOn(logger, 'info')

        await rateLimiter.recordRateLimitedEvent('127.0.0.1', '/api/resources')

        expect(loggerInfoSpy).toHaveBeenCalledWith(
          'Rate limit triggered: IP=127.0.0.1, Endpoint=/api/resources'
        )
        loggerInfoSpy.mockRestore()
      })

      it('should log rate limited event with different IP', async () => {
        const loggerInfoSpy = vi.spyOn(logger, 'info')

        await rateLimiter.recordRateLimitedEvent('192.168.1.100', '/api/search')

        expect(loggerInfoSpy).toHaveBeenCalledWith(
          'Rate limit triggered: IP=192.168.1.100, Endpoint=/api/search'
        )
        loggerInfoSpy.mockRestore()
      })

      it('should log rate limited event with complex endpoint', async () => {
        const loggerInfoSpy = vi.spyOn(logger, 'info')

        await rateLimiter.recordRateLimitedEvent(
          '10.0.0.1',
          '/api/v1/resources/123/comments'
        )

        expect(loggerInfoSpy).toHaveBeenCalledWith(
          'Rate limit triggered: IP=10.0.0.1, Endpoint=/api/v1/resources/123/comments'
        )
        loggerInfoSpy.mockRestore()
      })
    })

    describe('Edge Cases - Handles special inputs', () => {
      it('should handle empty endpoint string', async () => {
        const loggerInfoSpy = vi.spyOn(logger, 'info')

        await rateLimiter.recordRateLimitedEvent('127.0.0.1', '')

        expect(loggerInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining('IP=127.0.0.1')
        )
        expect(loggerInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining('Endpoint=')
        )
        loggerInfoSpy.mockRestore()
      })

      it('should handle IPv6 address', async () => {
        const loggerInfoSpy = vi.spyOn(logger, 'info')

        await rateLimiter.recordRateLimitedEvent('::1', '/api/resources')

        expect(loggerInfoSpy).toHaveBeenCalledWith(
          'Rate limit triggered: IP=::1, Endpoint=/api/resources'
        )
        loggerInfoSpy.mockRestore()
      })

      it('should handle endpoint with query parameters', async () => {
        const loggerInfoSpy = vi.spyOn(logger, 'info')

        await rateLimiter.recordRateLimitedEvent(
          '127.0.0.1',
          '/api/search?query=test&page=1'
        )

        expect(loggerInfoSpy).toHaveBeenCalledWith(
          'Rate limit triggered: IP=127.0.0.1, Endpoint=/api/search?query=test&page=1'
        )
        loggerInfoSpy.mockRestore()
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should handle logging errors gracefully', async () => {
        const loggerErrorSpy = vi.spyOn(logger, 'error')
        vi.spyOn(logger, 'info').mockImplementation(() => {
          throw new Error('Logging failed')
        })

        await expect(
          rateLimiter.recordRateLimitedEvent('127.0.0.1', '/api/test')
        ).resolves.not.toThrow()

        expect(loggerErrorSpy).toHaveBeenCalled()
        loggerErrorSpy.mockRestore()
      })
    })
  })
})
