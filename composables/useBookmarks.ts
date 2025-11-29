import { ref, computed, readonly } from 'vue'

// Define TypeScript interface for bookmarks
export interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  addedAt: Date
  notes?: string
  category?: string
}

// Storage key for bookmarks
const BOOKMARKS_STORAGE_KEY = 'resource_bookmarks'

// Main composable for managing bookmarks
export const useBookmarks = () => {
  // Reactive reference for bookmarks
  const bookmarks = ref<Bookmark[]>([])

  // Initialize bookmarks from localStorage
  const initBookmarks = () => {
    if (typeof window === 'undefined') return

    try {
      const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY)
      if (storedBookmarks) {
        const parsedBookmarks = JSON.parse(storedBookmarks)
        // Convert date strings back to Date objects
        bookmarks.value = parsedBookmarks.map((bookmark: any) => ({
          ...bookmark,
          addedAt: new Date(bookmark.addedAt),
        }))
      }
    } catch (error) {
      // Silently handle error - user will have empty bookmarks
      bookmarks.value = []
    }
  }

  // Save bookmarks to localStorage
  const saveBookmarks = () => {
    if (typeof window === 'undefined') return

    try {
      // Convert Date objects to ISO strings for storage
      const bookmarksToStore = bookmarks.value.map(bookmark => ({
        ...bookmark,
        addedAt: bookmark.addedAt.toISOString(),
      }))
      localStorage.setItem(
        BOOKMARKS_STORAGE_KEY,
        JSON.stringify(bookmarksToStore)
      )
      // Trigger custom event to notify other tabs
      window.dispatchEvent(new Event('bookmarksUpdated'))
    } catch (error) {
      // Silently handle error - bookmarks won't be saved to storage
    }
  }

  // Check if a resource is bookmarked
  const isBookmarked = (resourceId: string) => {
    return bookmarks.value.some(bookmark => bookmark.id === resourceId)
  }

  // Add a bookmark
  const addBookmark = (resource: {
    id: string
    title: string
    description: string
    url: string
  }) => {
    if (isBookmarked(resource.id)) return

    const newBookmark: Bookmark = {
      ...resource,
      addedAt: new Date(),
    }

    bookmarks.value.push(newBookmark)
    saveBookmarks()
  }

  // Remove a bookmark
  const removeBookmark = (resourceId: string) => {
    const index = bookmarks.value.findIndex(
      bookmark => bookmark.id === resourceId
    )
    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      saveBookmarks()
    }
  }

  // Toggle bookmark state
  const toggleBookmark = (resource: {
    id: string
    title: string
    description: string
    url: string
  }) => {
    if (isBookmarked(resource.id)) {
      removeBookmark(resource.id)
    } else {
      addBookmark(resource)
    }
  }

  // Update bookmark notes
  const updateBookmarkNotes = (resourceId: string, notes: string) => {
    const bookmark = bookmarks.value.find(
      bookmark => bookmark.id === resourceId
    )
    if (bookmark) {
      bookmark.notes = notes
      saveBookmarks()
    }
  }

  // Update bookmark category
  const updateBookmarkCategory = (resourceId: string, category: string) => {
    const bookmark = bookmarks.value.find(
      bookmark => bookmark.id === resourceId
    )
    if (bookmark) {
      bookmark.category = category
      saveBookmarks()
    }
  }

  // Get all bookmarks
  const getAllBookmarks = computed(() => {
    return [...bookmarks.value].sort(
      (a, b) => b.addedAt.getTime() - a.addedAt.getTime()
    ) // Sort by most recent first
  })

  // Get bookmarks by category
  const getBookmarksByCategory = (category: string) => {
    return bookmarks.value.filter(bookmark => bookmark.category === category)
  }

  // Get bookmark count
  const bookmarkCount = computed(() => bookmarks.value.length)

  // Export bookmarks as JSON
  const exportBookmarks = () => {
    const bookmarksToExport = bookmarks.value.map(bookmark => ({
      ...bookmark,
      addedAt: bookmark.addedAt.toISOString(),
    }))

    const dataStr = JSON.stringify(bookmarksToExport, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `bookmarks-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Import bookmarks from JSON
  const importBookmarks = (importedBookmarks: Bookmark[]) => {
    try {
      // Validate the imported data
      const validBookmarks = importedBookmarks.filter(
        bookmark => bookmark.id && bookmark.title && bookmark.url
      )

      // Convert date strings to Date objects
      const processedBookmarks = validBookmarks.map(bookmark => ({
        ...bookmark,
        addedAt: new Date(bookmark.addedAt),
      }))

      // Merge with existing bookmarks, avoiding duplicates
      const uniqueBookmarks = [...bookmarks.value]
      for (const newBookmark of processedBookmarks) {
        if (!uniqueBookmarks.some(b => b.id === newBookmark.id)) {
          uniqueBookmarks.push(newBookmark)
        }
      }

      bookmarks.value = uniqueBookmarks
      saveBookmarks()
      return true
    } catch (error) {
      // Silently handle error - import will fail gracefully
      return false
    }
  }

  // Clear all bookmarks
  const clearBookmarks = () => {
    bookmarks.value = []
    saveBookmarks()
  }

  // Listen for changes in other tabs
  if (typeof window !== 'undefined') {
    window.addEventListener('bookmarksUpdated', initBookmarks)
  }

  // Initialize bookmarks when composable is created
  initBookmarks()

  return {
    bookmarks: readonly(bookmarks),
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    updateBookmarkNotes,
    updateBookmarkCategory,
    getAllBookmarks,
    getBookmarksByCategory,
    bookmarkCount,
    exportBookmarks,
    importBookmarks,
    clearBookmarks,
  }
}
