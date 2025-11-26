import { ref, readonly } from 'vue'
import Fuse from 'fuse.js'
import { sanitizeAndHighlight } from '~/utils/sanitize'
import type { Resource } from '~/types/resource'

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

  // Advanced search with operators
  const advancedSearchResources = (query: string): Resource[] => {
    if (!query || !fuse.value) return [...resources]

    const parsed = parseQuery(query)

    if (parsed.terms.length === 0) {
      return [...resources]
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
      return Array.from(uniqueIds).map(id => results.find(r => r.id === id)!)
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

  return {
    fuse: readonly(fuse),
    searchHistory: readonly(searchHistory),
    savedSearches: readonly(savedSearches),
    advancedSearchResources,
    calculateFacetCounts,
    getFacetedResults,
    getAdvancedSuggestions,
    highlightSearchTerms,
    parseQuery,
    addToSearchHistory,
    saveSearch,
    removeSavedSearch,
  }
}
