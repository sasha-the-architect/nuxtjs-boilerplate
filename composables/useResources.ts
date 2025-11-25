import { computed, readonly } from 'vue'
import { useResourceData } from './useResourceData'
import { useResourceFilters } from './useResourceFilters'
import { useResourceSearch } from './useResourceSearch'
import { useSearchHistory } from './useSearchHistory'
import type { Resource, SortOption, FilterOptions } from '~/types/resource'

// Re-export types for convenience
export type { Resource, SortOption, FilterOptions }

// Main composable that combines all resource functionality
export const useResources = () => {
  // Use the data composable for resource loading
  const {
    resources,
    loading,
    error,
    retryCount,
    maxRetries,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    retryResources,
  } = useResourceData()

  // Use the filters composable
  const {
    filterOptions,
    sortOption,
    filteredResources,
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    setSortOption,
    resetFilters,
  } = useResourceFilters(resources.value)

  // Use the search composable
  const { fuse, searchResources, getSuggestions, highlightSearchTerms } =
    useResourceSearch(resources.value)

  // Use the search history composable
  const { getSearchHistory, addSearchToHistory, clearSearchHistory } =
    useSearchHistory()

  // Combine search with filtering - when there's a search query, filter the search results
  const combinedFilteredResources = computed(() => {
    if (
      filterOptions.value.searchQuery &&
      filterOptions.value.searchQuery.trim() !== ''
    ) {
      // First search the resources
      const searchResults = searchResources(filterOptions.value.searchQuery)
      // Then apply filters to the search results
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

      // Apply sorting
      result.sort((a, b) => {
        switch (sortOption.value) {
          case 'alphabetical-asc':
            return a.title.localeCompare(b.title)
          case 'alphabetical-desc':
            return b.title.localeCompare(a.title)
          case 'popularity-desc':
            return b.popularity - a.popularity
          case 'date-added-desc':
            return (
              new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
            )
          default:
            return 0
        }
      })

      return result
    } else {
      // Use the filtered resources from the filters composable when no search query
      return [...filteredResources.value] // Convert to mutable array
    }
  })

  return {
    resources,
    filteredResources: combinedFilteredResources,
    loading,
    error,
    retryCount,
    maxRetries,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    filterOptions,
    sortOption,
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    setSortOption,
    resetFilters,
    highlightSearchTerms,
    retryResources,
    getSuggestions,
    getSearchHistory,
    addSearchToHistory,
    clearSearchHistory,
  }
}
