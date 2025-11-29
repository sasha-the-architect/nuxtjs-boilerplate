import { computed, type ComputedRef } from 'vue'
import type { Resource, FilterOptions } from '~/types/resource'

export const useResourceSearchAndFilter = (
  resources: readonly Resource[],
  searchQuery: ComputedRef<string>,
  searchResources: (query: string) => Resource[],
  filterOptions: ComputedRef<FilterOptions>
) => {
  // Combined search and filtering logic
  const searchAndFilterResources = computed(() => {
    if (searchQuery.value && searchQuery.value.trim() !== '') {
      // When searching, use search results and apply filters on top
      const searchResults = searchResources(searchQuery.value)
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
      // When not searching, apply only filters
      let result = [...resources]

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
    }
  })

  return {
    searchAndFilterResources,
  }
}
