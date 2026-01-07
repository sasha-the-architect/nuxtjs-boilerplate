import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  CircuitBreaker,
  getCircuitBreaker,
  resetCircuitBreaker,
  getAllCircuitBreakerStats,
} from '~/server/utils/circuit-breaker'

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeoutMs: 5000,
      monitoringWindowMs: 300000,
    })
  })

  describe('Happy Path - Circuit stays closed and executes successfully', () => {
    it('should execute function successfully when circuit is closed', async () => {
      const successFn = vi.fn().mockResolvedValue('success')

      const result = await breaker.execute(successFn)

      expect(result).toBe('success')
      expect(successFn).toHaveBeenCalledTimes(1)
    })

    it('should track successes and keep circuit closed when operations succeed', async () => {
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(successFn)
      await breaker.execute(successFn)
      await breaker.execute(successFn)

      const stats = breaker.getStats()
      expect(stats.state).toBe('closed')
      expect(stats.successCount).toBe(3)
      expect(stats.failureCount).toBe(0)
    })

    it('should reset failure count on success', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      expect(breaker.getStats().failureCount).toBe(2)

      await breaker.execute(successFn)

      expect(breaker.getStats().failureCount).toBe(0)
      expect(breaker.getStats().state).toBe('closed')
    })
  })

  describe('Circuit Opening - Opens after failure threshold', () => {
    it('should open circuit after reaching failure threshold', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await breaker.execute(failFn).catch(() => {})
      expect(breaker.getStats().state).toBe('closed')

      await breaker.execute(failFn).catch(() => {})
      expect(breaker.getStats().state).toBe('closed')

      await breaker.execute(failFn).catch(() => {})

      expect(breaker.getStats().state).toBe('open')
      expect(breaker.isOpen()).toBe(true)
    })

    it('should not execute function when circuit is open', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      await expect(breaker.execute(successFn)).rejects.toThrow(
        'Circuit breaker is OPEN'
      )
      expect(successFn).not.toHaveBeenCalled()
    })

    it('should track last failure time when circuit opens', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      const beforeThirdFailure = Date.now()
      await breaker.execute(failFn).catch(() => {})

      const stats = breaker.getStats()
      expect(stats.lastFailureTime).toBeGreaterThanOrEqual(beforeThirdFailure)
      expect(stats.lastFailureTime).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('Fallback Behavior - Uses fallback when circuit is open', () => {
    it('should execute fallback function when circuit is open', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const fallbackFn = vi.fn().mockResolvedValue('fallback')

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      const result = await breaker.execute(
        vi.fn().mockResolvedValue('success'),
        fallbackFn
      )

      expect(result).toBe('fallback')
      expect(fallbackFn).toHaveBeenCalledTimes(1)
    })

    it('should use fallback on individual failures if provided', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const fallbackFn = vi.fn().mockResolvedValue('fallback')

      const result = await breaker.execute(failFn, fallbackFn)

      expect(result).toBe('fallback')
      expect(failFn).toHaveBeenCalledTimes(1)
      expect(fallbackFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Circuit Recovery - Half-open and closed states', () => {
    it('should transition to half-open after timeout when called', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      expect(breaker.getStats().state).toBe('open')

      vi.useFakeTimers()
      vi.advanceTimersByTime(5001)

      expect(breaker.getStats().state).toBe('open')

      await breaker
        .execute(vi.fn().mockResolvedValue('success'))
        .catch(() => {})
      expect(breaker.getStats().state).toBe('half-open')

      vi.useRealTimers()
    })

    it('should allow execution when in half-open state', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      vi.useFakeTimers()
      vi.advanceTimersByTime(5001)

      const result = await breaker.execute(successFn)
      expect(result).toBe('success')
      expect(successFn).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('should close circuit after reaching success threshold in half-open state', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      expect(breaker.getStats().state).toBe('open')

      const originalDateNow = Date.now
      vi.useFakeTimers()
      vi.spyOn(Date, 'now').mockReturnValue(originalDateNow() + 5001)

      await breaker.execute(successFn)
      expect(breaker.getStats().successCount).toBe(1)

      await breaker.execute(successFn)
      expect(breaker.isOpen()).toBe(false)
      expect(breaker.getStats().failureCount).toBe(0)

      vi.useRealTimers()
    })

    it('should reopen circuit on failure in half-open state', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      expect(breaker.getStats().state).toBe('open')

      const originalDateNow = Date.now
      vi.useFakeTimers()
      vi.spyOn(Date, 'now').mockReturnValue(originalDateNow() + 5001)

      await breaker.execute(successFn)
      expect(breaker.getStats().successCount).toBe(1)

      await breaker.execute(failFn).catch(() => {})

      expect(breaker.isOpen()).toBe(true)
      expect(breaker.getStats().failureCount).toBe(1)

      vi.useRealTimers()
    })
  })

  describe('Statistics and Monitoring', () => {
    it('should calculate failure rate correctly', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      const statsBeforeSuccess = breaker.getStats()
      expect(statsBeforeSuccess.failureCount).toBe(2)
      expect(statsBeforeSuccess.successCount).toBe(0)

      await breaker.execute(successFn)

      const statsAfterSuccess = breaker.getStats()
      expect(statsAfterSuccess.failureRate).toBe(0)
    })

    it('should return 0% failure rate when no failures', async () => {
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(successFn)
      await breaker.execute(successFn)

      const stats = breaker.getStats()
      expect(stats.failureRate).toBe(0)
    })

    it('should track last success time', async () => {
      const successFn = vi.fn().mockResolvedValue('success')

      const beforeSuccess = Date.now()
      await breaker.execute(successFn)
      const afterSuccess = Date.now()

      const stats = breaker.getStats()
      expect(stats.lastSuccessTime).toBeGreaterThanOrEqual(beforeSuccess)
      expect(stats.lastSuccessTime).toBeLessThanOrEqual(afterSuccess)
    })

    it('should return correct stats object structure', async () => {
      const stats = breaker.getStats()

      expect(stats).toHaveProperty('state')
      expect(stats).toHaveProperty('failureCount')
      expect(stats).toHaveProperty('successCount')
      expect(stats).toHaveProperty('lastFailureTime')
      expect(stats).toHaveProperty('lastSuccessTime')
      expect(stats).toHaveProperty('failureRate')

      expect(['closed', 'open', 'half-open']).toContain(stats.state)
      expect(typeof stats.failureCount).toBe('number')
      expect(typeof stats.successCount).toBe('number')
      expect(typeof stats.failureRate).toBe('number')
    })
  })

  describe('Reset Functionality', () => {
    it('should reset circuit to closed state when reset is called', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      expect(breaker.getStats().state).toBe('open')

      breaker.reset()

      expect(breaker.getStats().state).toBe('closed')
      expect(breaker.getStats().failureCount).toBe(0)
      expect(breaker.getStats().successCount).toBe(0)
      expect(breaker.getStats().lastFailureTime).toBe(null)
    })

    it('should allow execution after reset', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      breaker.reset()

      const result = await breaker.execute(successFn)
      expect(result).toBe('success')
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle failure threshold of 1', async () => {
      const breakerWithLowThreshold = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 1,
        timeoutMs: 5000,
        monitoringWindowMs: 300000,
      })

      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await breakerWithLowThreshold.execute(failFn).catch(() => {})

      expect(breakerWithLowThreshold.getStats().state).toBe('open')
    })

    it('should handle success threshold of 1', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      expect(breaker.getStats().state).toBe('open')

      const originalDateNow = Date.now
      vi.useFakeTimers()
      vi.spyOn(Date, 'now').mockReturnValue(originalDateNow() + 5001)

      await breaker.execute(successFn)

      expect(breaker.isOpen()).toBe(false)

      vi.useRealTimers()
    })

    it('should handle very short timeout (100ms)', async () => {
      const breakerWithShortTimeout = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        timeoutMs: 100,
        monitoringWindowMs: 300000,
      })

      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await breakerWithShortTimeout.execute(failFn).catch(() => {})
      await breakerWithShortTimeout.execute(failFn).catch(() => {})

      expect(breakerWithShortTimeout.getStats().state).toBe('open')

      const originalDateNow = Date.now
      vi.useFakeTimers()
      vi.spyOn(Date, 'now').mockReturnValue(originalDateNow() + 101)

      await breakerWithShortTimeout
        .execute(vi.fn().mockResolvedValue('success'))
        .catch(() => {})

      expect(breakerWithShortTimeout.getStats().state).toBe('half-open')

      vi.useRealTimers()
    })

    it('should handle synchronous exceptions', async () => {
      const syncErrorFn = vi.fn(() => {
        throw new Error('sync error')
      })

      await expect(breaker.execute(syncErrorFn as any)).rejects.toThrow(
        'sync error'
      )
    })

    it('should handle null/undefined results correctly', async () => {
      const nullFn = vi.fn().mockResolvedValue(null)
      const undefinedFn = vi.fn().mockResolvedValue(undefined)

      const nullResult = await breaker.execute(nullFn)
      const undefinedResult = await breaker.execute(undefinedFn)

      expect(nullResult).toBeNull()
      expect(undefinedResult).toBeUndefined()
    })
  })
})

