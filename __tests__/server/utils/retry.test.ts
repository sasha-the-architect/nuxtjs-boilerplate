import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  retryWithBackoff,
  retryWithResult,
  isRetryableError,
  getRetryableHttpCodes,
  isRetryableHttpCode,
  retryPresets,
  RetryError,
} from '~/server/utils/retry'
import { afterEach } from 'vitest'

describe('isRetryableError', () => {
  describe('Happy Path - Retryable errors identified correctly', () => {
    it('should return true when retryableErrors is empty', () => {
      const error = new Error('any error')
      const result = isRetryableError(error, [])

      expect(result).toBe(true)
    })

    it('should match error by HTTP status code string', () => {
      const error = new Error('HTTP 500 error')
      const result = isRetryableError(error, [500])

      expect(result).toBe(true)
    })

    it('should match error by string pattern', () => {
      const error = new Error('ECONNRESET connection lost')
      const result = isRetryableError(error, ['ECONNRESET'])

      expect(result).toBe(true)
    })

    it('should match error by Error instance', () => {
      const customError = new Error('Custom error message')
      const result = isRetryableError(customError, [customError])

      expect(result).toBe(true)
    })
  })

  describe('Sad Path - Non-retryable errors identified correctly', () => {
    it('should return false when error does not match any retryable errors', () => {
      const error = new Error('HTTP 400 error')
      const result = isRetryableError(error, [500, 502, 503])

      expect(result).toBe(false)
    })

    it('should return false when Error instance does not match exactly', () => {
      const customError = new Error('Error message')
      const differentError = new Error('Error message')
      const result = isRetryableError(customError, [differentError])

      expect(result).toBe(false)
    })
  })
})

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Happy Path - Succeeds on first attempt', () => {
    it('should return result immediately when function succeeds on first try', async () => {
      const successFn = vi.fn().mockResolvedValue('success')

      const result = await retryWithBackoff(successFn)

      expect(result).toBe('success')
      expect(successFn).toHaveBeenCalledTimes(1)
    })

    it('should not delay when function succeeds immediately', async () => {
      const successFn = vi.fn().mockResolvedValue('success')

      const startTime = Date.now()
      await retryWithBackoff(successFn)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('Retry Behavior - Retries on failures with backoff', () => {
    it('should retry on failure with exponential backoff', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const result = await retryWithBackoff(failFn, {
        maxRetries: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        backoffMultiplier: 2,
        jitterEnabled: false,
      })

      expect(result).toBe('success')
      expect(failFn).toHaveBeenCalledTimes(3)
    })

    it('should use exponential backoff delay between retries', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const delays: number[] = []
      const originalSetTimeout = global.setTimeout
      global.setTimeout = vi.fn((cb, delay) => {
        delays.push(delay as number)
        return originalSetTimeout(cb, delay)
      }) as any

      await retryWithBackoff(failFn, {
        maxRetries: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        backoffMultiplier: 2,
        jitterEnabled: false,
      })

      expect(delays).toEqual([100, 200])

      global.setTimeout = originalSetTimeout
    })

    it('should stop retrying after max retries when all attempts fail', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await expect(
        retryWithBackoff(failFn, {
          maxRetries: 2,
          baseDelayMs: 100,
        })
      ).rejects.toThrow('All 3 retry attempts failed')

      expect(failFn).toHaveBeenCalledTimes(3)
    })

    it('should throw RetryError with all attempt details when all retries fail', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      let error: Error | undefined
      try {
        await retryWithBackoff(failFn, {
          maxRetries: 2,
          baseDelayMs: 100,
        })
      } catch (e) {
        error = e as Error
      }

      expect(error).toBeInstanceOf(RetryError)
      if (error instanceof RetryError) {
        expect(error.attempts).toBe(3)
        expect(error.errors).toHaveLength(3)
        expect(error.errors[0].attemptNumber).toBe(1)
        expect(error.errors[1].attemptNumber).toBe(2)
        expect(error.errors[2].attemptNumber).toBe(3)
      }
    })
  })

  describe('Retryable Error Filtering', () => {
    it('should not retry non-retryable errors', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('non-retryable error'))

      await expect(
        retryWithBackoff(failFn, {
          maxRetries: 3,
          retryableErrors: [500, 502, 503],
        })
      ).rejects.toThrow('non-retryable error')

      expect(failFn).toHaveBeenCalledTimes(1)
    })

    it('should retry only retryable errors', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('HTTP 500 error'))
        .mockRejectedValueOnce(new Error('HTTP 500 error'))
        .mockResolvedValue('success')

      const result = await retryWithBackoff(failFn, {
        maxRetries: 3,
        retryableErrors: [500],
      })

      expect(result).toBe('success')
      expect(failFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('Jitter - Random delay variation', () => {
    it('should add jitter to delay when enabled', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const delays: number[] = []
      const originalSetTimeout = global.setTimeout
      global.setTimeout = vi.fn((cb, delay) => {
        delays.push(delay as number)
        return originalSetTimeout(cb, delay)
      }) as any

      await retryWithBackoff(failFn, {
        maxRetries: 3,
        baseDelayMs: 100,
        jitterEnabled: true,
        jitterFactor: 0.1,
      })

      expect(delays).toHaveLength(2)
      delays.forEach(delay => {
        expect(delay).toBeGreaterThanOrEqual(90)
        expect(delay).toBeLessThanOrEqual(110)
      })

      global.setTimeout = originalSetTimeout
    })

    it('should not add jitter when disabled', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const delays: number[] = []
      const originalSetTimeout = global.setTimeout
      global.setTimeout = vi.fn((cb, delay) => {
        delays.push(delay as number)
        return originalSetTimeout(cb, delay)
      }) as any

      await retryWithBackoff(failFn, {
        maxRetries: 3,
        baseDelayMs: 100,
        backoffMultiplier: 2,
        jitterEnabled: false,
      })

      expect(delays).toEqual([100, 200])

      global.setTimeout = originalSetTimeout
    })
  })

  describe('Max Delay Capping', () => {
    it('should cap delay at maxDelayMs', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockRejectedValueOnce(new Error('fail 3'))
        .mockRejectedValueOnce(new Error('fail 4'))
        .mockResolvedValue('success')

      const delays: number[] = []
      const originalSetTimeout = global.setTimeout
      global.setTimeout = vi.fn((cb, delay) => {
        delays.push(delay as number)
        return originalSetTimeout(cb, delay)
      }) as any

      await retryWithBackoff(failFn, {
        maxRetries: 5,
        baseDelayMs: 100,
        maxDelayMs: 150,
        backoffMultiplier: 2,
        jitterEnabled: false,
      })

      expect(delays).toEqual([100, 150, 150, 150])

      global.setTimeout = originalSetTimeout
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle maxRetries of 0', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await expect(
        retryWithBackoff(failFn, {
          maxRetries: 0,
        })
      ).rejects.toThrow('fail')

      expect(failFn).toHaveBeenCalledTimes(1)
    })

    it('should handle negative delay values (should be capped at 0)', async () => {
      const successFn = vi.fn().mockResolvedValue('success')

      await expect(
        retryWithBackoff(successFn, {
          maxRetries: 1,
          baseDelayMs: -100,
        })
      ).resolves.toBe('success')
    })

    it('should handle non-Error exceptions', async () => {
      const throwString = vi.fn().mockRejectedValue('string error')

      await expect(
        retryWithBackoff(throwString, {
          maxRetries: 1,
          retryableErrors: ['string error'],
        })
      ).rejects.toThrow('string error')
    })

    it('should handle synchronous exceptions', async () => {
      const syncErrorFn = vi.fn(() => {
        throw new Error('sync error')
      })

      await expect(
        retryWithBackoff(syncErrorFn as any, {
          maxRetries: 1,
        })
      ).rejects.toThrow('sync error')
    })
  })
})

