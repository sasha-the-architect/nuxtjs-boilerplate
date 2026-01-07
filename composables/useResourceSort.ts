import { computed, type ComputedRef } from 'vue'
import type { Resource, SortOption } from '~/types/resource'
import { useFilterUtils } from './useFilterUtils'

// Composable for handling resource sorting
export const useResourceSort = (
  resources: ComputedRef<Resource[]>,
  sortOption: ComputedRef<SortOption>
) => {
  const { parseDate } = useFilterUtils()

  const sortedResources = computed(() => {
    if (!resources.value || !resources.value.length) {
      return []
    }

    const result = [...resources.value]

    result.sort((a, b) => {
      switch (sortOption.value) {
        case 'alphabetical-asc':
          return a.title.localeCompare(b.title)
        case 'alphabetical-desc':
          return b.title.localeCompare(a.title)
        case 'popularity-desc':
          return b.popularity - a.popularity
        case 'date-added-desc':
          return parseDate(b.dateAdded) - parseDate(a.dateAdded)
        default:
          return 0
      }
    })

    return result
  })

  return {
    sortedResources,
  }
}
