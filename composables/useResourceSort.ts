import { computed, type ComputedRef } from 'vue'
import type { Resource, SortOption } from '~/types/resource'
import { parseDate } from '~/utils/filter-utils'

type ExtendedSortOption = SortOption | 'relevance'

// Composable for handling resource sorting
export const useResourceSort = (
  resources: ComputedRef<Resource[]>,
  sortOption: ComputedRef<ExtendedSortOption>
) => {
  const sortResources = (
    resourcesToSort: Resource[],
    currentSortOption: ExtendedSortOption
  ): Resource[] => {
    const result = [...resourcesToSort]

    if (currentSortOption === 'relevance') {
      return result
    }

    result.sort((a, b) => {
      switch (currentSortOption) {
        case 'alphabetical-asc':
          return a.title.localeCompare(b.title)
        case 'alphabetical-desc':
          return b.title.localeCompare(a.title)
        case 'popularity-desc':
          return (b.popularity || 0) - (a.popularity || 0)
        case 'date-added-desc':
          return parseDate(b.dateAdded) - parseDate(a.dateAdded)
        default:
          return 0
      }
    })

    return result
  }

  const sortedResources = computed(() => {
    if (!resources.value || !resources.value.length) {
      return []
    }
    return sortResources(resources.value, sortOption.value)
  })

  return {
    sortedResources,
    sortResources,
  }
}
