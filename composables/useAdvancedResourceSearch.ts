import { readonly } from 'vue'
import type { Resource } from '~/types/resource'
import { searchAnalyticsTracker } from '~/utils/searchAnalytics'
import { useSearchHistory } from '~/composables/useSearchHistory'
import { useSavedSearches } from '~/composables/useSavedSearches'
import { createFuseInstance } from '~/utils/fuseHelper'
import { parseQuery } from '~/utils/queryParser'
import {
  highlightSearchTerms,
  createSearchSnippet,
} from '~/utils/searchHighlighting'

type FacetCounts = Record<string, number>

export const useAdvancedResourceSearch = (resources: readonly Resource[]) => {
  const { addSearchToHistory } = useSearchHistory()
  const { savedSearches, saveSearch, removeSavedSearch } = useSavedSearches()
  const fuse = createFuseInstance(resources)

  const advancedSearchResources = (query: string): Resource[] => {
    const startTime = performance.now()

    if (!query || !fuse) {
      searchAnalyticsTracker.trackSearch(query, [...resources], 0)
      return [...resources]
    }

    const parsed = parseQuery(query)

    if (parsed.terms.length === 0) {
      searchAnalyticsTracker.trackSearch(query, [...resources], 0)
      return [...resources]
    }

    let results: Resource[] = []

    if (parsed.operators.length > 0) {
      const firstTermResults = fuse.search(parsed.terms[0])
      results = firstTermResults.map(item => item.item)

      for (let i = 1; i < parsed.terms.length; i++) {
        const term = parsed.terms[i]
        const operator = parsed.operators[i - 1]

        const termResults = fuse.search(term)
        const termResources = termResults.map(item => item.item)

        if (operator === 'AND') {
          results = results.filter(resource =>
            termResources.some(result => result.id === resource.id)
          )
        } else if (operator === 'OR') {
          const allResults = [...results, ...termResources]
          const resultMap = new Map(allResults.map(r => [r.id, r]))
          results = Array.from(resultMap.values())
        } else if (operator === 'NOT') {
          results = results.filter(
            resource => !termResources.some(result => result.id === resource.id)
          )
        }
      }
    } else {
      for (const term of parsed.terms) {
        const searchResults = fuse.search(term)
        const termResults = searchResults.map(item => item.item)
        results = [...results, ...termResults]
      }

      const resultMap = new Map(results.map(r => [r.id, r]))
      results = Array.from(resultMap.values())
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    searchAnalyticsTracker.trackSearch(query, results, duration)

    return results
  }

  const calculateFacetCounts = (
    query: string,
    filterKey: string
  ): FacetCounts => {
    const allResources = query ? advancedSearchResources(query) : [...resources]
    const counts: FacetCounts = {}

    allResources.forEach(resource => {
      const value = (resource as any)[filterKey]
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            counts[item] = (counts[item] || 0) + 1
          })
        } else {
          counts[value] = (counts[value] || 0) + 1
        }
      }
    })

    return counts
  }

  const getFacetedResults = (
    query: string,
    filters: Record<string, string[]>
  ) => {
    let results = query ? advancedSearchResources(query) : [...resources]

    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        results = results.filter(resource => {
          const resourceValue = (resource as any)[key]

          if (Array.isArray(resourceValue)) {
            return resourceValue.some((item: string) => values.includes(item))
          } else if (typeof resourceValue === 'string') {
            return values.includes(resourceValue)
          } else {
            return false
          }
        })
      }
    })

    return results
  }

  const getAdvancedSuggestions = (
    query: string,
    limit: number = 5
  ): Resource[] => {
    if (!query || !fuse) return []

    const searchResults = fuse.search(query, { limit })
    return searchResults.map(item => item.item)
  }

  const addToSearchHistory = addSearchToHistory

  const getPopularSearches = (limit: number = 10) => {
    return searchAnalyticsTracker.getPopularSearches(limit)
  }

  const getZeroResultSearches = (limit: number = 10) => {
    return searchAnalyticsTracker.getZeroResultSearches(limit)
  }

  const getRelatedSearches = (query: string, limit: number = 5) => {
    return searchAnalyticsTracker.getRelatedSearches(query, limit)
  }

  return {
    fuse: readonly(fuse),
    savedSearches,
    advancedSearchResources,
    calculateFacetCounts,
    getFacetedResults,
    getAdvancedSuggestions,
    highlightSearchTerms,
    createSearchSnippet,
    addToSearchHistory,
    saveSearch,
    removeSavedSearch,
    getPopularSearches,
    getZeroResultSearches,
    getRelatedSearches,
  }
}
