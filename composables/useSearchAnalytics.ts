import { ref } from 'vue'

interface SearchEvent {
  id: string
  query: string
  timestamp: string
  resultsCount: number
  isZeroResult: boolean
}

// Composable for managing search analytics
export const useSearchAnalytics = () => {
  const searchEventsKey = 'search-analytics-events'

  const searchEvents = ref<SearchEvent[]>([])

  // Load search events from localStorage
  const loadSearchEvents = () => {
    const saved = localStorage.getItem(searchEventsKey)
    if (saved) {
      try {
        searchEvents.value = JSON.parse(saved)
      } catch (e) {
        console.error('Error loading search events:', e)
        searchEvents.value = []
      }
    }
  }

  // Save search events to localStorage
  const saveSearchEvents = () => {
    localStorage.setItem(searchEventsKey, JSON.stringify(searchEvents.value))
  }

  // Initialize on composable creation
  loadSearchEvents()

  // Track a search event
  const trackSearch = (query: string, resultsCount: number) => {
    const searchEvent: SearchEvent = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toISOString(),
      resultsCount,
      isZeroResult: resultsCount === 0,
    }

    // Add to beginning of array
    searchEvents.value.unshift(searchEvent)

    // Keep only the 100 most recent events to prevent storage from growing too large
    if (searchEvents.value.length > 100) {
      searchEvents.value = searchEvents.value.slice(0, 100)
    }

    saveSearchEvents()
  }

  // Get popular searches (queries that returned results)
  const getPopularSearches = (limit: number = 10) => {
    const validSearches = searchEvents.value.filter(
      event => !event.isZeroResult
    )
    const queryCounts: { [key: string]: number } = {}

    validSearches.forEach(event => {
      if (!queryCounts[event.query]) {
        queryCounts[event.query] = 0
      }
      queryCounts[event.query]++
    })

    // Sort by count and return top queries
    return Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }))
  }

  // Get zero-result searches (queries that returned no results)
  const getZeroResultSearches = (limit: number = 10) => {
    const zeroResultSearches = searchEvents.value.filter(
      event => event.isZeroResult
    )
    const queryCounts: { [key: string]: number } = {}

    zeroResultSearches.forEach(event => {
      if (!queryCounts[event.query]) {
        queryCounts[event.query] = 0
      }
      queryCounts[event.query]++
    })

    // Sort by count and return top queries
    return Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }))
  }

  // Clear all search events
  const clearSearchEvents = () => {
    searchEvents.value = []
    localStorage.removeItem(searchEventsKey)
  }

  return {
    searchEvents,
    trackSearch,
    getPopularSearches,
    getZeroResultSearches,
    clearSearchEvents,
  }
}
