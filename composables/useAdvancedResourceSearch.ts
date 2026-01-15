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
        const termResources = searchResults.map(item => item.item)
        results = [...results, ...termResources]
      }

      const resultMap = new Map(results.map(r => [r.id, r]))
      results = Array.from(resultMap.values())
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    // Track the original query, not individual terms
    searchAnalyticsTracker.trackSearch(query, results, duration)

    return results
  }

  const calculateFacetCounts = (
    query: string,
    filterKey: keyof Resource
  ): FacetCounts => {
    const allResources = query ? advancedSearchResources(query) : [...resources]
    const counts: FacetCounts = {}

    allResources.forEach(resource => {
      const value = resource[filterKey] as unknown
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((item: string) => {
            counts[item] = (counts[item] || 0) + 1
          })
        } else if (typeof value === 'string') {
          counts[value] = (counts[value] || 0) + 1
        }
      }
    })

    return counts
  }

  const calculateAllFacetCounts = (
    query: string
  ): {
    category: FacetCounts
    pricingModel: FacetCounts
    difficulty: FacetCounts
    technology: FacetCounts
    tags: FacetCounts
    benefits: FacetCounts
  } => {
    const allResources = query ? advancedSearchResources(query) : [...resources]

    const categoryCounts: FacetCounts = {}
    const pricingCounts: FacetCounts = {}
    const difficultyCounts: FacetCounts = {}
    const technologyCounts: FacetCounts = {}
    const tagCounts: FacetCounts = {}
    const benefitCounts: FacetCounts = {}

    allResources.forEach(resource => {
      if (resource.category) {
        categoryCounts[resource.category] =
          (categoryCounts[resource.category] || 0) + 1
      }

      if (resource.pricingModel) {
        pricingCounts[resource.pricingModel] =
          (pricingCounts[resource.pricingModel] || 0) + 1
      }

      if (resource.difficulty) {
        difficultyCounts[resource.difficulty] =
          (difficultyCounts[resource.difficulty] || 0) + 1
      }

      if (Array.isArray(resource.technology)) {
        resource.technology.forEach((tech: string) => {
          technologyCounts[tech] = (technologyCounts[tech] || 0) + 1
        })
      }

      if (Array.isArray(resource.tags)) {
        resource.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }

      if (Array.isArray(resource.benefits)) {
        resource.benefits.forEach((benefit: string) => {
          benefitCounts[benefit] = (benefitCounts[benefit] || 0) + 1
        })
      }
    })

    return {
      category: categoryCounts,
      pricingModel: pricingCounts,
      difficulty: difficultyCounts,
      technology: technologyCounts,
      tags: tagCounts,
      benefits: benefitCounts,
    }
  }

  const getFacetedResults = (
    query: string,
    filters: Record<string, string[]>
  ) => {
    let results = query ? advancedSearchResources(query) : [...resources]

    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        results = results.filter(resource => {
          const resourceValue = resource[key as keyof Resource] as unknown

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
    calculateAllFacetCounts,
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
