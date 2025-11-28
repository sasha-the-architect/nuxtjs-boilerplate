import { ref, readonly } from 'vue'
import Fuse from 'fuse.js'
import type { Resource } from '~/types/resource'
import { sanitizeAndHighlight } from '~/utils/sanitize'

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
  const searchAnalytics = ref<
    { query: string; resultsCount: number; timestamp: Date }[]
  >([])

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

  // Advanced search with operators
  const advancedSearchResources = (query: string): Resource[] => {
    if (!query || !fuse.value) {
      const results = [...resources]
      trackSearch(query, results.length)
      return results
    }

    const parsed = parseQuery(query)

    if (parsed.terms.length === 0) {
      const results = [...resources]
      trackSearch(query, results.length)
      return results
    }

    // If we have operators, process them according to the operator sequence
    if (parsed.operators.length > 0) {
      let results: Resource[] = []

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

      trackSearch(query, results.length)
      return results
    } else {
      // If no operators, just search for each term with OR behavior
      let results: Resource[] = []

      for (const term of parsed.terms) {
        const searchResults = fuse.value.search(term)
        const termResults = searchResults.map(item => item.item)
        results = [...results, ...termResults]
      }

      // Remove duplicates
      const uniqueIds = new Set(results.map(r => r.id))
      const finalResults = Array.from(uniqueIds).map(
        id => results.find(r => r.id === id)!
      )

      trackSearch(query, finalResults.length)
      return finalResults
    }
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
          // Handle arrays like tags and technologies
          value.forEach(item => {
            counts[item] = (counts[item] || 0) + 1
          })
        } else {
          // Handle single values like category, pricing model, etc.
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

  // Manage saved searches
  const saveSearch = (name: string, query: string) => {
    const existingIndex = savedSearches.value.findIndex(s => s.query === query)

    if (existingIndex >= 0) {
      // Update existing search
      savedSearches.value[existingIndex] = {
        ...savedSearches.value[existingIndex],
        name,
        createdAt: new Date(),
      }
    } else {
      // Add new search
      savedSearches.value.unshift({
        name,
        query,
        createdAt: new Date(),
      })
    }
  }

  const removeSavedSearch = (query: string) => {
    savedSearches.value = savedSearches.value.filter(s => s.query !== query)
  }

  // Initialize search when composable is created
  initSearch()

  // Track search analytics
  const trackSearch = (query: string, resultsCount: number) => {
    searchAnalytics.value.push({
      query,
      resultsCount,
      timestamp: new Date(),
    })

    // Limit to 100 most recent searches
    if (searchAnalytics.value.length > 100) {
      searchAnalytics.value = searchAnalytics.value.slice(-100)
    }
  }

  // Get popular searches
  const getPopularSearches = (limit: number = 10): string[] => {
    const queryCounts: Record<string, number> = {}
    searchAnalytics.value.forEach(item => {
      queryCounts[item.query] = (queryCounts[item.query] || 0) + 1
    })

    return Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, limit)
      .map(entry => entry[0]) // Return just the query strings
  }

  // Get zero-result searches
  const getZeroResultSearches = (limit: number = 10): string[] => {
    return searchAnalytics.value
      .filter(item => item.resultsCount === 0)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by newest first
      .slice(0, limit)
      .map(item => item.query)
  }

  // Get related searches based on search terms
  const getRelatedSearches = (query: string, limit: number = 5): string[] => {
    if (!query.trim()) return []

    const terms = query.toLowerCase().trim().split(/\s+/)
    const relatedQueries: Record<string, number> = {}

    // Find searches that contain similar terms
    searchAnalytics.value.forEach(item => {
      const itemTerms = item.query.toLowerCase().split(/\s+/)
      const matchingTerms = itemTerms.filter(term =>
        terms.some(
          queryTerm =>
            term.includes(queryTerm) ||
            queryTerm.includes(term) ||
            // Check for similar terms using simple similarity
            (Math.abs(term.length - queryTerm.length) <= 2 &&
              getLevenshteinDistance(term, queryTerm) <= 2)
        )
      )

      if (matchingTerms.length > 0 && item.query !== query) {
        relatedQueries[item.query] =
          (relatedQueries[item.query] || 0) + matchingTerms.length
      }
    })

    return Object.entries(relatedQueries)
      .sort((a, b) => b[1] - a[1]) // Sort by relevance score
      .slice(0, limit)
      .map(entry => entry[0])
  }

  // Simple Levenshtein distance function for similarity matching
  const getLevenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + cost // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  // Get did-you-mean suggestions for potential typos
  const getDidYouMeanSuggestions = (
    query: string,
    limit: number = 3
  ): string[] => {
    if (!query.trim()) return []

    const terms = query.toLowerCase().trim().split(/\s+/)
    const allTerms = new Set<string>()

    // Collect all terms from resources to suggest corrections
    resources.forEach(resource => {
      // Add terms from title
      resource.title
        .toLowerCase()
        .split(/\s+/)
        .forEach(term => allTerms.add(term))
      // Add terms from description
      resource.description
        .toLowerCase()
        .split(/\s+/)
        .forEach(term => allTerms.add(term))
      // Add terms from benefits
      resource.benefits.forEach(benefit =>
        benefit
          .toLowerCase()
          .split(/\s+/)
          .forEach(term => allTerms.add(term))
      )
      // Add tags
      resource.tags.forEach(tag => allTerms.add(tag.toLowerCase()))
      // Add technologies
      resource.technologies.forEach(tech => allTerms.add(tech.toLowerCase()))
    })

    const suggestions: { term: string; distance: number }[] = []

    terms.forEach(queryTerm => {
      allTerms.forEach(term => {
        const distance = getLevenshteinDistance(queryTerm, term)
        if (distance <= 2 && distance > 0 && queryTerm !== term) {
          // Allow up to 2 character differences
          suggestions.push({
            term: term.replace(/\b\w/g, l => l.toUpperCase()),
            distance,
          })
        }
      })
    })

    // Sort by distance (closest matches first) and limit results
    return [
      ...new Set(
        suggestions
          .sort((a, b) => a.distance - b.distance)
          .slice(0, limit)
          .map(s => s.term)
      ),
    ]
  }

  return {
    fuse: readonly(fuse),
    searchHistory: readonly(searchHistory),
    savedSearches: readonly(savedSearches),
    searchAnalytics: readonly(searchAnalytics),
    advancedSearchResources,
    calculateFacetCounts,
    getFacetedResults,
    getAdvancedSuggestions,
    highlightSearchTerms,
    parseQuery,
    addToSearchHistory,
    saveSearch,
    removeSavedSearch,
    trackSearch,
    getPopularSearches,
    getZeroResultSearches,
    getRelatedSearches,
    getDidYouMeanSuggestions,
  }
}
