import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSearchHistory } from '~/composables/useSearchHistory'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useSearchHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()

    // Reset localStorage mock return values
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('initializes with empty history when no localStorage data', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual([])
  })

  it('loads search history from localStorage', () => {
    const now = new Date()
    const mockHistory = [
      { query: 'test1', timestamp: now.toISOString(), count: 1 },
      { query: 'test2', timestamp: now.toISOString(), count: 3 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toHaveLength(2)
    expect(searchHistory.value[0].query).toBe('test1')
    expect(searchHistory.value[0].count).toBe(1)
    expect(searchHistory.value[1].query).toBe('test2')
    expect(searchHistory.value[1].count).toBe(3)
  })

  it('adds search to history', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { addSearchToHistory, searchHistory } = useSearchHistory()

    addSearchToHistory('test query')

    expect(searchHistory.value).toHaveLength(1)
    expect(searchHistory.value[0].query).toBe('test query')
    expect(searchHistory.value[0].count).toBe(1)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'resource_search_history',
      expect.any(String)
    )
  })

  it('increments count for existing query', () => {
    const now = new Date()
    const mockHistory = [
      { query: 'existing query', timestamp: now.toISOString(), count: 1 },
      { query: 'other query', timestamp: now.toISOString(), count: 2 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { addSearchToHistory, searchHistory } = useSearchHistory()

    // Add the same query again
    addSearchToHistory('existing query')

    // The existing query should be moved to the front and count incremented
    expect(searchHistory.value[0].query).toBe('existing query')
    expect(searchHistory.value[0].count).toBe(2)
    expect(searchHistory.value).toHaveLength(2)
  })

  it('limits history to 50 items', () => {
    const now = new Date()
    const largeHistory = Array.from({ length: 60 }, (_, i) => ({
      query: `query${i}`,
      timestamp: now.toISOString(),
      count: 1,
    }))
    localStorageMock.getItem.mockReturnValue(JSON.stringify(largeHistory))

    const { addSearchToHistory, searchHistory } = useSearchHistory()

    addSearchToHistory('new query')

    expect(searchHistory.value).toHaveLength(50)
    expect(searchHistory.value[0].query).toBe('new query')
  })

  it('clears search history', () => {
    const now = new Date()
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([
        { query: 'test', timestamp: now.toISOString(), count: 1 },
      ])
    )

    const { clearSearchHistory, searchHistory } = useSearchHistory()

    clearSearchHistory()

    expect(searchHistory.value).toEqual([])
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'resource_search_history'
    )
  })

  it('removes specific search from history', () => {
    const now = new Date()
    const mockHistory = [
      { query: 'query1', timestamp: now.toISOString(), count: 1 },
      { query: 'query2', timestamp: now.toISOString(), count: 2 },
      { query: 'query3', timestamp: now.toISOString(), count: 1 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { removeSearchFromHistory, searchHistory, getSearchHistory } =
      useSearchHistory()

    removeSearchFromHistory('query2')

    const history = getSearchHistory()
    expect(history).toHaveLength(2)
    expect(history.some(item => item.query === 'query2')).toBe(false)
  })

  it('gets recent searches', () => {
    const now = new Date()
    const mockHistory = [
      { query: 'query1', timestamp: now.toISOString(), count: 1 },
      { query: 'query2', timestamp: now.toISOString(), count: 2 },
      { query: 'query3', timestamp: now.toISOString(), count: 3 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { getRecentSearches } = useSearchHistory()

    const recent = getRecentSearches(2)
    expect(recent).toHaveLength(2)
    expect(recent[0].query).toBe('query1')
    expect(recent[1].query).toBe('query2')
  })

  it('gets top searches by count', () => {
    const now = new Date()
    const mockHistory = [
      { query: 'query1', timestamp: now.toISOString(), count: 1 },
      { query: 'query2', timestamp: now.toISOString(), count: 3 },
      { query: 'query3', timestamp: now.toISOString(), count: 2 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { getTopSearches } = useSearchHistory()

    const top = getTopSearches(5)
    expect(top[0].query).toBe('query2') // highest count
    expect(top[1].query).toBe('query3') // second highest
    expect(top[2].query).toBe('query1') // lowest count
  })

  it('gets searches within time range', () => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const mockHistory = [
      { query: 'current', timestamp: now.toISOString(), count: 1 },
      { query: 'old', timestamp: yesterday.toISOString(), count: 1 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { getSearchesInTimeRange } = useSearchHistory()

    const recent = getSearchesInTimeRange(1) // last 1 day
    expect(recent).toHaveLength(1)
    expect(recent[0].query).toBe('current')
  })

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    // This should not throw an error
    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual([])
  })

  it('handles invalid JSON from localStorage safely', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')

    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual([])
  })

  it('handles null query when adding to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { searchHistory, addSearchToHistory } = useSearchHistory()
    // @ts-expect-error - Testing invalid input
    addSearchToHistory(null)

    expect(searchHistory.value).toEqual([])
  })

  it('handles empty string query when adding to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { searchHistory, addSearchToHistory } = useSearchHistory()
    addSearchToHistory('')

    expect(searchHistory.value).toEqual([])
  })
})

