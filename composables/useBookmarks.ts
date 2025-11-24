import { ref, computed, readonly } from 'vue'
import { Resource } from '~/composables/useResources'

// Define TypeScript interface for bookmarked resources
export interface BookmarkedResource extends Resource {
  dateAdded: string
  notes?: string
  tags?: string[]
}

// Define the structure for exported bookmarks
export interface ExportedBookmarkData {
  version: string
  exportedAt: string
  bookmarks: BookmarkedResource[]
}

// Main composable for managing bookmarks
export const useBookmarks = () => {
  const BOOKMARKS_STORAGE_KEY = 'resource_bookmarks'
  const bookmarkedResources = ref<BookmarkedResource[]>([])
  const loading = ref(false)

  // Load bookmarks from localStorage on initialization
  const loadBookmarks = () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY)
      bookmarkedResources.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Error loading bookmarks from localStorage:', e)
      bookmarkedResources.value = []
    }
  }

  // Save bookmarks to localStorage
  const saveBookmarks = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(
        BOOKMARKS_STORAGE_KEY,
        JSON.stringify(bookmarkedResources.value)
      )
    } catch (e) {
      console.error('Error saving bookmarks to localStorage:', e)
    }
  }

  // Initialize bookmarks
  loadBookmarks()

  // Check if a resource is bookmarked
  const isBookmarked = (resourceId: string) => {
    return bookmarkedResources.value.some(b => b.id === resourceId)
  }

  // Toggle bookmark for a resource
  const toggleBookmark = (resource: Resource) => {
    const existingIndex = bookmarkedResources.value.findIndex(
      b => b.id === resource.id
    )

    if (existingIndex >= 0) {
      // Remove bookmark
      bookmarkedResources.value.splice(existingIndex, 1)
    } else {
      // Add bookmark
      const bookmarkedResource: BookmarkedResource = {
        ...resource,
        dateAdded: new Date().toISOString(),
        notes: undefined,
        tags: [],
      }
      bookmarkedResources.value.push(bookmarkedResource)
    }

    saveBookmarks()
  }

  // Add a note to a bookmark
  const addNoteToBookmark = (resourceId: string, notes: string) => {
    const bookmark = bookmarkedResources.value.find(b => b.id === resourceId)
    if (bookmark) {
      bookmark.notes = notes
      saveBookmarks()
    }
  }

  // Add tags to a bookmark
  const addTagsToBookmark = (resourceId: string, tags: string[]) => {
    const bookmark = bookmarkedResources.value.find(b => b.id === resourceId)
    if (bookmark) {
      bookmark.tags = [...new Set([...(bookmark.tags || []), ...tags])]
      saveBookmarks()
    }
  }

  // Remove a bookmark
  const removeBookmark = (resourceId: string) => {
    const index = bookmarkedResources.value.findIndex(b => b.id === resourceId)
    if (index >= 0) {
      bookmarkedResources.value.splice(index, 1)
      saveBookmarks()
    }
  }

  // Get all bookmarks
  const getBookmarks = computed(() => {
    return [...bookmarkedResources.value]
  })

  // Export bookmarks as JSON
  const exportBookmarks = (): string => {
    const exportData: ExportedBookmarkData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      bookmarks: [...bookmarkedResources.value],
    }

    return JSON.stringify(exportData, null, 2)
  }

  // Import bookmarks from JSON
  const importBookmarks = (importData: string): boolean => {
    try {
      const parsed = JSON.parse(importData) as ExportedBookmarkData

      if (parsed.version && Array.isArray(parsed.bookmarks)) {
        // Validate that the imported data contains valid resources
        const validBookmarks = parsed.bookmarks.filter(
          bookmark => bookmark.id && bookmark.title && bookmark.url
        )

        bookmarkedResources.value = validBookmarks
        saveBookmarks()
        return true
      }
      return false
    } catch (e) {
      console.error('Error importing bookmarks:', e)
      return false
    }
  }

  // Clear all bookmarks
  const clearBookmarks = () => {
    bookmarkedResources.value = []
    saveBookmarks()
  }

  // Initialize bookmarks from localStorage
  if (typeof window !== 'undefined') {
    // Listen for storage changes in other tabs
    window.addEventListener('storage', e => {
      if (e.key === BOOKMARKS_STORAGE_KEY && e.newValue) {
        try {
          bookmarkedResources.value = JSON.parse(e.newValue)
        } catch (error) {
          console.error('Error updating bookmarks from storage event:', error)
        }
      }
    })
  }

  return {
    bookmarkedResources: readonly(bookmarkedResources),
    isBookmarked,
    toggleBookmark,
    addNoteToBookmark,
    addTagsToBookmark,
    removeBookmark,
    getBookmarks,
    exportBookmarks,
    importBookmarks,
    clearBookmarks,
    loading: readonly(loading),
  }
}
