import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import { useResourceSearch } from './useResourceSearch'
import type { FilterOptions } from '~/types/resource'

// Composable for combining search and filter results
export const useResourceSearchFilter = (
  resources: readonly Resource[],
  filterOptions: { value: FilterOptions },
  searchQuery?: string
) => {
  // Use the search composable
  const { searchResources } = useResourceSearch(resources)

  // Compute filtered results based on filters
  const filteredResources = computed(() => {
    let result: Resource[] = [...resources]

    // Apply category filter
    if (
      filterOptions.value.categories &&
      filterOptions.value.categories.length > 0
    ) {
      result = result.filter(resource =>
        filterOptions.value.categories!.includes(resource.category)
      )
    }

    // Apply pricing model filter
    if (
      filterOptions.value.pricingModels &&
      filterOptions.value.pricingModels.length > 0
    ) {
      result = result.filter(resource =>
        filterOptions.value.pricingModels!.includes(resource.pricingModel)
      )
    }

    // Apply difficulty level filter
    if (
      filterOptions.value.difficultyLevels &&
      filterOptions.value.difficultyLevels.length > 0
    ) {
      result = result.filter(resource =>
        filterOptions.value.difficultyLevels!.includes(resource.difficulty)
      )
    }

    // Apply technology filter
    if (
      filterOptions.value.technologies &&
      filterOptions.value.technologies.length > 0
    ) {
      result = result.filter(resource =>
        resource.technology.some(tech =>
          filterOptions.value.technologies!.includes(tech)
        )
      )
    }

    // Apply tag filter
    if (filterOptions.value.tags && filterOptions.value.tags.length > 0) {
      result = result.filter(resource =>
        resource.tags.some(tag => filterOptions.value.tags!.includes(tag))
      )
    }

    return result
  })

  // Compute final results based on whether there's a search query
  const finalResources = computed(() => {
    // When there's a search query, filter the search results with additional filters
    if (searchQuery && searchQuery.trim() !== '') {
      const searchResults = searchResources(searchQuery)
      let result = [...searchResults]

      // Apply category filter
      if (
        filterOptions.value.categories &&
        filterOptions.value.categories.length > 0
      ) {
        result = result.filter(resource =>
          filterOptions.value.categories!.includes(resource.category)
        )
      }

      // Apply pricing model filter
      if (
        filterOptions.value.pricingModels &&
        filterOptions.value.pricingModels.length > 0
      ) {
        result = result.filter(resource =>
          filterOptions.value.pricingModels!.includes(resource.pricingModel)
        )
      }

      // Apply difficulty level filter
      if (
        filterOptions.value.difficultyLevels &&
        filterOptions.value.difficultyLevels.length > 0
      ) {
        result = result.filter(resource =>
          filterOptions.value.difficultyLevels!.includes(resource.difficulty)
        )
      }

      // Apply technology filter
      if (
        filterOptions.value.technologies &&
        filterOptions.value.technologies.length > 0
      ) {
        result = result.filter(resource =>
          resource.technology.some(tech =>
            filterOptions.value.technologies!.includes(tech)
          )
        )
      }

      // Apply tag filter
      if (filterOptions.value.tags && filterOptions.value.tags.length > 0) {
        result = result.filter(resource =>
          resource.tags.some(tag => filterOptions.value.tags!.includes(tag))
        )
      }

      return result
    } else {
      // Use the filtered resources when no search query
      return [...filteredResources.value]
    }
  })

  return {
    finalResources,
    filteredResources,
  }
}