describe('useSearchHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  it('initializes with empty history when no localStorage data', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual([])
  })

  it('loads search history from localStorage', () => {
    const mockHistory = [
      { query: 'test1', timestamp: new Date().toISOString(), count: 1 },
      { query: 'test2', timestamp: new Date().toISOString(), count: 3 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toHaveLength(2)
    expect(searchHistory.value[0].query).toBe('test1')
    expect(searchHistory.value[0].count).toBe(1)
    expect(searchHistory.value[1].query).toBe('test2')
    expect(searchHistory.value[1].count).toBe(3)
  })

  it('adds search to history', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { addSearchToHistory, searchHistory } = useSearchHistory()

    addSearchToHistory('test query')

    expect(searchHistory.value).toHaveLength(1)
    expect(searchHistory.value[0].query).toBe('test query')
    expect(searchHistory.value[0].count).toBe(1)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'resource_search_history',
      expect.any(String)
    )
  })

  it('increments count for existing query', () => {
    const mockHistory = [
      {
        query: 'existing query',
        timestamp: new Date().toISOString(),
        count: 1,
      },
      { query: 'other query', timestamp: new Date().toISOString(), count: 2 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { addSearchToHistory, searchHistory } = useSearchHistory()

    // Add the same query again
    addSearchToHistory('existing query')

    // The existing query should be moved to the front and count incremented
    expect(searchHistory.value[0].query).toBe('existing query')
    expect(searchHistory.value[0].count).toBe(2)
    expect(searchHistory.value).toHaveLength(2)
  })

  it('limits history to 50 items', () => {
    const largeHistory = Array.from({ length: 60 }, (_, i) => ({
      query: `query${i}`,
      timestamp: new Date().toISOString(),
      count: 1,
    }))
    localStorageMock.getItem.mockReturnValue(JSON.stringify(largeHistory))

    const { addSearchToHistory, searchHistory } = useSearchHistory()

    addSearchToHistory('new query')

    expect(searchHistory.value).toHaveLength(50)
    expect(searchHistory.value[0].query).toBe('new query')
  })

  it('clears search history', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([
        { query: 'test', timestamp: new Date().toISOString(), count: 1 },
      ])
    )

    const { clearSearchHistory, searchHistory } = useSearchHistory()

    clearSearchHistory()

    expect(searchHistory.value).toEqual([])
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'resource_search_history'
    )
  })

  it('removes specific search from history', () => {
    const mockHistory = [
      { query: 'query1', timestamp: new Date().toISOString(), count: 1 },
      { query: 'query2', timestamp: new Date().toISOString(), count: 2 },
      { query: 'query3', timestamp: new Date().toISOString(), count: 1 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { removeSearchFromHistory, searchHistory, getSearchHistory } =
      useSearchHistory()

    removeSearchFromHistory('query2')

    const history = getSearchHistory()
    expect(history).toHaveLength(2)
    expect(history.some(item => item.query === 'query2')).toBe(false)
  })

  it('gets recent searches', () => {
    const mockHistory = [
      { query: 'query1', timestamp: new Date().toISOString(), count: 1 },
      { query: 'query2', timestamp: new Date().toISOString(), count: 2 },
      { query: 'query3', timestamp: new Date().toISOString(), count: 3 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { getRecentSearches } = useSearchHistory()

    const recent = getRecentSearches(2)
    expect(recent).toHaveLength(2)
    expect(recent[0].query).toBe('query1')
    expect(recent[1].query).toBe('query2')
  })

  it('gets top searches by count', () => {
    const mockHistory = [
      { query: 'query1', timestamp: new Date().toISOString(), count: 1 },
      { query: 'query2', timestamp: new Date().toISOString(), count: 3 },
      { query: 'query3', timestamp: new Date().toISOString(), count: 2 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { getTopSearches } = useSearchHistory()

    const top = getTopSearches(5)
    expect(top[0].query).toBe('query2') // highest count
    expect(top[1].query).toBe('query3') // second highest
    expect(top[2].query).toBe('query1') // lowest count
  })

  it('gets searches within time range', () => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const mockHistory = [
      { query: 'current', timestamp: now.toISOString(), count: 1 },
      { query: 'old', timestamp: yesterday.toISOString(), count: 1 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { getSearchesInTimeRange } = useSearchHistory()

    const recent = getSearchesInTimeRange(1) // last 1 day
    expect(recent).toHaveLength(1)
    expect(recent[0].query).toBe('current')
  })

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    // This should not throw an error
    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual([])
  })

  it('handles invalid JSON from localStorage safely', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')

    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual([])
  })

  it('handles null query when adding to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { searchHistory, addSearchToHistory } = useSearchHistory()
    // @ts-expect-error - Testing invalid input
    addSearchToHistory(null)

    expect(searchHistory.value).toEqual([])
  })

  it('handles empty string query when adding to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { searchHistory, addSearchToHistory } = useSearchHistory()
    addSearchToHistory('')

    expect(searchHistory.value).toEqual([])
  })
})
