import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import { useResourceSearch } from './useResourceSearch'
import type { FilterOptions } from '~/types/resource'
import { useFilterUtils } from './useFilterUtils'

// Composable for combining search and filter results
export const useResourceSearchFilter = (
  resources: readonly Resource[],
  filterOptions: { value: FilterOptions },
  searchQuery?: string
) => {
  const { searchResources } = useResourceSearch(resources)
  const { filterByAllCriteria } = useFilterUtils()

  const finalResources = computed(() => {
    if (searchQuery && searchQuery.trim() !== '') {
      const searchResults = searchResources(searchQuery)
      return filterByAllCriteria(searchResults, filterOptions.value)
    }

    return filterByAllCriteria([...resources], filterOptions.value)
  })

  return {
    finalResources,
  }
}