describe('retryWithResult', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Happy Path - Returns success result', () => {
    it('should return success result when function succeeds', async () => {
      const successFn = vi.fn().mockResolvedValue('success')

      const result = await retryWithResult(successFn)

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.error).toBeNull()
      expect(result.attempts).toBe(1)
      expect(result.totalDelayMs).toBe(0)
    })

    it('should return success result after retries', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const result = await retryWithResult(failFn, {
        maxRetries: 3,
        baseDelayMs: 100,
        backoffMultiplier: 2,
        jitterEnabled: false,
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.error).toBeNull()
      expect(result.attempts).toBe(3)
      expect(result.totalDelayMs).toBe(300)
    })
  })

  describe('Sad Path - Returns failure result', () => {
    it('should return failure result when all attempts fail', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      const result = await retryWithResult(failFn, {
        maxRetries: 2,
      })

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBeInstanceOf(RetryError)
      expect(result.attempts).toBe(3)
      expect(result.totalDelayMs).toBeGreaterThan(0)
    })

    it('should return failure result for non-retryable error', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('non-retryable'))

      const result = await retryWithResult(failFn, {
        maxRetries: 3,
        retryableErrors: [500],
      })

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBeInstanceOf(Error)
      expect(result.attempts).toBe(1)
      expect(result.totalDelayMs).toBe(0)
    })
  })

  describe('Delay Tracking', () => {
    it('should track total delay time correctly', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const result = await retryWithResult(failFn, {
        maxRetries: 3,
        baseDelayMs: 100,
        backoffMultiplier: 2,
        jitterEnabled: false,
      })

      expect(result.totalDelayMs).toBe(300)
    })
  })
})

