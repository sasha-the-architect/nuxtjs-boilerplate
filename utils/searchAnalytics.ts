import type { Resource } from '~/types/resource'
import { logError } from './errorLogger'

// Interface for search analytics data
export interface SearchAnalytics {
  query: string
  resultsCount: number
  timestamp: Date
  duration?: number // Search duration in milliseconds
}

// Interface for performance metrics
export interface PerformanceMetrics {
  avgDuration: number
  minDuration: number
  maxDuration: number
  totalSearches: number
  timestamp: Date
}

// Interface for popular search items
export interface PopularSearch {
  query: string
  count: number
  lastUsed: Date
}

// Interface for zero-result search items
export interface ZeroResultSearch {
  query: string
  count: number
  lastUsed: Date
}

// Search analytics utility class
export class SearchAnalyticsTracker {
  private popularSearches: PopularSearch[] = []
  private zeroResultSearches: ZeroResultSearch[] = []
  private performanceHistory: {
    query: string
    duration: number
    timestamp: Date
  }[] = []

  constructor() {
    // Load from localStorage if available
    this.loadFromStorage()
  }

  // Track a search query
  trackSearch(query: string, results: Resource[], duration?: number) {
    if (!query || query.trim().length === 0) return

    const normalizedQuery = query.toLowerCase().trim()

    // Track popular searches
    const existingPopular = this.popularSearches.find(
      s => s.query === normalizedQuery
    )
    if (existingPopular) {
      existingPopular.count++
      existingPopular.lastUsed = new Date()
    } else {
      this.popularSearches.push({
        query: normalizedQuery,
        count: 1,
        lastUsed: new Date(),
      })
    }

    // Track zero-result searches
    if (results.length === 0) {
      const existingZero = this.zeroResultSearches.find(
        s => s.query === normalizedQuery
      )
      if (existingZero) {
        existingZero.count++
        existingZero.lastUsed = new Date()
      } else {
        this.zeroResultSearches.push({
          query: normalizedQuery,
          count: 1,
          lastUsed: new Date(),
        })
      }
    }

    // Track performance if duration is provided
    if (duration !== undefined) {
      this.performanceHistory.push({
        query: normalizedQuery,
        duration,
        timestamp: new Date(),
      })

      // Keep only the last 100 performance records to prevent excessive memory usage
      if (this.performanceHistory.length > 100) {
        this.performanceHistory = this.performanceHistory.slice(-100)
      }
    }

    // Limit arrays to prevent excessive memory usage
    this.popularSearches = this.popularSearches
      .sort((a, b) => b.count - a.count)
      .slice(0, 50) // Keep top 50 popular searches

    this.zeroResultSearches = this.zeroResultSearches
      .sort((a, b) => b.count - a.count)
      .slice(0, 50) // Keep top 50 zero-result searches

    // Save to storage
    this.saveToStorage()
  }

