import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSavedSearches } from '~/composables/useSavedSearches'

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
      return undefined
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
    _getStore: () => ({ ...store }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
})

describe('useSavedSearches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock._clearStore()
  })

  describe('initialization', () => {
    it('should initialize with empty saved searches when localStorage is empty', () => {
      const { savedSearches } = useSavedSearches()

      expect(savedSearches.value).toEqual([])
    })

    it('should load saved searches from localStorage on initialization', () => {
      const existingSearches = [
        {
          name: 'React Resources',
          query: 'react framework',
          createdAt: { __date__: true, value: '2024-01-01T00:00:00.000Z' },
        },
        {
          name: 'Vue Tools',
          query: 'vuejs tools',
          createdAt: { __date__: true, value: '2024-01-02T00:00:00.000Z' },
        },
      ]
      localStorageMock.setItem(
        'resource_saved_searches',
        JSON.stringify(existingSearches)
      )

      const { savedSearches } = useSavedSearches()

      expect(savedSearches.value).toHaveLength(2)
      expect(savedSearches.value[0].name).toBe('React Resources')
      expect(savedSearches.value[0].query).toBe('react framework')
      expect(savedSearches.value[0].createdAt).toBeInstanceOf(Date)
    })
  })

  describe('saveSearch - Happy Path', () => {
    it('should add a new saved search successfully', () => {
      const { saveSearch, savedSearches } = useSavedSearches()

      saveSearch('React Resources', 'react framework')

      expect(savedSearches.value).toHaveLength(1)
      expect(savedSearches.value[0].name).toBe('React Resources')
      expect(savedSearches.value[0].query).toBe('react framework')
      expect(savedSearches.value[0].createdAt).toBeInstanceOf(Date)
    })

    it('should set createdAt to current time for new search', () => {
      const { saveSearch, savedSearches } = useSavedSearches()
      const beforeSave = Date.now()

      saveSearch('Test Search', 'test query')

      const afterSave = Date.now()
      const createdAt = savedSearches.value[0].createdAt.getTime()
      expect(createdAt).toBeGreaterThanOrEqual(beforeSave)
      expect(createdAt).toBeLessThanOrEqual(afterSave)
    })

    it('should persist saved searches to localStorage', () => {
      const { saveSearch } = useSavedSearches()

      saveSearch('Vue Tools', 'vuejs')

      expect(localStorageMock.setItem).toHaveBeenCalled()

      const lastCallIndex = localStorageMock.setItem.mock.calls.length - 1
      const lastCall = localStorageMock.setItem.mock.calls[lastCallIndex]
      const stored = JSON.parse(lastCall[1])

      expect(stored).toHaveLength(1)
      expect(stored[0].name).toBe('Vue Tools')
      expect(stored[0].query).toBe('vuejs')
    })

    it('should emit saved-search-updated event on save', () => {
      const { saveSearch } = useSavedSearches()

      saveSearch('New Search', 'new query')

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'saved-search-updated',
          detail: { query: 'new query', name: 'New Search' },
        })
      )
    })
  })

  describe('saveSearch - Update Existing', () => {
    it('should update existing saved search instead of creating duplicate', () => {
      const { saveSearch, savedSearches } = useSavedSearches()

      saveSearch('Old Name', 'test query')
      expect(savedSearches.value).toHaveLength(1)

      saveSearch('Updated Name', 'test query')
      expect(savedSearches.value).toHaveLength(1)
      expect(savedSearches.value[0].name).toBe('Updated Name')
    })

    it('should update createdAt timestamp for existing search', () => {
      const { saveSearch, savedSearches } = useSavedSearches()
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-01'))

      saveSearch('First Name', 'test query')
      const firstCreatedAt = savedSearches.value[0].createdAt.getTime()

      vi.setSystemTime(new Date('2024-01-02'))
      saveSearch('Updated Name', 'test query')
      const secondCreatedAt = savedSearches.value[0].createdAt.getTime()

      expect(secondCreatedAt).toBeGreaterThan(firstCreatedAt)
      vi.useRealTimers()
    })

    it('should keep order with updated search at its position', () => {
      const { saveSearch, savedSearches } = useSavedSearches()

      saveSearch('Search 1', 'query1')
      saveSearch('Search 2', 'query2')
      saveSearch('Search 3', 'query3')
      expect(savedSearches.value[0].query).toBe('query3')

      saveSearch('Updated Search 2', 'query2')
      expect(savedSearches.value).toHaveLength(3)
      expect(savedSearches.value[0].query).toBe('query3')
      expect(savedSearches.value[1].query).toBe('query2')
      expect(savedSearches.value[1].name).toBe('Updated Search 2')
    })
  })

  describe('saveSearch - Max Limit Enforcement', () => {
    it('should enforce MAX_SAVED_SEARCHES limit of 20', () => {
      const { saveSearch, savedSearches } = useSavedSearches()

      for (let i = 0; i < 25; i++) {
        saveSearch(`Search ${i}`, `query${i}`)
      }

      expect(savedSearches.value).toHaveLength(20)
      expect(savedSearches.value[0].name).toBe('Search 24')
    })

    it('should keep most recent searches when limit is exceeded', () => {
      const { saveSearch, savedSearches } = useSavedSearches()

      for (let i = 0; i < 20; i++) {
        saveSearch(`Search ${i}`, `query${i}`)
      }

      saveSearch('Newest Search', 'newest')

      expect(savedSearches.value).toHaveLength(20)
      expect(savedSearches.value[0].name).toBe('Newest Search')
      expect(savedSearches.value[19].name).toBe('Search 1')
    })
  })

  describe('removeSavedSearch - Happy Path', () => {
    it('should remove saved search by query', () => {
      const { saveSearch, removeSavedSearch, savedSearches } =
        useSavedSearches()

      saveSearch('Search 1', 'query1')
      saveSearch('Search 2', 'query2')
      saveSearch('Search 3', 'query3')

      removeSavedSearch('query2')

      expect(savedSearches.value).toHaveLength(2)
      expect(savedSearches.value.some(s => s.query === 'query2')).toBe(false)
    })

    it('should persist removal to localStorage', () => {
      const { saveSearch, removeSavedSearch } = useSavedSearches()

      saveSearch('Test Search', 'test query')
      removeSavedSearch('test query')

      expect(localStorageMock.setItem).toHaveBeenCalled()
      const setItemCalls = localStorageMock.setItem.mock.calls
      const lastCall = setItemCalls[setItemCalls.length - 1]
      const stored = JSON.parse(lastCall[1])
      expect(stored).toHaveLength(0)
    })

    it('should emit saved-search-removed event on removal', () => {
      const { saveSearch, removeSavedSearch } = useSavedSearches()

      saveSearch('Test Search', 'test query')
      removeSavedSearch('test query')

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'saved-search-removed',
          detail: { query: 'test query', name: 'Test Search' },
        })
      )
    })
  })

  describe('removeSavedSearch - Sad Path', () => {
    it('should do nothing when removing non-existent search', () => {
      const { saveSearch, removeSavedSearch, savedSearches } =
        useSavedSearches()

      saveSearch('Search 1', 'query1')
      const beforeLength = savedSearches.value.length

      removeSavedSearch('nonexistent')

      expect(savedSearches.value).toHaveLength(beforeLength)
      expect(savedSearches.value[0].query).toBe('query1')
    })

    it('should not emit event when removing non-existent search', () => {
      const { removeSavedSearch } = useSavedSearches()

      removeSavedSearch('nonexistent')

      expect(window.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('getSavedSearches', () => {
    it('should return copy of saved searches array', () => {
      const { saveSearch, getSavedSearches } = useSavedSearches()

      saveSearch('Search 1', 'query1')
      saveSearch('Search 2', 'query2')

      const result1 = getSavedSearches()
      const result2 = getSavedSearches()

      expect(result1).toEqual(result2)
      expect(result1).not.toBe(result2)
    })

    it('should return all saved searches', () => {
      const { saveSearch, getSavedSearches } = useSavedSearches()

      saveSearch('React', 'react')
      saveSearch('Vue', 'vue')
      saveSearch('Angular', 'angular')

      const searches = getSavedSearches()

      expect(searches).toHaveLength(3)
      expect(searches[0].name).toBe('Angular')
      expect(searches[1].name).toBe('Vue')
      expect(searches[2].name).toBe('React')
    })
  })

  describe('savedSearches reactive state', () => {
    it('should return readonly savedSearches ref', () => {
      const { savedSearches } = useSavedSearches()

      expect(savedSearches.value).toEqual([])
      expect(typeof savedSearches.value).toBe('object')
    })

    it('should react to save operations', () => {
      const { saveSearch, savedSearches } = useSavedSearches()

      saveSearch('Test', 'test')

      expect(savedSearches.value).toHaveLength(1)
    })

    it('should react to remove operations', () => {
      const { saveSearch, removeSavedSearch, savedSearches } =
        useSavedSearches()

      saveSearch('Test', 'test')
      expect(savedSearches.value).toHaveLength(1)

      removeSavedSearch('test')
      expect(savedSearches.value).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings in name and query', () => {
      const { saveSearch, savedSearches } = useSavedSearches()

      saveSearch('', '')

      expect(savedSearches.value).toHaveLength(1)
      expect(savedSearches.value[0].name).toBe('')
      expect(savedSearches.value[0].query).toBe('')
    })

    it('should handle very long names and queries', () => {
      const longText = 'a'.repeat(1000)
      const { saveSearch, savedSearches } = useSavedSearches()

      saveSearch(longText, longText)

      expect(savedSearches.value).toHaveLength(1)
      expect(savedSearches.value[0].name).toHaveLength(1000)
      expect(savedSearches.value[0].query).toHaveLength(1000)
    })

    it('should handle special characters in name and query', () => {
      const specialName = 'Test <script>alert("xss")</script> & "quotes"'
      const specialQuery = 'react && vue || angular !important'
      const { saveSearch, savedSearches } = useSavedSearches()

      saveSearch(specialName, specialQuery)

      expect(savedSearches.value).toHaveLength(1)
      expect(savedSearches.value[0].name).toBe(specialName)
      expect(savedSearches.value[0].query).toBe(specialQuery)
    })

    it('should handle unicode characters in name and query', () => {
      const unicodeName = '测试 🚀 Emoji & Ñoñ-Áççëñts'
      const unicodeQuery = 'réactif español 日本語'
      const { saveSearch, savedSearches } = useSavedSearches()

      saveSearch(unicodeName, unicodeQuery)

      expect(savedSearches.value).toHaveLength(1)
      expect(savedSearches.value[0].name).toBe(unicodeName)
      expect(savedSearches.value[0].query).toBe(unicodeQuery)
    })
  })

  describe('Date Serialization', () => {
    it('should serialize Date objects to ISO format when persisting to localStorage', () => {
      const { saveSearch } = useSavedSearches()
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))

      saveSearch('Test', 'test')

      expect(localStorageMock.setItem).toHaveBeenCalled()
      const lastCallIndex = localStorageMock.setItem.mock.calls.length - 1
      const lastCall = localStorageMock.setItem.mock.calls[lastCallIndex]
      const stored = JSON.parse(lastCall[1])

      expect(typeof stored[0].createdAt).toBe('string')
      expect(stored[0].createdAt).toContain('2024-01-15T10:30:00')
      vi.useRealTimers()
    })

    it('should handle Date objects correctly in memory', () => {
      const { saveSearch, savedSearches } = useSavedSearches()

      saveSearch('Test Search', 'test query')

      expect(savedSearches.value[0].createdAt).toBeInstanceOf(Date)
      expect(savedSearches.value[0].createdAt.getTime()).not.toBeNaN()
    })
  })
})
