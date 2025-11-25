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

  // Search resources
  const searchResources = (query: string): Resource[] => {
    if (!query || !fuse.value) return [...resources]

    const searchResults = fuse.value.search(query)
    return searchResults.map(item => item.item)
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
