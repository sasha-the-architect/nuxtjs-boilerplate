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
  const parseAdvancedQuery = (query: string): Resource[] => {
    if (!query.trim()) return [...resources]

    // Check if query contains advanced operators
    if (
      query.includes(' AND ') ||
      query.includes(' OR ') ||
      query.includes(' NOT ') ||
      query.includes('"')
    ) {
      return performAdvancedSearch(query)
    } else {
      // Use regular Fuse search for simple queries
      if (!fuse.value) return [...resources]
      const searchResults = fuse.value.search(query)
      return searchResults.map(item => item.item)
    }
  }

  // Perform advanced search with operators
  const performAdvancedSearch = (query: string): Resource[] => {
    // First, parse the query for different search terms and operators
    const terms = parseQueryTerms(query)

    // Process each term and combine results based on operators
    let result: Resource[] = []
    let currentOperator: 'AND' | 'OR' | 'NOT' | null = null

    for (const term of terms) {
      if (term.type === 'operator') {
        currentOperator = term.value as 'AND' | 'OR' | 'NOT'
      } else if (term.type === 'term') {
        const termResults = searchByTerm(term.value)

        if (result.length === 0) {
          // First term - just assign the results
          result = termResults
        } else {
          // Combine with existing results based on operator
          switch (currentOperator) {
            case 'AND': {
              result = result.filter(resource =>
                termResults.some(termRes => termRes.id === resource.id)
              )
              break
            }
            case 'OR': {
              const ids = new Set(result.map(r => r.id))
              termResults.forEach(termRes => {
                if (!ids.has(termRes.id)) {
                  result.push(termRes)
                }
              })
              break
            }
            case 'NOT': {
              result = result.filter(
                resource =>
                  !termResults.some(termRes => termRes.id === resource.id)
              )
              break
            }
          }
        }
        // Reset operator after processing
        currentOperator = null
      }
    }

    return result
  }

  // Parse query into terms and operators
  const parseQueryTerms = (query: string) => {
    const terms: { type: 'term' | 'operator'; value: string }[] = []
    const regex = /(".*?"|AND|OR|NOT|[^\s]+)/g
    let match

    while ((match = regex.exec(query)) !== null) {
      const token = match[0]
      if (token === 'AND' || token === 'OR' || token === 'NOT') {
        terms.push({ type: 'operator', value: token })
      } else {
        // Remove quotes if present
        const cleanToken =
          token.startsWith('"') && token.endsWith('"')
            ? token.slice(1, -1)
            : token
        terms.push({ type: 'term', value: cleanToken })
      }
    }

    return terms
  }

  // Search by a single term
  const searchByTerm = (term: string): Resource[] => {
    if (!fuse.value) return [...resources]

    // Use Fuse.js for the term search
    const searchResults = fuse.value.search(term)
    return searchResults.map(item => item.item)
  }

  // Search resources with advanced query support
  const searchResources = (query: string): Resource[] => {
    if (!query || !fuse.value) return [...resources]

    // Use advanced search if query contains operators
    return parseAdvancedQuery(query)
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

    // Escape special regex characters in search query
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')

    // Create highlighted text - only highlighting the already sanitized text
    const highlighted = sanitizedText.replace(
      regex,
      '<mark class="bg-yellow-200 text-gray-900">$1</mark>'
    )

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
