import { computed, ref, watch } from 'vue'
import Fuse from 'fuse.js'
import DOMPurify from 'dompurify'
import type { Resource, FilterOptions, SortOption } from '~/types/resource'

// Composable for managing resource search and filtering
export const useResourceSearch = (
  resources: readonly Resource[],
  filterOptions: any,
  sortOption: any
) => {
  const fuse = ref<Fuse<Resource> | null>(null)

  // Initialize Fuse.js for fuzzy search
  const initFuse = (resourceList: readonly Resource[]) => {
    fuse.value = new Fuse(resourceList, {
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

  // Initialize fuse if resources exist
  if (resources.length > 0) {
    initFuse(resources)
  }

  // Watch for changes in resources and re-initialize fuse when needed
  watch(
    () => resources.length,
    newLength => {
      if (newLength > 0) {
        initFuse(resources)
      }
    }
  )

  // Filter and search resources
  const filteredResources = computed(() => {
    if (!resources.length) {
      return []
    }

    let result: Resource[] = []

    // Apply search query using Fuse.js
    if (filterOptions.value.searchQuery && fuse.value) {
      const searchResults = fuse.value.search(filterOptions.value.searchQuery)
      result = searchResults.map(item => item.item)
    } else {
      result = [...resources]
    }

    // Apply category filter
    if (
      filterOptions.value.categories &&
      filterOptions.value.categories.length > 0
    ) {
      result = result.filter(resource =>
        filterOptions.value.categories!.includes(resource.category)
      )
    }

    // Apply pricing model filter
    if (
      filterOptions.value.pricingModels &&
      filterOptions.value.pricingModels.length > 0
    ) {
      result = result.filter(resource =>
        filterOptions.value.pricingModels!.includes(resource.pricingModel)
      )
    }

    // Apply difficulty level filter
    if (
      filterOptions.value.difficultyLevels &&
      filterOptions.value.difficultyLevels.length > 0
    ) {
      result = result.filter(resource =>
        filterOptions.value.difficultyLevels!.includes(resource.difficulty)
      )
    }

    // Apply technology filter
    if (
      filterOptions.value.technologies &&
      filterOptions.value.technologies.length > 0
    ) {
      result = result.filter(resource =>
        resource.technology.some(tech =>
          filterOptions.value.technologies!.includes(tech)
        )
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption.value) {
        case 'alphabetical-asc':
          return a.title.localeCompare(b.title)
        case 'alphabetical-desc':
          return b.title.localeCompare(a.title)
        case 'popularity-desc':
          return b.popularity - a.popularity
        case 'date-added-desc':
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          )
        default:
          return 0
      }
    })

    return result
  })

  // Search suggestions functionality
  const getSuggestions = (query: string, limit: number = 5): Resource[] => {
    if (!query || !fuse.value) return []

    const searchResults = fuse.value.search(query, { limit })
    return searchResults.map(item => item.item)
  }

  // Search history functionality
  const SEARCH_HISTORY_KEY = 'resource_search_history'
  const MAX_HISTORY_ITEMS = 10

  const getSearchHistory = (): string[] => {
    if (typeof window === 'undefined') return []
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY)
      return history ? JSON.parse(history) : []
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error reading search history:', e)
      }
      return []
    }
  }

  const addSearchToHistory = (query: string) => {
    if (!query || typeof window === 'undefined') return
    const history = getSearchHistory().filter(
      item => item.toLowerCase() !== query.toLowerCase()
    )
    history.unshift(query)
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop()
    }
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error saving search history:', e)
      }
    }
  }

  const clearSearchHistory = () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error clearing search history:', e)
      }
    }
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

  return {
    filteredResources,
    highlightSearchTerms,
    getSuggestions,
    getSearchHistory,
    addSearchToHistory,
    clearSearchHistory,
  }
}
