import { ref, readonly } from 'vue'

interface SavedSearch {
  name: string
  query: string
  createdAt: Date
}

// Composable for managing saved searches
export const useSavedSearches = () => {
  const SAVED_SEARCHES_KEY = 'resource_saved_searches'
  const MAX_SAVED_SEARCHES = 50

  const savedSearches = ref<SavedSearch[]>([])

  // Initialize saved searches from localStorage
  const initSavedSearches = () => {
    if (typeof window === 'undefined') return

    try {
      const storedSearches = localStorage.getItem(SAVED_SEARCHES_KEY)
      if (storedSearches) {
        const parsed = JSON.parse(storedSearches)
        // Convert timestamp strings back to Date objects
        savedSearches.value = parsed.map((item: any) => ({
          name: item.name,
          query: item.query,
          createdAt: new Date(item.createdAt),
        }))
      }
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error reading saved searches:', e)
      }
    }
  }

  // Load saved searches on initialization
  initSavedSearches()

  // Get all saved searches
  const getSavedSearches = (): SavedSearch[] => {
    return [...savedSearches.value]
  }

  // Save a new search
  const saveSearch = (name: string, query: string) => {
    if (!name || !query || typeof window === 'undefined') return

    // Check if search already exists
    const existingIndex = savedSearches.value.findIndex(
      item => item.query.toLowerCase() === query.toLowerCase()
    )

    if (existingIndex >= 0) {
      // Update existing search
      savedSearches.value[existingIndex] = {
        ...savedSearches.value[existingIndex],
        name,
        createdAt: new Date(),
      }
    } else {
      // Add new search
      const newSearch: SavedSearch = {
        name,
        query,
        createdAt: new Date(),
      }
      savedSearches.value.unshift(newSearch)
    }

    // Limit the number of saved searches
    if (savedSearches.value.length > MAX_SAVED_SEARCHES) {
      savedSearches.value = savedSearches.value.slice(0, MAX_SAVED_SEARCHES)
    }

    // Save to localStorage
    saveToStorage()

    // Emit a custom event to notify other parts of the app
    window.dispatchEvent(
      new CustomEvent('saved-search-updated', {
        detail: { name, query },
      })
    )
  }

  // Remove a saved search
  const removeSavedSearch = (query: string) => {
    const index = savedSearches.value.findIndex(
      item => item.query.toLowerCase() === query.toLowerCase()
    )

    if (index >= 0) {
      const removedSearch = savedSearches.value[index]
      savedSearches.value.splice(index, 1)
      saveToStorage()

      // Emit a custom event to notify other parts of the app
      window.dispatchEvent(
        new CustomEvent('saved-search-removed', {
          detail: { name: removedSearch.name, query },
        })
      )
    }
  }

  // Update an existing saved search
  const updateSavedSearch = (
    oldQuery: string,
    newName: string,
    newQuery: string
  ) => {
    const index = savedSearches.value.findIndex(
      item => item.query.toLowerCase() === oldQuery.toLowerCase()
    )

    if (index >= 0) {
      savedSearches.value[index] = {
        name: newName,
        query: newQuery,
        createdAt: new Date(),
      }
      saveToStorage()

      // Emit a custom event to notify other parts of the app
      window.dispatchEvent(
        new CustomEvent('saved-search-updated', {
          detail: { name: newName, query: newQuery },
        })
      )
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    if (typeof window === 'undefined') return

    try {
      // Convert Date objects to ISO strings for storage
      const serializableSearches = savedSearches.value.map(item => ({
        name: item.name,
        query: item.query,
        createdAt: item.createdAt.toISOString(),
      }))
      localStorage.setItem(
        SAVED_SEARCHES_KEY,
        JSON.stringify(serializableSearches)
      )
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error saving saved searches:', e)
      }
    }
  }

  // Clear all saved searches
  const clearSavedSearches = () => {
    if (typeof window === 'undefined') return
    savedSearches.value = []
    try {
      localStorage.removeItem(SAVED_SEARCHES_KEY)
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error clearing saved searches:', e)
      }
    }
  }

  // Check if a search is already saved
  const isSearchSaved = (query: string): boolean => {
    return savedSearches.value.some(
      item => item.query.toLowerCase() === query.toLowerCase()
    )
  }

  // Get saved search by query
  const getSavedSearchByQuery = (query: string): SavedSearch | undefined => {
    return savedSearches.value.find(
      item => item.query.toLowerCase() === query.toLowerCase()
    )
  }

  return {
    savedSearches: readonly(savedSearches),
    getSavedSearches,
    saveSearch,
    removeSavedSearch,
    updateSavedSearch,
    clearSavedSearches,
    isSearchSaved,
    getSavedSearchByQuery,
  }
}
