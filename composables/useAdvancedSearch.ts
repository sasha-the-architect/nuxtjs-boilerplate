import { ref, computed, readonly } from 'vue'
import { useResourceData } from './useResourceData'
import type { Resource } from '~/types/resource'

// Interface for search analytics
interface SearchAnalytics {
  query: string
  timestamp: Date
  resultCount: number
  isZeroResult: boolean
}

// Interface for saved searches
interface SavedSearch {
  id: string
  name: string
  query: string
  filters: any
  createdAt: Date
}

// Composable for advanced search and filtering functionality
export const useAdvancedSearch = () => {
  const { resources } = useResourceData()

  // Search analytics tracking
  const searchAnalytics = ref<SearchAnalytics[]>([])
  const savedSearches = ref<SavedSearch[]>([])

  // Load saved searches from localStorage
  const loadSavedSearches = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedSearches')
      if (saved) {
        try {
          savedSearches.value = JSON.parse(saved).map((search: any) => ({
            ...search,
            createdAt: new Date(search.createdAt),
          }))
        } catch (e) {
          console.error('Error loading saved searches', e)
        }
      }
    }
  }

  // Save searches to localStorage
  const saveSearch = (name: string, query: string, filters: any) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      filters,
      createdAt: new Date(),
    }
    savedSearches.value.unshift(newSearch)

    if (typeof window !== 'undefined') {
      localStorage.setItem('savedSearches', JSON.stringify(savedSearches.value))
    }
  }

  // Delete a saved search
  const deleteSavedSearch = (id: string) => {
    savedSearches.value = savedSearches.value.filter(search => search.id !== id)
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedSearches', JSON.stringify(savedSearches.value))
    }
  }

  // Track search analytics
  const trackSearch = (query: string, resultCount: number) => {
    const analytics: SearchAnalytics = {
      query,
      timestamp: new Date(),
      resultCount,
      isZeroResult: resultCount === 0,
    }
    searchAnalytics.value.push(analytics)

    // Keep only the last 1000 analytics entries
    if (searchAnalytics.value.length > 1000) {
      searchAnalytics.value = searchAnalytics.value.slice(-1000)
    }
  }

  // Get popular search queries
  const getPopularSearches = (limit: number = 10) => {
    const queryCount: Record<string, number> = {}
    searchAnalytics.value.forEach((analytics: SearchAnalytics) => {
      const query = analytics.query.toLowerCase().trim()
      if (query) {
        queryCount[query] = (queryCount[query] || 0) + 1
      }
    })

    return Object.entries(queryCount)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }))
  }

  // Get zero-result queries
  const getZeroResultQueries = (limit: number = 10) => {
    return searchAnalytics.value
      .filter((analytics: SearchAnalytics) => analytics.isZeroResult)
      .map((analytics: SearchAnalytics) => analytics.query)
      .filter(
        (query: string, index: number, self: string[]) =>
          self.indexOf(query) === index
      ) // Unique queries
      .slice(0, limit)
  }

  // Calculate faceted counts for a given filter
  const getFacetedCounts = (
    filterType:
      | 'categories'
      | 'pricingModels'
      | 'difficultyLevels'
      | 'technologies',
    searchQuery: string = ''
  ) => {
    let filteredResources = [...resources.value]

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim()) {
      const searchWords = searchQuery.toLowerCase().split(/\s+/)
      filteredResources = filteredResources.filter((resource: Resource) => {
        const resourceText =
          `${resource.title} ${resource.description} ${resource.benefits.join(' ')} ${resource.tags.join(' ')}`.toLowerCase()
        return searchWords.some((word: string) => resourceText.includes(word))
      })
    }

    const counts: Record<string, number> = {}

    switch (filterType) {
      case 'categories':
        filteredResources.forEach((resource: Resource) => {
          counts[resource.category] = (counts[resource.category] || 0) + 1
        })
        break
      case 'pricingModels':
        filteredResources.forEach((resource: Resource) => {
          counts[resource.pricingModel] =
            (counts[resource.pricingModel] || 0) + 1
        })
        break
      case 'difficultyLevels':
        filteredResources.forEach((resource: Resource) => {
          counts[resource.difficulty] = (counts[resource.difficulty] || 0) + 1
        })
        break
      case 'technologies':
        filteredResources.forEach((resource: Resource) => {
          resource.technology.forEach((tech: string) => {
            counts[tech] = (counts[tech] || 0) + 1
          })
        })
        break
    }

    return counts
  }

  // Calculate resource popularity ranges
  const getResourcePopularityRanges = () => {
    if (resources.value.length === 0) return {}

    const popularities = resources.value.map((r: Resource) => r.popularity)
    const min = Math.min(...popularities)
    const max = Math.max(...popularities)
    const avg =
      popularities.reduce((a: number, b: number) => a + b, 0) /
      popularities.length

    return {
      min,
      max,
      avg,
      ranges: {
        low: [min, avg * 0.5],
        medium: [avg * 0.5, avg],
        high: [avg, max],
      },
    }
  }

  // Filter resources by popularity range
  const filterByPopularityRange = (
    resourcesToFilter: Resource[],
    min: number,
    max: number
  ) => {
    return resourcesToFilter.filter(
      (resource: Resource) =>
        resource.popularity >= min && resource.popularity <= max
    )
  }

  // Filter resources by date added range
  const filterByDateRange = (resourcesToFilter: Resource[], days: number) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return resourcesToFilter.filter((resource: Resource) => {
      const resourceDate = new Date(resource.dateAdded)
      return resourceDate >= cutoffDate
    })
  }

  // Filter resources by benefit
  const filterByBenefits = (
    resourcesToFilter: Resource[],
    benefits: string[]
  ) => {
    return resourcesToFilter.filter((resource: Resource) =>
      benefits.some((benefit: string) =>
        resource.benefits.some((b: string) =>
          b.toLowerCase().includes(benefit.toLowerCase())
        )
      )
    )
  }

  // Filter resources by open source status
  const filterByOpenSource = (
    resourcesToFilter: Resource[],
    isOpenSource: boolean
  ) => {
    return resourcesToFilter.filter((resource: Resource) => {
      const description = resource.description.toLowerCase()
      const title = resource.title.toLowerCase()
      const tags = resource.tags.map((t: string) => t.toLowerCase())

      if (isOpenSource) {
        return (
          description.includes('open source') ||
          title.includes('open source') ||
          tags.some(
            (t: string) =>
              t.includes('open-source') || t.includes('open_source')
          )
        )
      } else {
        return !(
          description.includes('open source') ||
          title.includes('open source') ||
          tags.some(
            (t: string) =>
              t.includes('open-source') || t.includes('open_source')
          )
        )
      }
    })
  }

  // Initialize saved searches on creation
  loadSavedSearches()

  return {
    // Search analytics
    searchAnalytics: readonly(searchAnalytics),
    trackSearch,
    getPopularSearches,
    getZeroResultQueries,

    // Saved searches
    savedSearches: readonly(savedSearches),
    saveSearch,
    deleteSavedSearch,

    // Faceted search
    getFacetedCounts,

    // Advanced filtering
    getResourcePopularityRanges,
    filterByPopularityRange,
    filterByDateRange,
    filterByBenefits,
    filterByOpenSource,
  }
}
