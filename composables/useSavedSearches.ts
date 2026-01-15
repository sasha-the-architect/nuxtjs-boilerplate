import { ref, readonly } from 'vue'
import type { SavedSearch } from '~/types/search'
import { createStorageWithDateSerialization } from '~/utils/storage'

const SAVED_SEARCHES_KEY = 'resource_saved_searches'
const MAX_SAVED_SEARCHES = 20

export const useSavedSearches = () => {
  const storage = createStorageWithDateSerialization<SavedSearch[]>(
    SAVED_SEARCHES_KEY,
    []
  )
  const savedSearches = ref<SavedSearch[]>([])

  const loadSavedSearches = (): SavedSearch[] => {
    savedSearches.value = storage.get()
    return savedSearches.value
  }

  const saveSearch = (name: string, query: string) => {
    const existingIndex = savedSearches.value.findIndex(s => s.query === query)

    if (existingIndex >= 0) {
      savedSearches.value[existingIndex] = {
        ...savedSearches.value[existingIndex],
        name,
        createdAt: new Date(),
      }
    } else {
      savedSearches.value.unshift({
        name,
        query,
        createdAt: new Date(),
      })
    }

    if (savedSearches.value.length > MAX_SAVED_SEARCHES) {
      savedSearches.value = savedSearches.value.slice(0, MAX_SAVED_SEARCHES)
    }

    storage.set(savedSearches.value)
    emitSavedSearchEvent('saved-search-updated', { query, name })
  }

  const removeSavedSearch = (query: string) => {
    const removedSearch = savedSearches.value.find(s => s.query === query)
    savedSearches.value = savedSearches.value.filter(s => s.query !== query)
    storage.set(savedSearches.value)

    if (removedSearch) {
      emitSavedSearchEvent('saved-search-removed', {
        query,
        name: removedSearch.name,
      })
    }
  }

  const getSavedSearches = (): SavedSearch[] => {
    return [...savedSearches.value]
  }

  const emitSavedSearchEvent = (
    eventType: string,
    detail: { query: string; name: string }
  ) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventType, { detail }))
    }
  }

  loadSavedSearches()

  return {
    savedSearches: readonly(savedSearches),
    saveSearch,
    removeSavedSearch,
    getSavedSearches,
  }
}
