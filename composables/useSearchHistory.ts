// Composable for managing search history
import { ref, computed } from 'vue'
import logger from '~/utils/logger'

export const useSearchHistory = () => {
  const SEARCH_HISTORY_KEY = 'resource_search_history'
  const MAX_HISTORY_ITEMS = 10

  // Reactive state for search history
  const searchHistory = ref<string[]>([])

  const getSearchHistory = (): string[] => {
    if (typeof window === 'undefined') return []
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY)
      const parsedHistory = history ? JSON.parse(history) : []
      searchHistory.value = parsedHistory
      return parsedHistory
    } catch (e) {
      logger.error('Error reading search history:', e)
      searchHistory.value = []
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
    searchHistory.value = history
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
      logger.error('Error saving search history:', e)
    }
  }

  const removeSearch = (query: string) => {
    if (!query || typeof window === 'undefined') return
    const history = getSearchHistory().filter(
      item => item.toLowerCase() !== query.toLowerCase()
    )
    searchHistory.value = history
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
      logger.error('Error removing search from history:', e)
    }
  }

  const clearSearchHistory = () => {
    if (typeof window === 'undefined') return
    searchHistory.value = []
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (e) {
      logger.error('Error clearing search history:', e)
    }
  }

  return {
    searchHistory: computed(() => searchHistory.value),
    getSearchHistory,
    addSearchToHistory,
    removeSearch,
    clearSearchHistory,
  }
}
