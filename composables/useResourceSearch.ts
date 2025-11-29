import { ref, readonly } from 'vue'
import Fuse from 'fuse.js'
import type { Resource } from '~/types/resource'
import { sanitizeAndHighlight } from '~/utils/sanitize'

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

    // Use the centralized sanitization utility
    return sanitizeAndHighlight(text, searchQuery)
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
