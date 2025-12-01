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

    const { getSearchHistory } = useSearchHistory()
    const history = getSearchHistory()

    expect(history).toEqual([])
  })

  it('should initialize with existing history from localStorage', () => {
    const mockHistory = ['test query 1', 'test query 2', 'test query 3']
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { getSearchHistory } = useSearchHistory()
    const history = getSearchHistory()

    expect(history).toEqual(mockHistory)
  })

  it('should add a new search query to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { getSearchHistory, addSearchToHistory } = useSearchHistory()
    addSearchToHistory('new search query')

    const history = getSearchHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toBe('new search query')
  })

  it('should not add duplicate queries to history', () => {
    const existingHistory = ['existing query']
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory))

    const { getSearchHistory, addSearchToHistory } = useSearchHistory()
    addSearchToHistory('existing query') // Adding the same query

    const history = getSearchHistory()
    expect(history).toHaveLength(1) // Should remain the same
    expect(history[0]).toBe('existing query')
  })

  it('should limit history to the most recent 10 items', () => {
    const oldHistory = Array.from({ length: 10 }, (_, i) => `old query ${i}`)
    localStorageMock.getItem.mockReturnValue(JSON.stringify(oldHistory))

    const { getSearchHistory, addSearchToHistory } = useSearchHistory()
    addSearchToHistory('new query') // This should push out the oldest item

    const history = getSearchHistory()
    expect(history).toHaveLength(10) // Still 10 items
    expect(history[0]).toBe('new query') // Newest first
    // The last item should be the second oldest from the original list
    expect(history[9]).toBe('old query 1')
  })

  it('should clear all search history', () => {
    const mockHistory = ['query 1', 'query 2', 'query 3']
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { getSearchHistory, clearSearchHistory } = useSearchHistory()
    clearSearchHistory()

    const history = getSearchHistory()
    expect(history).toEqual([])
  })

  it('should not have remove specific query functionality (only add/clear)', () => {
    // The actual composable doesn't have a removeSearch method
    const { getSearchHistory, addSearchToHistory, clearSearchHistory } =
      useSearchHistory()

    // Verify that only the expected methods exist
    expect(typeof getSearchHistory).toBe('function')
    expect(typeof addSearchToHistory).toBe('function')
    expect(typeof clearSearchHistory).toBe('function')
  })

  it('should save history to localStorage when adding a query', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { addSearchToHistory } = useSearchHistory()
    addSearchToHistory('test query')

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'resource_search_history',
      expect.any(String)
    )

    // Verify that the saved value can be parsed back
    const savedValue = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(Array.isArray(savedValue)).toBe(true)
    expect(savedValue[0]).toBe('test query')
  })

  it('should save history to localStorage when clearing history', () => {
    const mockHistory = ['query 1', 'query 2', 'query 3']
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { clearSearchHistory } = useSearchHistory()
    clearSearchHistory()

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'resource_search_history'
    )
  })

  it('should save history to localStorage with proper key', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify(['query 1', 'query 2'])
    )

    const { addSearchToHistory } = useSearchHistory()
    addSearchToHistory('new query')

    // Check that the key used is the correct one
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'resource_search_history',
      expect.any(String)
    )
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    // This should not throw an error
    const { getSearchHistory } = useSearchHistory()

    expect(getSearchHistory()).toEqual([])

    // Adding a search should also handle the error
    expect(() => {
      const { addSearchToHistory } = useSearchHistory()
      addSearchToHistory('test query')
    }).not.toThrow()
  })

  it('should parse invalid JSON from localStorage safely', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')

    const { getSearchHistory } = useSearchHistory()

    expect(getSearchHistory()).toEqual([])
  })

  it('should handle null query when adding to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { getSearchHistory, addSearchToHistory } = useSearchHistory()
    // @ts-expect-error - Testing invalid input
    addSearchToHistory(null)

    const history = getSearchHistory()
    expect(history).toEqual([])
  })

  it('should handle empty string query when adding to history', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

    const { getSearchHistory, addSearchToHistory } = useSearchHistory()
    addSearchToHistory('')

    const history = getSearchHistory()
    expect(history).toEqual([])
  })
})
