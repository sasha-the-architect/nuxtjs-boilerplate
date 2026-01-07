import { readonly, computed } from 'vue'
import Fuse from 'fuse.js'
import type { Resource } from '~/types/resource'
import { sanitizeAndHighlight } from '~/utils/sanitize'

const fuseCache = new WeakMap<readonly Resource[], Fuse<Resource>>()

const createFuseInstance = (resources: readonly Resource[]): Fuse<Resource> => {
  return new Fuse([...resources], {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'benefits', weight: 0.2 },
      { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
  })
}

const getCachedFuse = (resources: readonly Resource[]): Fuse<Resource> => {
  if (!fuseCache.has(resources)) {
    fuseCache.set(resources, createFuseInstance(resources))
  }
  return fuseCache.get(resources)!
}

export const useResourceSearch = (resources: readonly Resource[]) => {
  const fuse = computed(() => getCachedFuse(resources))

  const searchResources = (query: string): Resource[] => {
    if (!query) return [...resources]

    const fuseInstance = getCachedFuse(resources)
    const searchResults = fuseInstance.search(query)
    return searchResults.map(item => item.item)
  }

  const getSuggestions = (query: string, limit: number = 5): Resource[] => {
    if (!query) return []

    const fuseInstance = getCachedFuse(resources)
    const searchResults = fuseInstance.search(query, { limit })
    return searchResults.map(item => item.item)
  }

  const highlightSearchTerms = (text: string, searchQuery: string): string => {
    if (!searchQuery || !text) return text || ''
    return sanitizeAndHighlight(text, searchQuery)
  }

  return {
    fuse: readonly(fuse),
    searchResources,
    getSuggestions,
    highlightSearchTerms,
  }
}
