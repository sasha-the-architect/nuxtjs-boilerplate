import { ref, readonly } from 'vue'
import Fuse from 'fuse.js'
import DOMPurify from 'dompurify'
import type { Resource } from '~/types/resource'

// Composable for managing resource search functionality
export const useResourceSearch = (resources: readonly Resource[]) => {
  const fuse = ref<Fuse<Resource> | null>(null)

  // Initialize Fuse.js for fuzzy search
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
    })
  }

  // Parse advanced search query with operators (AND, OR, NOT)
  const parseAdvancedQuery = (
    query: string
  ): { terms: string[]; operator: 'AND' | 'OR' } => {
    // Normalize the query by trimming and replacing multiple spaces with single space
    const normalizedQuery = query.trim().replace(/\s+/g, ' ')

    // Check if query contains AND/OR operators
    if (normalizedQuery.indexOf(' AND ') !== -1) {
      return {
        terms: normalizedQuery
          .split(' AND ')
          .map(term => term.trim())
          .filter(term => term.length > 0),
        operator: 'AND',
      }
    } else if (normalizedQuery.indexOf(' OR ') !== -1) {
      return {
        terms: normalizedQuery
          .split(' OR ')
          .map(term => term.trim())
          .filter(term => term.length > 0),
        operator: 'OR',
      }
    } else {
      // Handle simple query or NOT operator
      return {
        terms: [normalizedQuery],
        operator: 'OR', // Default to OR for simple queries
      }
    }
  }

  // Search resources with advanced operators support
  const searchResources = (query: string): Resource[] => {
    if (!query || !fuse.value) return [...resources]

    // Check if this is an advanced query with operators
    const parsedQuery = parseAdvancedQuery(query)

    if (parsedQuery.terms.length > 1 || query.indexOf(' NOT ') !== -1) {
      // Handle advanced search with operators
      return performAdvancedSearch(query, parsedQuery)
    } else {
      // Use regular Fuse search for simple queries
      const searchResults = fuse.value.search(query)
      return searchResults.map(item => item.item)
    }
  }

  // Perform advanced search with logical operators
  const performAdvancedSearch = (
    originalQuery: string,
    parsedQuery: { terms: string[]; operator: 'AND' | 'OR' }
  ): Resource[] => {
    // Handle NOT operator by splitting the query
    if (originalQuery.indexOf(' NOT ') !== -1) {
      const parts = originalQuery.split(' NOT ')
      const includeQuery = parts[0].trim()
      const excludeQuery = parts[1].trim()

      // Search for resources that match the include query
      const includeResults =
        fuse.value?.search(includeQuery).map(item => item.item) || []

      // Search for resources that match the exclude query
      const excludeResults =
        fuse.value?.search(excludeQuery).map(item => item.item) || []

      // Return resources that are in includeResults but not in excludeResults
      return includeResults.filter(
        resource =>
          !excludeResults.some(
            excludeResource => excludeResource.id === resource.id
          )
      )
    }

    // Handle AND/OR operations
    const allResults = parsedQuery.terms.map(term => {
      return fuse.value?.search(term).map(item => item.item) || []
    })

    if (parsedQuery.operator === 'AND') {
      // For AND operation, find resources that appear in all term results
      if (allResults.length === 0) return []

      // Start with the first result set and keep only items that exist in all other sets
      return allResults[0].filter(resource =>
        allResults.every(termResults =>
          termResults.some(result => result.id === resource.id)
        )
      )
    } else {
      // OR operation
      // For OR operation, combine all results and remove duplicates
      const seenIds: { [key: string]: boolean } = {}
      const combinedResults: Resource[] = []

      allResults.forEach(termResults => {
        termResults.forEach(resource => {
          if (!seenIds[resource.id]) {
            seenIds[resource.id] = true
            combinedResults.push(resource)
          }
        })
      })

      return combinedResults
    }
  }

  // Search suggestions functionality
  const getSuggestions = (query: string, limit: number = 5): Resource[] => {
    if (!query || !fuse.value) return []

    const searchResults = fuse.value.search(query, { limit })
    return searchResults.map(item => item.item)
  }

  // Function to highlight search terms in text
  const highlightSearchTerms = (text: string, searchQuery: string): string => {
    if (!searchQuery || !text) return text || ''

    // First sanitize the input text to prevent XSS - only allow text content
    const sanitizedText = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [], // No HTML tags allowed, just plain text
      ALLOWED_ATTR: [],
      FORBID_TAGS: [
        'script',
        'iframe',
        'object',
        'embed',
        'form',
        'input',
        'button',
        'img',
      ],
      FORBID_ATTR: [
        'src',
        'href',
        'style',
        'onload',
        'onerror',
        'onclick',
        'onmouseover',
        'onmouseout',
        'data',
        'formaction',
      ],
    })

    let highlighted = sanitizedText

    // Parse the search query to handle advanced operators
    const parsedQuery = parseAdvancedQuery(searchQuery)

    // If it's a simple query (no operators), use the original logic
    if (parsedQuery.terms.length === 1 && !searchQuery.includes(' NOT ')) {
      // Escape special regex characters in search query
      const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escapedQuery})`, 'gi')

      highlighted = sanitizedText.replace(
        regex,
        '<mark class="bg-yellow-200 text-gray-900">$1</mark>'
      )
    } else {
      // For advanced queries, highlight each term separately
      // Remove NOT operator from terms but process them as separate highlights
      const terms = searchQuery
        .replace(/ NOT /g, ' ')
        .split(/ AND | OR /)
        .map(term => term.trim())
        .filter(term => term.length > 0)

      for (const term of terms) {
        if (term.length > 0) {
          // For quoted terms, remove the quotes for highlighting
          const cleanTerm =
            term.startsWith('"') && term.endsWith('"')
              ? term.slice(1, -1)
              : term

          // Escape special regex characters in the term
          const escapedTerm = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(`(${escapedTerm})`, 'gi')

          highlighted = highlighted.replace(
            regex,
            '<mark class="bg-yellow-200 text-gray-900">$1</mark>'
          )
        }
      }
    }

    // Final sanitization to ensure only safe mark tags with allowed classes are present
    const fullySanitized = DOMPurify.sanitize(highlighted, {
      ALLOWED_TAGS: ['mark'],
      ALLOWED_ATTR: ['class'],
      FORBID_TAGS: [
        'script',
        'iframe',
        'object',
        'embed',
        'form',
        'input',
        'button',
        'img',
      ],
      FORBID_ATTR: [
        'src',
        'href',
        'style',
        'onload',
        'onerror',
        'onclick',
        'onmouseover',
        'onmouseout',
        'data',
        'formaction',
      ],
    })

    // Additional check to ensure no dangerous patterns remain in the final HTML
    // This prevents cases where the highlighted term itself could be dangerous
    return fullySanitized
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '') // Remove any event handlers
  }

  // Initialize search when composable is created
  initSearch()

  return {
    fuse: readonly(fuse),
    searchResources,
    getSuggestions,
    highlightSearchTerms,
  }
}
