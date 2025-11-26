import { ref, computed, readonly } from 'vue'
import type { Resource } from '~/types/resource'
import { useResourceSearch } from './useResourceSearch'

// Interface for search analytics
interface SearchAnalytics {
  query: string
  timestamp: Date
  resultsCount: number
  searchTime: number
}

// Composable for advanced search functionality
export const useAdvancedSearch = (resources: readonly Resource[]) => {
  const { searchResources, highlightSearchTerms } = useResourceSearch(resources)
  const analyticsData = ref<SearchAnalytics[]>([])

  // Get faceted counts for filters based on current search query
  const getFacetedCounts = (
    query: string,
    filterType: 'category' | 'pricing' | 'difficulty' | 'technology' | 'all'
  ) => {
    const filteredResources = query ? searchWithTracking(query) : [...resources]

    if (filterType === 'all') {
      return {
        categories: getFacetedCountsForType(filteredResources, 'category'),
        pricingModels: getFacetedCountsForType(filteredResources, 'pricing'),
        difficultyLevels: getFacetedCountsForType(
          filteredResources,
          'difficulty'
        ),
        technologies: getFacetedCountsForType(filteredResources, 'technology'),
      }
    }

    return getFacetedCountsForType(filteredResources, filterType)
  }

  // Helper function to get counts for a specific filter type
  const getFacetedCountsForType = (
    resources: Resource[],
    filterType: 'category' | 'pricing' | 'difficulty' | 'technology'
  ) => {
    const counts: Record<string, number> = {}

    resources.forEach(resource => {
      let values: string[] = []

      switch (filterType) {
        case 'category':
          values = [resource.category]
          break
        case 'pricing':
          values = [resource.pricingModel]
          break
        case 'difficulty':
          values = [resource.difficulty]
          break
        case 'technology':
          values = resource.technology
          break
      }

      values.forEach(value => {
        counts[value] = (counts[value] || 0) + 1
      })
    })

    return counts
  }

  // Get all unique filter values with counts
  const getAllFilterCounts = (query: string) => {
    return {
      categories: getFacetedCounts(query, 'category'),
      pricingModels: getFacetedCounts(query, 'pricing'),
      difficultyLevels: getFacetedCounts(query, 'difficulty'),
      technologies: getFacetedCounts(query, 'technology'),
    }
  }

  // Track search analytics
  const trackSearch = (
    query: string,
    resultsCount: number,
    searchTime: number
  ) => {
    const analytics: SearchAnalytics = {
      query,
      timestamp: new Date(),
      resultsCount,
      searchTime,
    }
    analyticsData.value.push(analytics)

    // Keep only last 100 analytics entries
    if (analyticsData.value.length > 100) {
      analyticsData.value = analyticsData.value.slice(-100)
    }
  }

  // Get popular searches (queries that returned results)
  const getPopularSearches = (limit: number = 10) => {
    const queryCounts: Record<string, number> = {}

    analyticsData.value.forEach(analytics => {
      if (analytics.resultsCount > 0) {
        queryCounts[analytics.query] = (queryCounts[analytics.query] || 0) + 1
      }
    })

    return Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }))
  }

  // Get zero-result searches (queries that returned no results)
  const getZeroResultSearches = (limit: number = 10) => {
    const zeroResultQueries = analyticsData.value
      .filter(analytics => analytics.resultsCount === 0)
      .map(analytics => analytics.query)
      .filter((query, index, self) => self.indexOf(query) === index) // Remove duplicates
      .slice(0, limit)

    return zeroResultQueries
  }

  // Get search performance metrics
  const getSearchPerformance = () => {
    if (analyticsData.value.length === 0) {
      return {
        averageTime: 0,
        fastestTime: 0,
        slowestTime: 0,
        totalSearches: 0,
      }
    }

    const times = analyticsData.value.map(a => a.searchTime)
    const total = times.reduce((sum, time) => sum + time, 0)
    const averageTime = total / times.length

    return {
      averageTime,
      fastestTime: Math.min(...times),
      slowestTime: Math.max(...times),
      totalSearches: analyticsData.value.length,
    }
  }

  // Get search trends (recent popular searches)
  const getSearchTrends = (days: number = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentAnalytics = analyticsData.value.filter(
      analytics => new Date(analytics.timestamp) >= cutoffDate
    )

    const queryCounts: Record<string, number> = {}
    recentAnalytics.forEach(analytics => {
      if (analytics.resultsCount > 0) {
        queryCounts[analytics.query] = (queryCounts[analytics.query] || 0) + 1
      }
    })

    return Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([query, count]) => ({ query, count }))
  }

  // Save search to browser storage
  const saveSearch = (query: string, name: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedSearches = JSON.parse(
        window.localStorage.getItem('savedSearches') || '[]'
      )
      const newSearch = {
        id: Date.now().toString(),
        name,
        query,
        timestamp: new Date().toISOString(),
      }
      savedSearches.unshift(newSearch)

      // Keep only last 20 saved searches
      if (savedSearches.length > 20) {
        savedSearches.length = 20
      }

      window.localStorage.setItem(
        'savedSearches',
        JSON.stringify(savedSearches)
      )
    }
  }

  // Get saved searches from browser storage
  const getSavedSearches = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return JSON.parse(window.localStorage.getItem('savedSearches') || '[]')
    }
    return []
  }

  // Delete a saved search
  const deleteSavedSearch = (id: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedSearches = JSON.parse(
        window.localStorage.getItem('savedSearches') || '[]'
      )
      const updatedSearches = savedSearches.filter(
        (search: any) => search.id !== id
      )
      window.localStorage.setItem(
        'savedSearches',
        JSON.stringify(updatedSearches)
      )
    }
  }

  // Clear all saved searches
  const clearSavedSearches = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('savedSearches')
    }
  }

  // Search with performance tracking
  const searchWithTracking = (query: string): Resource[] => {
    const startTime = performance.now()
    const results = searchResources(query)
    const searchTime = performance.now() - startTime

    trackSearch(query, results.length, searchTime)

    return results
  }

  return {
    searchResources,
    highlightSearchTerms,
    getFacetedCounts,
    getAllFilterCounts,
    getPopularSearches,
    getZeroResultSearches,
    getSearchPerformance,
    getSearchTrends,
    saveSearch,
    getSavedSearches,
    deleteSavedSearch,
    clearSavedSearches,
    searchWithTracking,
    analyticsData: readonly(analyticsData),
  }
}
