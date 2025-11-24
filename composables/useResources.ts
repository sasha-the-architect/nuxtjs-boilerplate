import { ref, computed, readonly } from 'vue'
import Fuse from 'fuse.js'
import DOMPurify from 'dompurify'
import { logError } from '~/utils/errorLogger'

// Define TypeScript interfaces
export interface Resource {
  id: string
  title: string
  description: string
  benefits: string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: string[]
  technology: string[]
  dateAdded: string
  popularity: number
  icon?: string
}

export interface FilterOptions {
  searchQuery?: string
  categories?: string[]
  pricingModels?: string[]
  difficultyLevels?: string[]
  technologies?: string[]
}

// Define available sorting options
export type SortOption =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'popularity-desc'
  | 'date-added-desc'

// Main composable for managing resources
export const useResources = () => {
  const resources = ref<Resource[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const fuse = ref<Fuse<Resource> | null>(null)
  const retryCount = ref(0)
  const maxRetries = 3

  // Initialize resources
  const initResources = async (attempt = 1) => {
    try {
      // Import resources from JSON
      const resourcesModule = await import('~/data/resources.json')
      resources.value = resourcesModule.default || resourcesModule

      // Initialize Fuse.js for fuzzy search
      fuse.value = new Fuse(resources.value, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'benefits', weight: 0.2 },
          { name: 'tags', weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
      })

      loading.value = false
      error.value = null
    } catch (err) {
      // Log error using our error logging service
      logError(
        `Failed to load resources (attempt ${attempt}/${maxRetries}): ${err instanceof Error ? err.message : 'Unknown error'}`,
        err as Error,
        'useResources'
      )

      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error loading resources:', err)
      }
      error.value = `Failed to load resources${attempt < maxRetries ? '. Retrying...' : ''}`

      // Retry if we haven't exceeded max retries
      if (attempt < maxRetries) {
        retryCount.value = attempt
        // Wait for a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        await initResources(attempt + 1)
      } else {
        loading.value = false
      }
    }
  }

  // Retry loading resources
  const retryResources = async () => {
    loading.value = true
    error.value = null
    retryCount.value = 0
    await initResources()
  }

  // Get unique categories
  const categories = computed(() => {
    return [...new Set(resources.value.map(r => r.category))]
  })

  // Get unique pricing models
  const pricingModels = computed(() => {
    return [...new Set(resources.value.map(r => r.pricingModel))]
  })

  // Get unique difficulty levels
  const difficultyLevels = computed(() => {
    return [...new Set(resources.value.map(r => r.difficulty))]
  })

  // Get unique technologies
  const technologies = computed(() => {
    const allTechnologies = resources.value.flatMap(r => r.technology)
    return [...new Set(allTechnologies)]
  })

  // Filter and search resources
  const filteredResources = computed(() => {
    if (!resources.value.length) {
      return []
    }

    let result: Resource[] = []

    // Apply search query using Fuse.js
    if (filterOptions.value.searchQuery && fuse.value) {
      const searchResults = fuse.value.search(filterOptions.value.searchQuery)
      result = searchResults.map(item => item.item)
    } else {
      result = [...resources.value]
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

  // Filter options
  const filterOptions = ref<FilterOptions>({
    searchQuery: '',
    categories: [],
    pricingModels: [],
    difficultyLevels: [],
    technologies: [],
  })

  // Sort option
  const sortOption = ref<SortOption>('popularity-desc')

  // Methods to update filters
  const updateSearchQuery = (query: string) => {
    filterOptions.value.searchQuery = query
  }

  const toggleCategory = (category: string) => {
    if (!filterOptions.value.categories) filterOptions.value.categories = []
    const index = filterOptions.value.categories.indexOf(category)
    if (index > -1) {
      filterOptions.value.categories.splice(index, 1)
    } else {
      filterOptions.value.categories.push(category)
    }
  }

  const togglePricingModel = (pricingModel: string) => {
    if (!filterOptions.value.pricingModels)
      filterOptions.value.pricingModels = []
    const index = filterOptions.value.pricingModels.indexOf(pricingModel)
    if (index > -1) {
      filterOptions.value.pricingModels.splice(index, 1)
    } else {
      filterOptions.value.pricingModels.push(pricingModel)
    }
  }

  const toggleDifficultyLevel = (difficulty: string) => {
    if (!filterOptions.value.difficultyLevels)
      filterOptions.value.difficultyLevels = []
    const index = filterOptions.value.difficultyLevels.indexOf(difficulty)
    if (index > -1) {
      filterOptions.value.difficultyLevels.splice(index, 1)
    } else {
      filterOptions.value.difficultyLevels.push(difficulty)
    }
  }

  const toggleTechnology = (technology: string) => {
    if (!filterOptions.value.technologies) filterOptions.value.technologies = []
    const index = filterOptions.value.technologies.indexOf(technology)
    if (index > -1) {
      filterOptions.value.technologies.splice(index, 1)
    } else {
      filterOptions.value.technologies.push(technology)
    }
  }

  const setSortOption = (option: SortOption) => {
    sortOption.value = option
  }

  // Reset all filters
  const resetFilters = () => {
    filterOptions.value = {
      searchQuery: '',
      categories: [],
      pricingModels: [],
      difficultyLevels: [],
      technologies: [],
    }
    sortOption.value = 'popularity-desc'
  }

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
      console.error('Error reading search history:', e)
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
      console.error('Error saving search history:', e)
    }
  }

  const clearSearchHistory = () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (e) {
      console.error('Error clearing search history:', e)
    }
  }

  // Initialize resources when composable is created
  initResources()

  // Function to highlight search terms in text
  const highlightSearchTerms = (text: string, searchQuery: string): string => {
    if (!searchQuery || !text) return text || ''

    // First sanitize the input text to prevent XSS
    const sanitizedText = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
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

    // Create highlighted text
    const highlighted = sanitizedText.replace(
      regex,
      '<mark class="bg-yellow-200 text-gray-900">$1</mark>'
    )

    // Sanitize the final result to ensure no malicious content remains
    const sanitized = DOMPurify.sanitize(highlighted, {
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

    // Final sanitization to remove dangerous keywords from text content
    // This is required to prevent XSS when highlighting terms like "javascript"
    // that might be part of dangerous patterns like "javascript:alert(1)"
    return sanitized.replace(
      /(alert|script|javascript|vbscript|onload|onerror|onclick|onmouseover|onmouseout|onfocus|onblur)/gi,
      ''
    )
  }

  return {
    resources: readonly(resources),
    filteredResources,
    loading: readonly(loading),
    error: readonly(error),
    retryCount: readonly(retryCount),
    maxRetries,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    filterOptions: readonly(filterOptions),
    sortOption: readonly(sortOption),
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    setSortOption,
    resetFilters,
    highlightSearchTerms,
    retryResources,
    getSuggestions,
    getSearchHistory,
    addSearchToHistory,
    clearSearchHistory,
  }
}
