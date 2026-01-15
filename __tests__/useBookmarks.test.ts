import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useBookmarks } from '~/composables/useBookmarks'
import type { Bookmark } from '~/composables/useBookmarks'

describe('useBookmarks', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty bookmarks array', () => {
      const { bookmarks, bookmarkCount } = useBookmarks()
      expect(bookmarks.value).toEqual([])
      expect(bookmarkCount.value).toBe(0)
    })

    it('should load bookmarks from localStorage', () => {
      const existingBookmarks: Bookmark[] = [
        {
          id: '1',
          title: 'Test Resource',
          description: 'Test Description',
          url: 'https://example.com',
          addedAt: new Date('2024-01-01'),
        },
      ]
      localStorage.setItem(
        'resource_bookmarks',
        JSON.stringify(existingBookmarks)
      )

      const { bookmarks } = useBookmarks()
      expect(bookmarks.value).toHaveLength(1)
      expect(bookmarks.value[0].id).toBe('1')
    })
  })

  describe('isBookmarked', () => {
    it('should return true for bookmarked resource', () => {
      const { addBookmark, isBookmarked } = useBookmarks()
      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      expect(isBookmarked('1')).toBe(true)
    })

    it('should return false for non-bookmarked resource', () => {
      const { isBookmarked } = useBookmarks()
      expect(isBookmarked('nonexistent')).toBe(false)
    })
  })

  describe('addBookmark - Happy Path', () => {
    it('should add a new bookmark successfully', () => {
      const { addBookmark, bookmarks } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test Resource',
        description: 'Test Description',
        url: 'https://example.com',
      })

      expect(bookmarks.value).toHaveLength(1)
      expect(bookmarks.value[0].id).toBe('1')
      expect(bookmarks.value[0].title).toBe('Test Resource')
      expect(bookmarks.value[0].addedAt).toBeInstanceOf(Date)
    })

    it('should set addedAt to current time', () => {
      const { addBookmark, bookmarks } = useBookmarks()
      const beforeAdd = Date.now()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      const afterAdd = Date.now()
      expect(bookmarks.value[0].addedAt.getTime()).toBeGreaterThanOrEqual(
        beforeAdd
      )
      expect(bookmarks.value[0].addedAt.getTime()).toBeLessThanOrEqual(afterAdd)
    })

    it('should persist to localStorage', () => {
      const { addBookmark } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      const stored = localStorage.getItem('resource_bookmarks')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
    })

    it('should trigger bookmarksUpdated event on add', () => {
      const eventListener = vi.fn()
      window.addEventListener('bookmarksUpdated', eventListener)

      const { addBookmark } = useBookmarks()
      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      expect(eventListener).toHaveBeenCalledTimes(1)
      window.removeEventListener('bookmarksUpdated', eventListener)
    })
  })

  describe('addBookmark - Sad Path', () => {
    it('should not add duplicate bookmark', () => {
      const { addBookmark, bookmarks } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      addBookmark({
        id: '1',
        title: 'Duplicate',
        description: 'Duplicate',
        url: 'https://duplicate.com',
      })

      expect(bookmarks.value).toHaveLength(1)
      expect(bookmarks.value[0].title).toBe('Test')
    })
  })

  describe('removeBookmark - Happy Path', () => {
    it('should remove bookmark successfully', () => {
      const { addBookmark, removeBookmark, bookmarks } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      removeBookmark('1')

      expect(bookmarks.value).toHaveLength(0)
    })

    it('should persist removal to localStorage', () => {
      const { addBookmark, removeBookmark } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      removeBookmark('1')

      const stored = localStorage.getItem('resource_bookmarks')
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(0)
    })

    it('should trigger bookmarksUpdated event on remove', () => {
      const eventListener = vi.fn()
      window.addEventListener('bookmarksUpdated', eventListener)

      const { addBookmark, removeBookmark } = useBookmarks()
      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })
      removeBookmark('1')

      expect(eventListener).toHaveBeenCalledTimes(2)
      window.removeEventListener('bookmarksUpdated', eventListener)
    })
  })

  describe('removeBookmark - Sad Path', () => {
    it('should do nothing when removing non-existent bookmark', () => {
      const { clearBookmarks, removeBookmark, bookmarks } = useBookmarks()
      clearBookmarks()

      removeBookmark('nonexistent')

      expect(bookmarks.value).toHaveLength(0)
    })
  })

  describe('toggleBookmark', () => {
    it('should add bookmark when not bookmarked', () => {
      const { toggleBookmark, bookmarks, isBookmarked } = useBookmarks()

      toggleBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      expect(isBookmarked('1')).toBe(true)
      expect(bookmarks.value).toHaveLength(1)
    })

    it('should remove bookmark when already bookmarked', () => {
      const { addBookmark, toggleBookmark, bookmarks, isBookmarked } =
        useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      toggleBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      expect(isBookmarked('1')).toBe(false)
      expect(bookmarks.value).toHaveLength(0)
    })
  })

  describe('updateBookmarkNotes', () => {
    it('should update bookmark notes successfully', () => {
      const { addBookmark, updateBookmarkNotes, bookmarks } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      updateBookmarkNotes('1', 'My notes')

      expect(bookmarks.value[0].notes).toBe('My notes')
    })

    it('should do nothing when bookmark does not exist', () => {
      const { clearBookmarks, updateBookmarkNotes, bookmarks } = useBookmarks()
      clearBookmarks()

      updateBookmarkNotes('nonexistent', 'Notes')

      expect(bookmarks.value).toHaveLength(0)
    })

    it('should persist notes to localStorage', () => {
      const { addBookmark, updateBookmarkNotes } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      updateBookmarkNotes('1', 'Updated notes')

      const stored = localStorage.getItem('resource_bookmarks')
      const parsed = JSON.parse(stored!)
      expect(parsed[0].notes).toBe('Updated notes')
    })
  })

  describe('updateBookmarkCategory', () => {
    it('should update bookmark category successfully', () => {
      const { addBookmark, updateBookmarkCategory, bookmarks } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      updateBookmarkCategory('1', 'AI Tools')

      expect(bookmarks.value[0].category).toBe('AI Tools')
    })

    it('should do nothing when bookmark does not exist', () => {
      const { clearBookmarks, updateBookmarkCategory, bookmarks } =
        useBookmarks()
      clearBookmarks()

      updateBookmarkCategory('nonexistent', 'Category')

      expect(bookmarks.value).toHaveLength(0)
    })
  })

  describe('getAllBookmarks', () => {
    it('should return bookmarks sorted by addedAt (descending)', () => {
      const { addBookmark, getAllBookmarks } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'First',
        description: 'First',
        url: 'https://first.com',
      })

      vi.advanceTimersByTime(1000)

      addBookmark({
        id: '2',
        title: 'Second',
        description: 'Second',
        url: 'https://second.com',
      })

      const all = getAllBookmarks.value
      expect(all[0].id).toBe('2')
      expect(all[1].id).toBe('1')
    })
  })

  describe('getBookmarksByCategory', () => {
    it('should return bookmarks matching category', () => {
      const { addBookmark, getBookmarksByCategory, updateBookmarkCategory } =
        useBookmarks()

      addBookmark({
        id: '1',
        title: 'AI Tool',
        description: 'AI',
        url: 'https://ai.com',
      })

      addBookmark({
        id: '2',
        title: 'Dev Tool',
        description: 'Dev',
        url: 'https://dev.com',
      })

      addBookmark({
        id: '3',
        title: 'Another AI',
        description: 'AI 2',
        url: 'https://ai2.com',
      })

      updateBookmarkCategory('1', 'AI')
      updateBookmarkCategory('2', 'Dev')
      updateBookmarkCategory('3', 'AI')

      const aiBookmarks = getBookmarksByCategory('AI')
      expect(aiBookmarks).toHaveLength(2)
      expect(aiBookmarks.every(b => b.category === 'AI')).toBe(true)
    })

    it('should return empty array for non-existent category', () => {
      const { addBookmark, getBookmarksByCategory } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      const result = getBookmarksByCategory('NonExistent')
      expect(result).toHaveLength(0)
    })
  })

  describe('exportBookmarks', () => {
    beforeEach(() => {
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    })

    it('should export bookmarks as JSON file', () => {
      const { addBookmark, exportBookmarks } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      exportBookmarks()

      const link = document.createElement('a') as any
      expect(link.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringMatching(/bookmarks-\d{4}-\d{2}-\d{2}\.json/)
      )
      expect(link.click).toHaveBeenCalled()
    })

    it('should serialize Date objects to ISO strings', () => {
      const { addBookmark, exportBookmarks } = useBookmarks()
      const testDate = new Date('2024-01-01T00:00:00.000Z')

      vi.spyOn(Date, 'now').mockReturnValue(testDate.getTime())

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      exportBookmarks()

      const link = document.createElement('a') as any
      const href = link.setAttribute.mock.calls.find(
        (call: any) => call[0] === 'href'
      )?.[1]
      const dataUri = href?.split('charset=utf-8,')[1]
      const exported = JSON.parse(decodeURIComponent(dataUri!))

      expect(typeof exported[0].addedAt).toBe('string')
      expect(exported[0].addedAt).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
      )
    })
  })

  describe('importBookmarks - Happy Path', () => {
    it('should import valid bookmarks successfully', () => {
      const { clearBookmarks, importBookmarks, bookmarks } = useBookmarks()
      clearBookmarks()

      const imported: Bookmark[] = [
        {
          id: '1',
          title: 'Imported',
          description: 'Imported Desc',
          url: 'https://imported.com',
          addedAt: new Date('2024-01-01'),
        },
      ]

      const result = importBookmarks(imported)

      expect(result).toBe(true)
      expect(bookmarks.value).toHaveLength(1)
      expect(bookmarks.value[0].id).toBe('1')
    })

    it('should deserialize ISO strings to Date objects', () => {
      const { clearBookmarks, importBookmarks, bookmarks } = useBookmarks()
      clearBookmarks()

      const imported: Bookmark[] = [
        {
          id: '1',
          title: 'Imported',
          description: 'Imported Desc',
          url: 'https://imported.com',
          addedAt: new Date('2024-01-01T00:00:00.000Z') as any,
        },
      ]

      importBookmarks(imported)

      expect(bookmarks.value[0].addedAt).toBeInstanceOf(Date)
      expect(bookmarks.value[0].addedAt.getTime()).toBe(
        new Date('2024-01-01T00:00:00.000Z').getTime()
      )
    })

    it('should not import duplicate bookmarks', () => {
      const { clearBookmarks, addBookmark, importBookmarks, bookmarks } =
        useBookmarks()
      clearBookmarks()

      addBookmark({
        id: '1',
        title: 'Existing',
        description: 'Existing',
        url: 'https://existing.com',
      })

      const imported: Bookmark[] = [
        {
          id: '1',
          title: 'Duplicate',
          description: 'Duplicate',
          url: 'https://duplicate.com',
          addedAt: new Date(),
        },
        {
          id: '2',
          title: 'New',
          description: 'New',
          url: 'https://new.com',
          addedAt: new Date(),
        },
      ]

      importBookmarks(imported)

      expect(bookmarks.value).toHaveLength(2)
      expect(
        bookmarks.value.some(b => b.id === '1' && b.title === 'Existing')
      ).toBe(true)
      expect(bookmarks.value.some(b => b.id === '2' && b.title === 'New')).toBe(
        true
      )
    })
  })

  describe('importBookmarks - Sad Path', () => {
    it('should return false on invalid data', () => {
      const { clearBookmarks, importBookmarks } = useBookmarks()
      clearBookmarks()

      const result = importBookmarks(null as any)

      expect(result).toBe(false)
    })

    it('should filter out bookmarks without required fields', () => {
      const { clearBookmarks, importBookmarks, bookmarks } = useBookmarks()
      clearBookmarks()

      const imported: any[] = [
        {
          id: '1',
          title: 'Valid',
          description: 'Valid',
          url: 'https://valid.com',
          addedAt: new Date(),
        },
        {
          id: '2',
          description: 'Missing title',
          url: 'https://invalid.com',
          addedAt: new Date(),
        },
        {
          id: '3',
          title: 'Missing url',
          description: 'Invalid',
          addedAt: new Date(),
        },
      ]

      importBookmarks(imported)

      expect(bookmarks.value).toHaveLength(1)
      expect(bookmarks.value[0].title).toBe('Valid')
    })
  })

  describe('clearBookmarks', () => {
    it('should clear all bookmarks', () => {
      const { addBookmark, clearBookmarks, bookmarks, bookmarkCount } =
        useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      addBookmark({
        id: '2',
        title: 'Test 2',
        description: 'Test 2',
        url: 'https://test2.com',
      })

      clearBookmarks()

      expect(bookmarks.value).toHaveLength(0)
      expect(bookmarkCount.value).toBe(0)
    })

    it('should persist clear to localStorage', () => {
      const { addBookmark, clearBookmarks } = useBookmarks()

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      clearBookmarks()

      const stored = localStorage.getItem('resource_bookmarks')
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(0)
    })
  })

  describe('bookmarkCount', () => {
    it('should reflect correct count', () => {
      const { clearBookmarks, addBookmark, removeBookmark, bookmarkCount } =
        useBookmarks()
      clearBookmarks()

      expect(bookmarkCount.value).toBe(0)

      addBookmark({
        id: '1',
        title: 'Test',
        description: 'Test',
        url: 'https://test.com',
      })

      expect(bookmarkCount.value).toBe(1)

      addBookmark({
        id: '2',
        title: 'Test 2',
        description: 'Test 2',
        url: 'https://test2.com',
      })

      expect(bookmarkCount.value).toBe(2)

      removeBookmark('1')

      expect(bookmarkCount.value).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings in bookmark data', () => {
      const { clearBookmarks, addBookmark, bookmarks } = useBookmarks()
      clearBookmarks()

      addBookmark({
        id: '1',
        title: '',
        description: '',
        url: 'https://test.com',
      })

      expect(bookmarks.value[0].title).toBe('')
      expect(bookmarks.value[0].description).toBe('')
    })

    it('should handle very long descriptions', () => {
      const { clearBookmarks, addBookmark, bookmarks } = useBookmarks()
      clearBookmarks()
      const longDesc = 'x'.repeat(10000)

      addBookmark({
        id: '1',
        title: 'Test',
        description: longDesc,
        url: 'https://test.com',
      })

      expect(bookmarks.value[0].description).toBe(longDesc)
    })

    it('should handle special characters in title and description', () => {
      const { clearBookmarks, addBookmark, bookmarks } = useBookmarks()
      clearBookmarks()
      const specialText = 'Test with émojis 🎉 and spëcial çharacters!'

      addBookmark({
        id: '1',
        title: specialText,
        description: specialText,
        url: 'https://test.com',
      })

      expect(bookmarks.value[0].title).toBe(specialText)
      expect(bookmarks.value[0].description).toBe(specialText)
    })
  })
})
