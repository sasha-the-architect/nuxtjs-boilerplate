import { ref, readonly } from 'vue'
import Fuse from 'fuse.js'
import type { Resource } from '~/types/resource'
import { sanitizeAndHighlight } from '~/utils/sanitize'
import { searchAnalyticsTracker } from '~/utils/searchAnalytics'

// Define search operator types
type SearchOperator = 'AND' | 'OR' | 'NOT'
type FacetCounts = Record<string, number>

// Define search query structure
interface ParsedQuery {
  terms: string[]
  operators: SearchOperator[]
  filters: Record<string, string[]>
}

// Composable for managing advanced resource search functionality
export const useAdvancedResourceSearch = (resources: readonly Resource[]) => {
  const fuse = ref<Fuse<Resource> | null>(null)
  const searchHistory = ref<string[]>([])
  const savedSearches = ref<{ name: string; query: string; createdAt: Date }[]>(
    []
  )

  // Initialize Fuse.js for fuzzy search with enhanced configuration
  const initSearch = () => {
    fuse.value = new Fuse([...resources], {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'benefits', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      useExtendedSearch: true, // Enable extended search syntax
    })
  }

  // Parse search query with operators
  const parseQuery = (query: string): ParsedQuery => {
    if (!query) {
      return { terms: [], operators: [], filters: {} }
    }

    // Check if query contains operators
    const hasOperators = /(\bAND\b|\bOR\b|\bNOT\b)/i.test(query)

    if (hasOperators) {
      // Handle advanced operators like AND, OR, NOT
      const terms: string[] = []
      const operators: SearchOperator[] = []

      // Split query by operators while preserving them
      const parts = query
        .split(/(AND|OR|NOT)/gi)
        .map(part => part.trim())
        .filter(Boolean)

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]

        if (part.toUpperCase() === 'AND') {
          operators.push('AND')
        } else if (part.toUpperCase() === 'OR') {
          operators.push('OR')
        } else if (part.toUpperCase() === 'NOT') {
          operators.push('NOT')
        } else if (part) {
          // Process the term (handle quoted phrases)
          const cleanTerm = part.replace(/"/g, '')
          if (cleanTerm) {
            terms.push(cleanTerm)
          }
        }
      }

      return { terms, operators, filters: {} }
    } else {
      // For simple queries without operators, split by spaces
      const simpleTerms = query
        .trim()
        .split(/\s+/)
        .filter(term => term.length > 0)
      return { terms: simpleTerms, operators: [], filters: {} }
    }
  }

  // Advanced search with operators and performance tracking
  const advancedSearchResources = (query: string): Resource[] => {
    const startTime = performance.now()

    if (!query || !fuse.value) {
      // Track empty query
      searchAnalyticsTracker.trackSearch(query, [...resources], 0)
      return [...resources]
    }

    const parsed = parseQuery(query)

    if (parsed.terms.length === 0) {
      searchAnalyticsTracker.trackSearch(query, [...resources], 0)
      return [...resources]
    }

    let results: Resource[] = []

    // If we have operators, process them according to the operator sequence
    if (parsed.operators.length > 0) {
      // Start with the first term results
      const firstTermResults = fuse.value.search(parsed.terms[0])
      results = firstTermResults.map(item => item.item)

      // Process each subsequent term with its operator
      for (let i = 1; i < parsed.terms.length; i++) {
        const term = parsed.terms[i]
        const operator = parsed.operators[i - 1] // operator before this term

        const termResults = fuse.value.search(term)
        const termResources = termResults.map(item => item.item)

        if (operator === 'AND') {
          // For AND, we want resources that match both the current results AND the new term
          results = results.filter(resource =>
            termResources.some(result => result.id === resource.id)
          )
        } else if (operator === 'OR') {
          // For OR, we want resources that match either the current results OR the new term
          const allResults = [...results, ...termResources]
          // Use a Set to remove duplicates based on ID
          const uniqueResults = new Set(allResults.map(r => r.id))
          results = Array.from(uniqueResults).map(
            id => [...results, ...termResources].find(r => r.id === id)!
          )
        } else if (operator === 'NOT') {
          // For NOT, we want resources that match current results but NOT the new term
          results = results.filter(
            resource => !termResources.some(result => result.id === resource.id)
          )
        }
      }
    } else {
      // If no operators, just search for each term with OR behavior
      for (const term of parsed.terms) {
        const searchResults = fuse.value.search(term)
        const termResults = searchResults.map(item => item.item)
        results = [...results, ...termResults]
      }

      // Remove duplicates
      const uniqueIds = new Set(results.map(r => r.id))
      results = Array.from(uniqueIds).map(id => results.find(r => r.id === id)!)
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    // Track the search with analytics
    searchAnalyticsTracker.trackSearch(query, results, duration)

    return results
  }

  // Calculate facet counts for filters
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

  // Get faceted search results
  const getFacetedResults = (
    query: string,
    filters: Record<string, string[]>
  ) => {
    let results = query ? advancedSearchResources(query) : [...resources]

    // Apply filters
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        results = results.filter(resource => {
          const resourceValue = (resource as any)[key]

          if (Array.isArray(resourceValue)) {
            // If the resource property is an array (like tags), check if any match
            return resourceValue.some((item: string) => values.includes(item))
          } else if (typeof resourceValue === 'string') {
            // If it's a string, check direct inclusion
            return values.includes(resourceValue)
          } else {
            return false
          }
        })
      }
    })

    return results
  }

  // Search suggestions functionality
  const getAdvancedSuggestions = (
    query: string,
    limit: number = 5
  ): Resource[] => {
    if (!query || !fuse.value) return []

    const searchResults = fuse.value.search(query, { limit })
    return searchResults.map(item => item.item)
  }

  // Function to highlight search terms in text
  const highlightSearchTerms = (text: string, searchQuery: string): string => {
    if (!searchQuery || !text) return text || ''

    // Use the centralized sanitization utility
    return sanitizeAndHighlight(text, searchQuery)
  }

  // Function to create a search result snippet with highlighted terms
  const createSearchSnippet = (
    text: string,
    searchQuery: string,
    maxLength: number = 160
  ): string => {
    if (!searchQuery || !text) return text?.substring(0, maxLength) || ''

    // Find the position of the search query in the text (case insensitive)
    const lowerText = text.toLowerCase()
    const lowerQuery = searchQuery.toLowerCase()

    // Find all occurrences of the search terms
    const queryTerms = lowerQuery.split(/\s+/).filter(term => term.length > 0)
    let bestStart = -1
    let bestEnd = -1
    let bestScore = -1

    // Look for the best position to create the snippet
    for (const term of queryTerms) {
      let pos = 0
      while ((pos = lowerText.indexOf(term, pos)) !== -1) {
        // Calculate a window around this match
        let start = Math.max(0, pos - Math.floor(maxLength / 4))
        let end = Math.min(
          text.length,
          pos + term.length + Math.floor(maxLength / 4)
        )

        // Expand the window to include full words
        while (
          start > 0 &&
          text[start] !== ' ' &&
          text[start] !== '.' &&
          text[start] !== ','
        ) {
          start--
        }
        start = Math.max(0, start)

        while (
          end < text.length &&
          text[end] !== ' ' &&
          text[end] !== '.' &&
          text[end] !== ','
        ) {
          end++
        }
        end = Math.min(text.length, end)

        // Score this window based on how many query terms it contains
        const windowText = text.substring(start, end).toLowerCase()
        let score = 0
        for (const queryTerm of queryTerms) {
          if (windowText.includes(queryTerm)) {
            score++
          }
        }

        // Prefer windows that are not too far from the current best
        if (
          score > bestScore ||
          (score === bestScore &&
            Math.abs(start - (bestStart === -1 ? 0 : bestStart)) <
              maxLength / 2)
        ) {
          bestScore = score
          bestStart = start
          bestEnd = end
        }

        pos++
      }
    }

    // If we found a good position, create the snippet
    if (bestStart !== -1 && bestEnd !== -1) {
      let snippet = text.substring(bestStart, bestEnd).trim()

      // Add ellipses if the snippet was truncated
      if (bestStart > 0) {
        snippet = '...' + snippet
      }
      if (bestEnd < text.length) {
        snippet = snippet + '...'
      }

      // Now highlight the search terms in the snippet
      let highlighted = snippet
      for (const term of queryTerms) {
        const regex = new RegExp(`(${term})`, 'gi')
        highlighted = highlighted.replace(
          regex,
          '<mark class="bg-yellow-200">$1</mark>'
        )
      }

      // Sanitize the result to prevent XSS
      return sanitizeAndHighlight(highlighted, searchQuery)
    } else {
      // If we couldn't find a good match, just return the beginning of the text with highlights
      const plainText = text.substring(0, maxLength)
      let highlighted = plainText
      for (const term of queryTerms) {
        const regex = new RegExp(`(${term})`, 'gi')
        highlighted = highlighted.replace(
          regex,
          '<mark class="bg-yellow-200">$1</mark>'
        )
      }

      // Sanitize the result to prevent XSS
      return sanitizeAndHighlight(highlighted, searchQuery)
    }
  }

  // Manage search history
  const addToSearchHistory = (query: string) => {
    if (query && !searchHistory.value.includes(query)) {
      searchHistory.value.unshift(query)
      // Limit to 10 most recent searches
      if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10)
      }
    }
  }

  // Manage saved searches with notifications
  const saveSearch = (name: string, query: string) => {
    const existingIndex = savedSearches.value.findIndex(s => s.query === query)

    if (existingIndex >= 0) {
      // Update existing search
      savedSearches.value[existingIndex] = {
        ...savedSearches.value[existingIndex],
        name,
        createdAt: new Date(),
      }
      // Emit notification for update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('saved-search-updated', { detail: { query, name } })
        )
      }
    } else {
      // Add new search
      savedSearches.value.unshift({
        name,
        query,
        createdAt: new Date(),
      })
      // Emit notification for new save
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('saved-search-added', { detail: { query, name } })
        )
      }
    }
  }

  const removeSavedSearch = (query: string) => {
    const removedSearch = savedSearches.value.find(s => s.query === query)
    savedSearches.value = savedSearches.value.filter(s => s.query !== query)

    // Emit notification for removal
    if (removedSearch && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saved-search-removed', {
          detail: { query, name: removedSearch.name },
        })
      )
    }
  }

  // Get popular searches
  const getPopularSearches = (limit: number = 10) => {
    return searchAnalyticsTracker.getPopularSearches(limit)
  }

  // Get zero-result searches
  const getZeroResultSearches = (limit: number = 10) => {
    return searchAnalyticsTracker.getZeroResultSearches(limit)
  }

  // Get related searches
  const getRelatedSearches = (query: string, limit: number = 5) => {
    return searchAnalyticsTracker.getRelatedSearches(query, limit)
  }

  // Initialize search when composable is created
  initSearch()

  return {
    fuse: readonly(fuse),
    searchHistory: readonly(searchHistory),
    savedSearches: readonly(savedSearches),
    advancedSearchResources,
    calculateFacetCounts,
    getFacetedResults,
    getAdvancedSuggestions,
    highlightSearchTerms,
    createSearchSnippet,
    parseQuery,
    addToSearchHistory,
    saveSearch,
    removeSavedSearch,
    getPopularSearches,
    getZeroResultSearches,
    getRelatedSearches,
  }
}
