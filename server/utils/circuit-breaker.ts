interface CircuitBreakerState {
  isOpen: boolean
  failureCount: number
  lastFailureTime: number | null
  successCount: number
}

interface CircuitBreakerConfig {
  failureThreshold: number
  successThreshold: number
  timeoutMs: number
  monitoringWindowMs: number
}

interface CircuitBreakerStats {
  state: 'closed' | 'open' | 'half-open'
  failureCount: number
  successCount: number
  lastFailureTime: number | null
  lastSuccessTime: number | null
  failureRate: number
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig
  private state: CircuitBreakerState
  private lastSuccessTime: number | null

  constructor(config: CircuitBreakerConfig) {
    this.config = config
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      successCount: 0,
    }
    this.lastSuccessTime = null
  }

  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T> | T
  ): Promise<T> {
    if (this.state.isOpen) {
      if (this.shouldAttemptReset()) {
        this.state.isOpen = false
        this.state.successCount = 0
      } else {
        if (fallback) {
          return fallback()
        }
        throw new Error(
          `Circuit breaker is OPEN. Last failure at ${new Date(this.state.lastFailureTime || 0).toISOString()}`
        )
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      if (fallback) {
        return fallback()
      }
      throw error
    }
  }

  private onSuccess(): void {
    this.state.successCount++
    this.lastSuccessTime = Date.now()

    if (this.state.isOpen) {
      if (this.state.successCount >= this.config.successThreshold) {
        this.state.isOpen = false
        this.state.failureCount = 0
        this.state.successCount = 0
      }
    } else {
      this.state.failureCount = 0
    }
  }

  private onFailure(): void {
    this.state.failureCount++
    this.state.lastFailureTime = Date.now()

    if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.isOpen = true
      this.state.successCount = 0
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.state.lastFailureTime) return false
    return Date.now() - this.state.lastFailureTime >= this.config.timeoutMs
  }

  getStats(): CircuitBreakerStats {
    const totalRequests = this.state.failureCount + this.state.successCount
    const failureRate =
      totalRequests > 0 ? (this.state.failureCount / totalRequests) * 100 : 0

    return {
      state: this.state.isOpen
        ? 'open'
        : this.state.lastFailureTime &&
            Date.now() - this.state.lastFailureTime >= this.config.timeoutMs
          ? 'half-open'
          : 'closed',
      failureCount: this.state.failureCount,
      successCount: this.state.successCount,
      lastFailureTime: this.state.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      failureRate,
    }
  }

  reset(): void {
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      successCount: 0,
    }
    this.lastSuccessTime = null
  }

  isOpen(): boolean {
    return this.state.isOpen
  }
}

const circuitBreakers = new Map<string, CircuitBreaker>()

export function getCircuitBreaker(
  key: string,
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  if (!circuitBreakers.has(key)) {
    const defaultConfig: CircuitBreakerConfig = {
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 60000,
      monitoringWindowMs: 300000,
    }

    circuitBreakers.set(
      key,
      new CircuitBreaker({ ...defaultConfig, ...config })
    )
  }

  return circuitBreakers.get(key)!
}

export function resetCircuitBreaker(key: string): void {
  const breaker = circuitBreakers.get(key)
  if (breaker) {
    breaker.reset()
  }
}

export function getAllCircuitBreakerStats(): Record<
  string,
  CircuitBreakerStats
> {
  const stats: Record<string, CircuitBreakerStats> = {}

  for (const [key, breaker] of circuitBreakers.entries()) {
    stats[key] = breaker.getStats()
  }

  return stats
}
