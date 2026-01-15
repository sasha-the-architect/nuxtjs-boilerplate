import { ref, computed } from 'vue'
import { createStorage } from '~/utils/storage'

export const useSearchHistory = () => {
  const SEARCH_HISTORY_KEY = 'resource_search_history'
  const MAX_HISTORY_ITEMS = 10

  const storage = createStorage<string[]>(SEARCH_HISTORY_KEY, [])
  const searchHistory = ref<string[]>([])

  const getSearchHistory = (): string[] => {
    searchHistory.value = storage.get()
    return searchHistory.value
  }

  const addSearchToHistory = (query: string) => {
    if (!query) return

    const history = getSearchHistory().filter(
      item => item.toLowerCase() !== query.toLowerCase()
    )
    history.unshift(query)
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop()
    }
    searchHistory.value = history
    storage.set(history)
  }

  const removeSearch = (query: string) => {
    if (!query) return

    const history = getSearchHistory().filter(
      item => item.toLowerCase() !== query.toLowerCase()
    )
    searchHistory.value = history
    storage.set(history)
  }

  const clearSearchHistory = () => {
    searchHistory.value = []
    storage.remove()
  }

  return {
    searchHistory: computed(() => searchHistory.value),
    getSearchHistory,
    addSearchToHistory,
    removeSearch,
    clearSearchHistory,
  }
}