describe('Circuit Breaker Manager', () => {
  beforeEach(() => {
    const allKeys = Object.keys(getAllCircuitBreakerStats())
    allKeys.forEach(key => resetCircuitBreaker(key))
  })

  describe('getCircuitBreaker', () => {
    it('should return same circuit breaker instance for same key', () => {
      const breaker1 = getCircuitBreaker('service-1')
      const breaker2 = getCircuitBreaker('service-1')

      expect(breaker1).toBe(breaker2)
    })

    it('should return different circuit breaker instances for different keys', () => {
      const breaker1 = getCircuitBreaker('service-1')
      const breaker2 = getCircuitBreaker('service-2')

      expect(breaker1).not.toBe(breaker2)
    })

    it('should apply custom config to new circuit breaker', () => {
      const customBreaker = getCircuitBreaker('custom-service', {
        failureThreshold: 10,
        successThreshold: 5,
        timeoutMs: 30000,
      })

      expect(customBreaker.isOpen()).toBe(false)
    })

    it('should use default config when no custom config provided', () => {
      const defaultBreaker = getCircuitBreaker('default-service')

      expect(defaultBreaker).toBeInstanceOf(CircuitBreaker)
    })
  })

  describe('resetCircuitBreaker', () => {
    it('should reset circuit breaker for given key', async () => {
      const breaker = getCircuitBreaker('service-to-reset', {
        failureThreshold: 2,
        successThreshold: 1,
        timeoutMs: 5000,
        monitoringWindowMs: 300000,
      })
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await breaker.execute(failFn).catch(() => {})
      await breaker.execute(failFn).catch(() => {})

      expect(breaker.getStats().state).toBe('open')

      resetCircuitBreaker('service-to-reset')

      expect(breaker.getStats().state).toBe('closed')
    })

    it('should handle reset of non-existent circuit breaker gracefully', () => {
      expect(() => resetCircuitBreaker('non-existent')).not.toThrow()
    })
  })

  describe('getAllCircuitBreakerStats', () => {
    it('should return stats for all circuit breakers', () => {
      const allKeys = Object.keys(getAllCircuitBreakerStats())
      const initialCount = allKeys.length

      getCircuitBreaker('manager-test-1')
      getCircuitBreaker('manager-test-2')
      getCircuitBreaker('manager-test-3')

      const stats = getAllCircuitBreakerStats()

      expect(stats).toHaveProperty('manager-test-1')
      expect(stats).toHaveProperty('manager-test-2')
      expect(stats).toHaveProperty('manager-test-3')
      expect(Object.keys(stats).length).toBe(initialCount + 3)
    })

    it('should return correct stats structure for each circuit breaker', () => {
      getCircuitBreaker('test-service')

      const stats = getAllCircuitBreakerStats()
      const serviceStats = stats['test-service']

      expect(serviceStats).toHaveProperty('state')
      expect(serviceStats).toHaveProperty('failureCount')
      expect(serviceStats).toHaveProperty('successCount')
      expect(serviceStats).toHaveProperty('lastFailureTime')
      expect(serviceStats).toHaveProperty('lastSuccessTime')
      expect(serviceStats).toHaveProperty('failureRate')
    })

    it('should track existing circuit breakers correctly', () => {
      const stats = getAllCircuitBreakerStats()

      expect(stats).toBeInstanceOf(Object)
      expect(Object.keys(stats).length).toBeGreaterThan(0)
    })
  })

  describe('Isolation Between Circuit Breakers', () => {
    it('should keep circuit breakers isolated from each other', async () => {
      const breaker1 = getCircuitBreaker('isolated-service-1', {
        failureThreshold: 2,
        successThreshold: 1,
        timeoutMs: 5000,
        monitoringWindowMs: 300000,
      })

      const breaker2 = getCircuitBreaker('isolated-service-2', {
        failureThreshold: 2,
        successThreshold: 1,
        timeoutMs: 5000,
        monitoringWindowMs: 300000,
      })

      const failFn = vi.fn().mockRejectedValue(new Error('fail'))
      const successFn = vi.fn().mockResolvedValue('success')

      await breaker1.execute(failFn).catch(() => {})
      await breaker1.execute(failFn).catch(() => {})

      await breaker2.execute(successFn)
      await breaker2.execute(successFn)

      expect(breaker1.getStats().state).toBe('open')
      expect(breaker2.getStats().state).toBe('closed')
    })
  })
})
