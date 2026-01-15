import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSearchHistory } from '~/composables/useSearchHistory'

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => {
      return Object.keys(store)[index] || null
    }),
    _clearStore: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useSearchHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock._clearStore()
  })

  it('should initialize with empty history when localStorage is empty', () => {
    const { getSearchHistory } = useSearchHistory()
    const history = getSearchHistory()

    expect(history).toEqual([])
  })

  it('should initialize with existing history from localStorage', () => {
    const mockHistory = ['test query 1', 'test query 2', 'test query 3']
    localStorageMock.setItem(
      'resource_search_history',
      JSON.stringify(mockHistory)
    )

    const { getSearchHistory, searchHistory } = useSearchHistory()
    const history = getSearchHistory()

    expect(history).toEqual(mockHistory)
    expect(searchHistory.value).toEqual(mockHistory)
  })

  it('should add a new search query to history', () => {
    localStorageMock.setItem('resource_search_history', JSON.stringify([]))

    const { getSearchHistory, addSearchToHistory } = useSearchHistory()
    addSearchToHistory('new search query')

    const history = getSearchHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toBe('new search query')
  })

  it('should not add duplicate queries to history', () => {
    const existingHistory = ['existing query']
    localStorageMock.setItem(
      'resource_search_history',
      JSON.stringify(existingHistory)
    )

    const { getSearchHistory, addSearchToHistory } = useSearchHistory()
    addSearchToHistory('existing query')

    const history = getSearchHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toBe('existing query')
  })

  it('should limit history to most recent 10 items', () => {
    const oldHistory = Array.from({ length: 10 }, (_, i) => `old query ${i}`)
    localStorageMock.setItem(
      'resource_search_history',
      JSON.stringify(oldHistory)
    )

    const { getSearchHistory, addSearchToHistory } = useSearchHistory()
    addSearchToHistory('new query')

    const history = getSearchHistory()
    expect(history).toHaveLength(10)
    expect(history[0]).toBe('new query')
    expect(history[9]).toBe('old query 8')
  })

  it('should clear all search history', () => {
    const mockHistory = ['query 1', 'query 2', 'query 3']
    localStorageMock.setItem(
      'resource_search_history',
      JSON.stringify(mockHistory)
    )

    const { getSearchHistory, clearSearchHistory } = useSearchHistory()
    clearSearchHistory()

    const history = getSearchHistory()
    expect(history).toEqual([])
  })

  it('should have remove specific query functionality', () => {
    const mockHistory = ['query 1', 'query 2', 'query to remove', 'query 3']
    localStorageMock.setItem(
      'resource_search_history',
      JSON.stringify(mockHistory)
    )

    const {
      getSearchHistory,
      addSearchToHistory: _addSearchToHistory,
      clearSearchHistory: _clearSearchHistory,
      removeSearch,
    } = useSearchHistory()

    removeSearch('query to remove')

    const history = getSearchHistory()
    expect(history).toHaveLength(3)
    expect(history).not.toContain('query to remove')
  })

  it('should handle case-insensitive removal of queries', () => {
    const mockHistory = ['Query 1', 'query 2', 'QUERY 3']
    localStorageMock.setItem(
      'resource_search_history',
      JSON.stringify(mockHistory)
    )

    const { getSearchHistory, removeSearch } = useSearchHistory()

    removeSearch('Query 1')

    const history = getSearchHistory()
    expect(history).toHaveLength(2)
    expect(history).not.toContain('Query 1')
  })

  it('should expose searchHistory as computed property', () => {
    const mockHistory = ['test 1', 'test 2']
    localStorageMock.setItem(
      'resource_search_history',
      JSON.stringify(mockHistory)
    )

    const { searchHistory, addSearchToHistory, getSearchHistory } =
      useSearchHistory()

    getSearchHistory()
    expect(searchHistory.value).toEqual(mockHistory)

    addSearchToHistory('test 3')
    expect(searchHistory.value).toEqual(['test 3', 'test 1', 'test 2'])
  })
})