describe('HTTP Code Helpers', () => {
  describe('getRetryableHttpCodes', () => {
    it('should return array of retryable HTTP status codes', () => {
      const codes = getRetryableHttpCodes()

      expect(codes).toEqual([408, 429, 500, 502, 503, 504])
      expect(codes).toContain(408)
      expect(codes).toContain(429)
      expect(codes).toContain(500)
      expect(codes).toContain(502)
      expect(codes).toContain(503)
      expect(codes).toContain(504)
    })
  })

  describe('isRetryableHttpCode', () => {
    it('should return true for retryable HTTP codes', () => {
      expect(isRetryableHttpCode(408)).toBe(true)
      expect(isRetryableHttpCode(429)).toBe(true)
      expect(isRetryableHttpCode(500)).toBe(true)
      expect(isRetryableHttpCode(502)).toBe(true)
      expect(isRetryableHttpCode(503)).toBe(true)
      expect(isRetryableHttpCode(504)).toBe(true)
    })

    it('should return false for non-retryable HTTP codes', () => {
      expect(isRetryableHttpCode(400)).toBe(false)
      expect(isRetryableHttpCode(401)).toBe(false)
      expect(isRetryableHttpCode(403)).toBe(false)
      expect(isRetryableHttpCode(404)).toBe(false)
      expect(isRetryableHttpCode(200)).toBe(false)
      expect(isRetryableHttpCode(301)).toBe(false)
    })
  })
})

