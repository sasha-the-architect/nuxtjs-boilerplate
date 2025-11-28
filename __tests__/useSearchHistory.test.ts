import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useSearchHistory', () => {
  const mockSearchHistory = [
    { query: 'test query 1', timestamp: Date.now() - 1000 },
    { query: 'test query 2', timestamp: Date.now() - 2000 },
    { query: 'test query 3', timestamp: Date.now() - 3000 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  it('should initialize with empty history when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual([])
  })

  it('should initialize with existing history from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSearchHistory))

    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual(mockSearchHistory)
  })

  it('should add a new search query to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { searchHistory, addSearch } = useSearchHistory()
    addSearch('new search query')

    expect(searchHistory.value).toHaveLength(1)
    expect(searchHistory.value[0].query).toBe('new search query')
    expect(searchHistory.value[0].timestamp).toBeTypeOf('number')
  })

  it('should not add duplicate queries to history', () => {
    const existingHistory = [
      { query: 'existing query', timestamp: Date.now() - 1000 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory))

    const { searchHistory, addSearch } = useSearchHistory()
    addSearch('existing query') // Adding the same query

    expect(searchHistory.value).toHaveLength(1) // Should remain the same
    expect(searchHistory.value[0].query).toBe('existing query')
  })

  it('should limit history to the most recent 10 items', () => {
    const oldHistory = Array.from({ length: 10 }, (_, i) => ({
      query: `old query ${i}`,
      timestamp: Date.now() - (10000 + i),
    }))
    localStorageMock.getItem.mockReturnValue(JSON.stringify(oldHistory))

    const { searchHistory, addSearch } = useSearchHistory()
    addSearch('new query') // This should push out the oldest item

    expect(searchHistory.value).toHaveLength(10) // Still 10 items
    expect(searchHistory.value[0].query).toBe('new query') // Newest first
    // The last item should be the second oldest from the original list
    expect(searchHistory.value[9].query).toBe('old query 1')
  })

  it('should clear all search history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSearchHistory))

    const { searchHistory, clearHistory } = useSearchHistory()
    clearHistory()

    expect(searchHistory.value).toEqual([])
  })

  it('should remove a specific query from history', () => {
    const initialHistory = [
      { query: 'query 1', timestamp: Date.now() - 1000 },
      { query: 'query 2', timestamp: Date.now() - 2000 },
      { query: 'query 3', timestamp: Date.now() - 3000 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialHistory))

    const { searchHistory, removeSearch } = useSearchHistory()
    removeSearch('query 2')

    expect(searchHistory.value).toHaveLength(2)
    expect(searchHistory.value.some(item => item.query === 'query 2')).toBe(
      false
    )
    expect(searchHistory.value[0].query).toBe('query 1')
    expect(searchHistory.value[1].query).toBe('query 3')
  })

  it('should save history to localStorage when adding a query', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { addSearch } = useSearchHistory()
    addSearch('test query')

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'searchHistory',
      expect.any(String)
    )

    // Verify that the saved value can be parsed back
    const savedValue = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(Array.isArray(savedValue)).toBe(true)
    expect(savedValue[0].query).toBe('test query')
  })

  it('should save history to localStorage when clearing history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSearchHistory))

    const { clearHistory } = useSearchHistory()
    clearHistory()

    expect(localStorageMock.setItem).toHaveBeenCalledWith('searchHistory', '[]')
  })

  it('should save history to localStorage when removing a query', () => {
    const initialHistory = [
      { query: 'query 1', timestamp: Date.now() - 1000 },
      { query: 'query 2', timestamp: Date.now() - 2000 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialHistory))

    const { removeSearch } = useSearchHistory()
    removeSearch('query 1')

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'searchHistory',
      expect.any(String)
    )

    // Verify that the saved value no longer contains the removed query
    const savedValue = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(savedValue).toHaveLength(1)
    expect(savedValue.some((item: any) => item.query === 'query 1')).toBe(false)
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    // This should not throw an error
    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual([])

    // Adding a search should also handle the error
    expect(() => {
      const { addSearch } = useSearchHistory()
      addSearch('test query')
    }).not.toThrow()
  })

  it('should parse invalid JSON from localStorage safely', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')

    const { searchHistory } = useSearchHistory()

    expect(searchHistory.value).toEqual([])
  })

  it('should handle null query when adding to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { searchHistory, addSearch } = useSearchHistory()
    // @ts-expect-error - Testing invalid input
    addSearch(null)

    expect(searchHistory.value).toEqual([])
  })

  it('should handle empty string query when adding to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { searchHistory, addSearch } = useSearchHistory()
    addSearch('')

    expect(searchHistory.value).toEqual([])
  })
})
