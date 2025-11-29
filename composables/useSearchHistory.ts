import { ref, readonly } from 'vue'

// Define search history item interface
interface SearchHistoryItem {
  query: string
  timestamp: Date
  count: number // Number of times this query was searched
}

// Composable for managing search history with enhanced functionality
export const useSearchHistory = () => {
  const SEARCH_HISTORY_KEY = 'resource_search_history'
  const MAX_HISTORY_ITEMS = 50 // Increased limit for better UX
  const searchHistory = ref<SearchHistoryItem[]>([])

  // Initialize search history from localStorage
  const initSearchHistory = () => {
    if (typeof window === 'undefined') return

    try {
      const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY)
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory)
        // Convert timestamp strings back to Date objects
        searchHistory.value = parsed.map((item: any) => ({
          query: item.query,
          timestamp: new Date(item.timestamp),
          count: item.count || 1,
        }))
      }
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reading search history:', e)
      }
    }
  }

  // Load search history on initialization
  initSearchHistory()

  // Get search history
  const getSearchHistory = (): SearchHistoryItem[] => {
    return [...searchHistory.value]
  }

  // Get recent searches (most recent first, limited to 10)
  const getRecentSearches = (limit: number = 10): SearchHistoryItem[] => {
    return searchHistory.value.slice(0, limit)
  }

  // Add search query to history with enhanced tracking
  const addSearchToHistory = (query: string) => {
    if (!query || typeof window === 'undefined') return

    // Find existing query in history
    const existingIndex = searchHistory.value.findIndex(
      item => item.query.toLowerCase() === query.toLowerCase()
    )

    if (existingIndex >= 0) {
      // Update existing query: move to front and increment count
      const existingItem = searchHistory.value[existingIndex]
      searchHistory.value.splice(existingIndex, 1)
      searchHistory.value.unshift({
        query,
        timestamp: new Date(),
        count: existingItem.count + 1,
      })
    } else {
      // Add new query to history
      searchHistory.value.unshift({
        query,
        timestamp: new Date(),
        count: 1,
      })
    }

    // Limit history size
    if (searchHistory.value.length > MAX_HISTORY_ITEMS) {
      searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_ITEMS)
    }

    // Save to localStorage
    saveSearchHistoryToStorage()
  }

  // Save search history to localStorage
  const saveSearchHistoryToStorage = () => {
    if (typeof window === 'undefined') return

    try {
      // Convert Date objects to ISO strings for storage
      const serializableHistory = searchHistory.value.map(item => ({
        query: item.query,
        timestamp: item.timestamp.toISOString(),
        count: item.count,
      }))
      localStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(serializableHistory)
      )
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving search history:', e)
      }
    }
  }

  // Clear search history
  const clearSearchHistory = () => {
    if (typeof window === 'undefined') return
    searchHistory.value = []
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        console.error('Error clearing search history:', e)
      }
    }
  }

  // Remove a specific search from history
  const removeSearchFromHistory = (query: string) => {
    const index = searchHistory.value.findIndex(
      item => item.query.toLowerCase() === query.toLowerCase()
    )
    if (index >= 0) {
      searchHistory.value.splice(index, 1)
      saveSearchHistoryToStorage()
    }
  }

  // Get top searches by count
  const getTopSearches = (limit: number = 10): SearchHistoryItem[] => {
    return [...searchHistory.value]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // Get searches within a specific time range
  const getSearchesInTimeRange = (days: number): SearchHistoryItem[] => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return searchHistory.value.filter(item => item.timestamp >= cutoffDate)
  }

  return {
    searchHistory: readonly(searchHistory),
    getSearchHistory,
    getRecentSearches,
    addSearchToHistory,
    clearSearchHistory,
    removeSearchFromHistory,
    getTopSearches,
    getSearchesInTimeRange,
  }
}
