import type { H3Event } from 'h3'
import { cacheManager } from './cache'
import { getRateLimitAnalytics } from './rate-limit'

interface APIPerformanceMetrics {
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  timestamp: number
  userAgent?: string
  ip?: string
}

interface APIMetricsSummary {
  totalRequests: number
  avgResponseTime: number
  errorRate: number
  cacheHitRate: number
  rateLimitStats: {
    totalRequests: number
    totalBlocked: number
    recentRate: number
  }
}

class APIAnalytics {
  private metricsStore: APIPerformanceMetrics[] = []
  private maxMetricsStoreSize: number = 10000 // Keep last 10k metrics

  /**
   * Track API performance metrics
   */
  async trackMetrics(event: H3Event, responseTime: number): Promise<void> {
    const metrics: APIPerformanceMetrics = {
      endpoint: event.path || '',
      method: event.method || 'GET',
      responseTime,
      statusCode: event.node.res.statusCode,
      timestamp: Date.now(),
      userAgent: event.node.req.headers['user-agent'] as string | undefined,
      ip: getRequestIP(event) || undefined,
    }

    this.metricsStore.push(metrics)

    // Keep metrics store size manageable
    if (this.metricsStore.length > this.maxMetricsStoreSize) {
      this.metricsStore = this.metricsStore.slice(-this.maxMetricsStoreSize)
    }

    // Store metrics in cache for quick access
    await cacheManager.set('api_metrics', this.metricsStore, 300) // 5 minutes
  }

  /**
   * Get API performance summary for a specific time period
   */
  async getPerformanceSummary(
    hours: number = 1,
    endpoint?: string
  ): Promise<APIMetricsSummary> {
    const now = Date.now()
    const cutoffTime = now - hours * 60 * 60 * 1000

    // Get metrics from cache first, fallback to memory
    const cachedMetrics = await cacheManager.get('api_metrics')
    const metrics = cachedMetrics || this.metricsStore

    const filteredMetrics = metrics.filter(
      m => m.timestamp >= cutoffTime && (!endpoint || m.endpoint === endpoint)
    )

    if (filteredMetrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        cacheHitRate: cacheManager.getStats().hitRate,
        rateLimitStats: {
          totalRequests: 0,
          totalBlocked: 0,
          recentRate: 0,
        },
      }
    }

    const totalRequests = filteredMetrics.length
    const totalResponseTime = filteredMetrics.reduce(
      (sum, m) => sum + m.responseTime,
      0
    )
    const avgResponseTime = totalResponseTime / totalRequests
    const errorCount = filteredMetrics.filter(
      m => m.statusCode >= 400 && m.statusCode < 600
    ).length
    const errorRate = errorCount / totalRequests

    // Get rate limit analytics for a common key pattern
    const rateLimitStats = getRateLimitAnalytics('general_request')

    return {
      totalRequests,
      avgResponseTime,
      errorRate,
      cacheHitRate: cacheManager.getStats().hitRate,
      rateLimitStats,
    }
  }

  /**
   * Get top endpoints by request volume
   */
  async getTopEndpoints(
    hours: number = 1,
    limit: number = 10
  ): Promise<
    Array<{
      endpoint: string
      count: number
      avgResponseTime: number
      errorRate: number
    }>
  > {
    const now = Date.now()
    const cutoffTime = now - hours * 60 * 60 * 1000

    // Get metrics from cache first, fallback to memory
    const cachedMetrics = await cacheManager.get('api_metrics')
    const metrics = cachedMetrics || this.metricsStore

    const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime)

    const endpointStats = new Map<
      string,
      {
        count: number
        totalResponseTime: number
        errorCount: number
      }
    >()

    for (const metric of filteredMetrics) {
      const stats = endpointStats.get(metric.endpoint) || {
        count: 0,
        totalResponseTime: 0,
        errorCount: 0,
      }
      stats.count++
      stats.totalResponseTime += metric.responseTime
      if (metric.statusCode >= 400 && metric.statusCode < 600) {
        stats.errorCount++
      }
      endpointStats.set(metric.endpoint, stats)
    }

    const result = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        avgResponseTime: stats.totalResponseTime / stats.count,
        errorRate: stats.errorCount / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return result
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(
    hours: number = 24,
    intervalMinutes: number = 60
  ): Promise<
    Array<{
      timestamp: number
      avgResponseTime: number
      requestCount: number
      errorRate: number
    }>
  > {
    const now = Date.now()
    const cutoffTime = now - hours * 60 * 60 * 1000
    const intervalMs = intervalMinutes * 60 * 1000

    // Get metrics from cache first, fallback to memory
    const cachedMetrics = await cacheManager.get('api_metrics')
    const metrics = cachedMetrics || this.metricsStore

    const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime)

    // Group metrics by time intervals
    const intervals = new Map<number, APIPerformanceMetrics[]>()

    for (const metric of filteredMetrics) {
      const intervalStart =
        Math.floor(metric.timestamp / intervalMs) * intervalMs
      const intervalMetrics = intervals.get(intervalStart) || []
      intervalMetrics.push(metric)
      intervals.set(intervalStart, intervalMetrics)
    }

    const result = Array.from(intervals.entries())
      .map(([timestamp, intervalMetrics]) => {
        const totalResponseTime = intervalMetrics.reduce(
          (sum, m) => sum + m.responseTime,
          0
        )
        const avgResponseTime = totalResponseTime / intervalMetrics.length
        const errorCount = intervalMetrics.filter(
          m => m.statusCode >= 400 && m.statusCode < 600
        ).length
        const errorRate =
          intervalMetrics.length > 0 ? errorCount / intervalMetrics.length : 0

        return {
          timestamp,
          avgResponseTime,
          requestCount: intervalMetrics.length,
          errorRate,
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp)

    return result
  }

  /**
   * Get rate limit analytics
   */
  getRateLimitAnalytics(key: string) {
    return getRateLimitAnalytics(key)
  }

  /**
   * Reset metrics store (for testing purposes)
   */
  reset(): void {
    this.metricsStore = []
  }
}

import { getRequestIP } from 'h3'

// Initialize API analytics
const apiAnalytics = new APIAnalytics()

// Export the API analytics instance
export { apiAnalytics }