describe('Retry Presets', () => {
  describe('quick preset', () => {
    it('should have quick preset configuration', () => {
      expect(retryPresets.quick).toHaveProperty('maxRetries', 2)
      expect(retryPresets.quick).toHaveProperty('baseDelayMs', 500)
      expect(retryPresets.quick).toHaveProperty('maxDelayMs', 5000)
      expect(retryPresets.quick).toHaveProperty('backoffMultiplier', 2)
      expect(retryPresets.quick).toHaveProperty('jitterEnabled', true)
      expect(retryPresets.quick).toHaveProperty('jitterFactor', 0.1)
    })
  })

  describe('standard preset', () => {
    it('should have standard preset configuration', () => {
      expect(retryPresets.standard).toHaveProperty('maxRetries', 3)
      expect(retryPresets.standard).toHaveProperty('baseDelayMs', 1000)
      expect(retryPresets.standard).toHaveProperty('maxDelayMs', 30000)
      expect(retryPresets.standard).toHaveProperty('backoffMultiplier', 2)
      expect(retryPresets.standard).toHaveProperty('jitterEnabled', true)
      expect(retryPresets.standard).toHaveProperty('jitterFactor', 0.1)
    })
  })

  describe('slow preset', () => {
    it('should have slow preset configuration', () => {
      expect(retryPresets.slow).toHaveProperty('maxRetries', 5)
      expect(retryPresets.slow).toHaveProperty('baseDelayMs', 2000)
      expect(retryPresets.slow).toHaveProperty('maxDelayMs', 60000)
      expect(retryPresets.slow).toHaveProperty('backoffMultiplier', 2)
      expect(retryPresets.slow).toHaveProperty('jitterEnabled', true)
      expect(retryPresets.slow).toHaveProperty('jitterFactor', 0.15)
    })
  })

  describe('aggressive preset', () => {
    it('should have aggressive preset configuration', () => {
      expect(retryPresets.aggressive).toHaveProperty('maxRetries', 3)
      expect(retryPresets.aggressive).toHaveProperty('baseDelayMs', 100)
      expect(retryPresets.aggressive).toHaveProperty('maxDelayMs', 5000)
      expect(retryPresets.aggressive).toHaveProperty('backoffMultiplier', 1.5)
      expect(retryPresets.aggressive).toHaveProperty('jitterEnabled', true)
      expect(retryPresets.aggressive).toHaveProperty('jitterFactor', 0.2)
    })
  })

  describe('httpRetry preset', () => {
    it('should have httpRetry preset configuration', () => {
      expect(retryPresets.httpRetry).toHaveProperty('maxRetries', 3)
      expect(retryPresets.httpRetry).toHaveProperty('baseDelayMs', 1000)
      expect(retryPresets.httpRetry).toHaveProperty('maxDelayMs', 30000)
      expect(retryPresets.httpRetry).toHaveProperty('backoffMultiplier', 2)
      expect(retryPresets.httpRetry).toHaveProperty('jitterEnabled', true)
      expect(retryPresets.httpRetry).toHaveProperty('jitterFactor', 0.1)
      expect(retryPresets.httpRetry.retryableErrors).toEqual(
        getRetryableHttpCodes()
      )
    })
  })

  describe('Using Presets', () => {
    it('should work with quick preset', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const result = await retryWithBackoff(failFn, retryPresets.quick)

      expect(result).toBe('success')
      expect(failFn).toHaveBeenCalledTimes(3)
    })

    it('should work with httpRetry preset', async () => {
      const failFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('HTTP 500 error'))
        .mockRejectedValueOnce(new Error('HTTP 500 error'))
        .mockResolvedValue('success')

      const result = await retryWithBackoff(failFn, retryPresets.httpRetry)

      expect(result).toBe('success')
      expect(failFn).toHaveBeenCalledTimes(3)
    })
  })
})

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Real-world scenarios', () => {
    it('should handle external API call with transient failures', async () => {
      const apiCall = vi
        .fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValue({ data: 'response' })

      const result = await retryWithBackoff(apiCall, {
        maxRetries: 3,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
        baseDelayMs: 100,
        jitterEnabled: false,
      })

      expect(result).toEqual({ data: 'response' })
      expect(apiCall).toHaveBeenCalledTimes(3)
    })

    it('should give up on persistent errors', async () => {
      const apiCall = vi
        .fn()
        .mockRejectedValue(new Error('HTTP 400 Bad Request'))

      await expect(
        retryWithBackoff(apiCall, {
          maxRetries: 3,
          retryableErrors: [500, 502, 503],
        })
      ).rejects.toThrow('HTTP 400 Bad Request')

      expect(apiCall).toHaveBeenCalledTimes(1)
    })

    it('should handle mixed success and failure patterns', async () => {
      const apiCall = vi
        .fn()
        .mockResolvedValueOnce({ data: 'response 1' })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: 'response 2' })
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({ data: 'response 3' })

      let callCount = 0
      const results = []

      for (let i = 0; i < 5; i++) {
        const result = await retryWithBackoff(
          () => {
            callCount++
            return apiCall()
          },
          {
            maxRetries: 2,
            baseDelayMs: 100,
            retryableErrors: ['Network error', 'Timeout'],
            jitterEnabled: false,
          }
        )
        results.push(result)
      }

      expect(results).toHaveLength(5)
      expect(results[0]).toEqual({ data: 'response 1' })
      expect(results[1]).toEqual({ data: 'response 2' })
      expect(results[2]).toEqual({ data: 'response 3' })
      expect(callCount).toBe(7)
    })
  })
})
