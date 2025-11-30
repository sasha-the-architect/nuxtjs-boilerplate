// Composable for managing search history
export const useSearchHistory = () => {
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
        console.error('Error clearing search history:', e)
      }
    }
  }

  return {
    getSearchHistory,
    addSearchToHistory,
    clearSearchHistory,
  }
}
