import { ref, readonly, computed } from 'vue'

interface SavedSearch {
  id: string
  name: string
  query: string
  date: string
}

// Composable for managing saved searches
export const useSavedSearches = () => {
  const savedSearchesKey = 'advanced-saved-searches'

  const savedSearches = ref<SavedSearch[]>([])

  // Load saved searches from localStorage
  const loadSavedSearches = () => {
    const saved = localStorage.getItem(savedSearchesKey)
    if (saved) {
      try {
        savedSearches.value = JSON.parse(saved)
      } catch (e) {
        console.error('Error loading saved searches:', e)
        savedSearches.value = []
      }
    }
  }

  // Save searches to localStorage
  const saveSearches = () => {
    localStorage.setItem(savedSearchesKey, JSON.stringify(savedSearches.value))
  }

  // Initialize on composable creation
  loadSavedSearches()

  // Add a new saved search
  const addSavedSearch = (name: string, query: string) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      date: new Date().toISOString(),
    }

    // Add to beginning of array
    savedSearches.value.unshift(newSearch)

    // Keep only the 10 most recent searches
    if (savedSearches.value.length > 10) {
      savedSearches.value = savedSearches.value.slice(0, 10)
    }

    saveSearches()
  }

  // Remove a saved search
  const removeSavedSearch = (id: string) => {
    savedSearches.value = savedSearches.value.filter(search => search.id !== id)
    saveSearches()
  }

  // Clear all saved searches
  const clearSavedSearches = () => {
    savedSearches.value = []
    localStorage.removeItem(savedSearchesKey)
  }

  // Get saved searches
  const getSavedSearches = computed(() => savedSearches.value)

  return {
    savedSearches: readonly(savedSearches),
    addSavedSearch,
    removeSavedSearch,
    clearSavedSearches,
    getSavedSearches,
  }
}
