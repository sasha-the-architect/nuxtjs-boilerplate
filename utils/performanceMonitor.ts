// Performance monitoring for API rate limiting and caching

interface PerformanceMetrics {
  timestamp: number
  endpoint: string
  method: string
  responseTime: number
  rateLimitHit: boolean
  cacheHit: boolean
  cacheMiss: boolean
  cacheBypass: boolean
  status: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private readonly maxMetrics: number = 1000 // Keep last 1000 metrics

  // Record API performance metric
  recordMetric(
    event: any,
    responseTime: number,
    rateLimitHit: boolean,
    cacheStatus: 'HIT' | 'MISS' | 'BYPASS' = 'BYPASS',
    status: number = 200
  ): void {
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      endpoint: event.path || 'unknown',
      method: event.method || 'GET',
      responseTime,
      rateLimitHit,
      cacheHit: cacheStatus === 'HIT',
      cacheMiss: cacheStatus === 'MISS',
      cacheBypass: cacheStatus === 'BYPASS',
      status,
    }

    this.metrics.push(metric)

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  // Get performance statistics
  getStats(): {
    totalRequests: number
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    rateLimitHitCount: number
    cacheHitRate: number
    statusCodes: { [code: number]: number }
    endpoints: { [endpoint: string]: number }
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        rateLimitHitCount: 0,
        cacheHitRate: 0,
        statusCodes: {},
        endpoints: {},
      }
    }

    // Calculate basic stats
    const responseTimes = this.metrics.map(m => m.responseTime)
    const totalRequests = this.metrics.length
    const avgResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / totalRequests

    // Calculate percentiles
    const sortedTimes = [...responseTimes].sort((a, b) => a - b)
    const p95Index = Math.floor(sortedTimes.length * 0.95)
    const p99Index = Math.floor(sortedTimes.length * 0.99)
    const p95ResponseTime = sortedTimes[p95Index] || 0
    const p99ResponseTime = sortedTimes[p99Index] || 0

    // Count rate limit hits
    const rateLimitHitCount = this.metrics.filter(m => m.rateLimitHit).length

    // Calculate cache hit rate
    const cacheHitCount = this.metrics.filter(m => m.cacheHit).length
    const cacheHitRate =
      totalRequests > 0 ? (cacheHitCount / totalRequests) * 100 : 0

    // Count status codes
    const statusCodes: { [code: number]: number } = {}
    this.metrics.forEach(m => {
      statusCodes[m.status] = (statusCodes[m.status] || 0) + 1
    })

    // Count endpoints
    const endpoints: { [endpoint: string]: number } = {}
    this.metrics.forEach(m => {
      endpoints[m.endpoint] = (endpoints[m.endpoint] || 0) + 1
    })

    return {
      totalRequests,
      avgResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      rateLimitHitCount,
      cacheHitRate,
      statusCodes,
      endpoints,
    }
  }

  // Get metrics for a specific time range (in minutes)
  getMetricsByTimeRange(minutes: number): PerformanceMetrics[] {
    const cutoffTime = Date.now() - minutes * 60 * 1000
    return this.metrics.filter(m => m.timestamp >= cutoffTime)
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = []
  }

  // Get cache performance stats
  getCacheStats(): {
    totalRequests: number
    cacheHits: number
    cacheMisses: number
    cacheHitRate: number
    avgCacheResponseTime: number
    avgNonCacheResponseTime: number
  } {
    const cacheMetrics = this.metrics.filter(m => !m.cacheBypass)
    const totalCacheRequests = cacheMetrics.length
    const cacheHits = cacheMetrics.filter(m => m.cacheHit).length
    const cacheMisses = cacheMetrics.filter(m => m.cacheMiss).length

    const avgCacheResponseTime =
      cacheHits > 0
        ? cacheMetrics
            .filter(m => m.cacheHit)
            .reduce((sum, m) => sum + m.responseTime, 0) / cacheHits
        : 0

    const avgNonCacheResponseTime =
      cacheMisses > 0
        ? cacheMetrics
            .filter(m => m.cacheMiss)
            .reduce((sum, m) => sum + m.responseTime, 0) / cacheMisses
        : 0

    return {
      totalRequests: totalCacheRequests,
      cacheHits,
      cacheMisses,
      cacheHitRate:
        totalCacheRequests > 0 ? (cacheHits / totalCacheRequests) * 100 : 0,
      avgCacheResponseTime,
      avgNonCacheResponseTime,
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Middleware function to measure response time
export function measureResponseTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; responseTime: number }> {
  const startTime = Date.now()
  return fn().then(result => {
    const responseTime = Date.now() - startTime
    return { result, responseTime }
  })
}