  // Get popular searches
  getPopularSearches(limit: number = 10): PopularSearch[] {
    return this.popularSearches
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // Get zero-result searches
  getZeroResultSearches(limit: number = 10): ZeroResultSearch[] {
    return this.zeroResultSearches
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // Get related searches based on common queries
  getRelatedSearches(query: string, limit: number = 5): string[] {
    const normalizedQuery = query.toLowerCase()
    const related: string[] = []

    // Find searches that contain similar terms
    for (const search of this.popularSearches) {
      if (
        search.query !== normalizedQuery &&
        (search.query.includes(normalizedQuery) ||
          normalizedQuery.includes(search.query))
      ) {
        related.push(search.query)
        if (related.length >= limit) break
      }
    }

    // If we don't have enough related searches, find searches with similar words
    if (related.length < limit) {
      const queryWords = normalizedQuery.split(/\s+/)
      for (const search of this.popularSearches) {
        if (related.includes(search.query)) continue

        const searchWords = search.query.split(/\s+/)
        const commonWords = queryWords.filter(word =>
          searchWords.some(
            searchWord => searchWord.includes(word) || word.includes(searchWord)
          )
        )

        if (commonWords.length > 0 && search.query !== normalizedQuery) {
          related.push(search.query)
          if (related.length >= limit) break
        }
      }
    }

    return related.slice(0, limit)
  }

  // Get performance metrics for a specific query
  getQueryPerformance(query: string): PerformanceMetrics | null {
    const normalizedQuery = query.toLowerCase()
    const queryPerformances = this.performanceHistory.filter(
      record => record.query === normalizedQuery
    )

    if (queryPerformances.length === 0) {
      return null
    }

    const durations = queryPerformances.map(record => record.duration)
    const total = durations.reduce((sum, duration) => sum + duration, 0)
    const avg = total / durations.length

    return {
      avgDuration: avg,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalSearches: durations.length,
      timestamp: new Date(),
    }
  }

  // Get overall performance metrics
  getOverallPerformance(): PerformanceMetrics | null {
    if (this.performanceHistory.length === 0) {
      return null
    }

    const durations = this.performanceHistory.map(record => record.duration)
    const total = durations.reduce((sum, duration) => sum + duration, 0)
    const avg = total / durations.length

    return {
      avgDuration: avg,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalSearches: durations.length,
      timestamp: new Date(),
    }
  }

  // Get slow performing queries (above a threshold, default 200ms)
  getSlowQueries(
    threshold: number = 200,
    limit: number = 10
  ): { query: string; avgDuration: number }[] {
    const queryDurations = new Map<string, number[]>()

    // Group durations by query
    for (const record of this.performanceHistory) {
      if (!queryDurations.has(record.query)) {
        queryDurations.set(record.query, [])
      }
      queryDurations.get(record.query)!.push(record.duration)
    }

    // Calculate average duration for each query
    const slowQueries: { query: string; avgDuration: number }[] = []
    for (const [query, durations] of queryDurations) {
      const avg =
        durations.reduce((sum, duration) => sum + duration, 0) /
        durations.length
      if (avg > threshold) {
        slowQueries.push({ query, avgDuration: avg })
      }
    }

    // Sort by average duration and limit
    return slowQueries
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit)
  }

  // Load data from localStorage
  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const popularData = localStorage.getItem('popularSearches')
        const zeroResultData = localStorage.getItem('zeroResultSearches')
        const performanceData = localStorage.getItem('performanceHistory')

        if (popularData) {
          this.popularSearches = JSON.parse(popularData, (key, value) => {
            if (key === 'lastUsed') return new Date(value)
            return value
          })
        }

        if (zeroResultData) {
          this.zeroResultSearches = JSON.parse(zeroResultData, (key, value) => {
            if (key === 'lastUsed') return new Date(value)
            return value
          })
        }

        if (performanceData) {
          this.performanceHistory = JSON.parse(
            performanceData,
            (key, value) => {
              if (key === 'timestamp') return new Date(value)
              return value
            }
          )
        }
      } catch (error) {
        logError(
          'Error loading search analytics from storage',
          error as Error,
          'SearchAnalytics',
          { action: 'loadFromStorage' }
        )
      }
    }
  }

  // Save data to localStorage
  private saveToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(
          'popularSearches',
          JSON.stringify(this.popularSearches)
        )
        localStorage.setItem(
          'zeroResultSearches',
          JSON.stringify(this.zeroResultSearches)
        )
        localStorage.setItem(
          'performanceHistory',
          JSON.stringify(this.performanceHistory)
        )
      } catch (error) {
        logError(
          'Error saving search analytics to storage',
          error as Error,
          'SearchAnalytics',
          { action: 'saveToStorage' }
        )
      }
    }
  }

  // Clear all analytics data
  clear() {
    this.popularSearches = []
    this.zeroResultSearches = []
    this.performanceHistory = []
    this.saveToStorage()
  }
}

// Global instance
export const searchAnalyticsTracker = new SearchAnalyticsTracker()
