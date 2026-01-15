import { ref, computed, readonly } from 'vue'
import { createStorageWithDateSerialization } from '~/utils/storage'

export interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  addedAt: Date
  notes?: string
  category?: string
}

const BOOKMARKS_STORAGE_KEY = 'resource_bookmarks'
const storage = createStorageWithDateSerialization<Bookmark[]>(
  BOOKMARKS_STORAGE_KEY,
  []
)

export const useBookmarks = () => {
  const bookmarks = ref<Bookmark[]>([])

  const initBookmarks = () => {
    bookmarks.value = storage.get()
  }

  const saveBookmarks = () => {
    storage.set(bookmarks.value)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bookmarksUpdated'))
    }
  }

  const isBookmarked = (resourceId: string) => {
    return bookmarks.value.some(bookmark => bookmark.id === resourceId)
  }

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

  const removeBookmark = (resourceId: string) => {
    const index = bookmarks.value.findIndex(
      bookmark => bookmark.id === resourceId
    )
    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      saveBookmarks()
    }
  }

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

  const updateBookmarkNotes = (resourceId: string, notes: string) => {
    const bookmark = bookmarks.value.find(
      bookmark => bookmark.id === resourceId
    )
    if (bookmark) {
      bookmark.notes = notes
      saveBookmarks()
    }
  }

  const updateBookmarkCategory = (resourceId: string, category: string) => {
    const bookmark = bookmarks.value.find(
      bookmark => bookmark.id === resourceId
    )
    if (bookmark) {
      bookmark.category = category
      saveBookmarks()
    }
  }

  const getAllBookmarks = computed(() => {
    return [...bookmarks.value].sort(
      (a, b) => b.addedAt.getTime() - a.addedAt.getTime()
    )
  })

  const getBookmarksByCategory = (category: string) => {
    return bookmarks.value.filter(bookmark => bookmark.category === category)
  }

  const bookmarkCount = computed(() => bookmarks.value.length)

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

  const importBookmarks = (importedBookmarks: Bookmark[]) => {
    try {
      const validBookmarks = importedBookmarks.filter(
        bookmark => bookmark.id && bookmark.title && bookmark.url
      )

      const processedBookmarks = validBookmarks.map(bookmark => ({
        ...bookmark,
        addedAt: new Date(bookmark.addedAt),
      }))

      const uniqueBookmarks = [...bookmarks.value]
      for (const newBookmark of processedBookmarks) {
        if (!uniqueBookmarks.some(b => b.id === newBookmark.id)) {
          uniqueBookmarks.push(newBookmark)
        }
      }

      bookmarks.value = uniqueBookmarks
      saveBookmarks()
      return true
    } catch {
      return false
    }
  }

  const clearBookmarks = () => {
    bookmarks.value = []
    saveBookmarks()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('bookmarksUpdated', initBookmarks)
  }

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
