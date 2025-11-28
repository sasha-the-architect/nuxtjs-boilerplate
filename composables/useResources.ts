import { computed, readonly } from 'vue'
import { useResourceData } from './useResourceData'
import { useResourceFilters } from './useResourceFilters'
import { useResourceSearch } from './useResourceSearch'
import { useResourceSort } from './useResourceSort'
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
    lastError,
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
    toggleTag,
    setSortOption,
    resetFilters,
  } = useResourceFilters(resources.value)

  // Extract all unique tags from resources
  const allTags = computed(() => {
    const tagsSet = new Set<string>()
    resources.value.forEach(resource => {
      resource.tags.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  })

  // Use the search composable
  const { fuse, searchResources, getSuggestions, highlightSearchTerms } =
    useResourceSearch(resources.value)

  // Use the sort composable
  const { sortedResources } = useResourceSort(
    computed(() => {
      // When there's a search query, filter the search results
      if (
        filterOptions.value.searchQuery &&
        filterOptions.value.searchQuery.trim() !== ''
      ) {
        const searchResults = searchResources(filterOptions.value.searchQuery)
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
        // Use the filtered resources from the filters composable when no search query
        return [...filteredResources.value]
      }
    }),
    computed(() => sortOption.value)
  )

  // Use the search history composable
  const { getSearchHistory, addSearchToHistory, clearSearchHistory } =
    useSearchHistory()

  // Combined filtered and sorted resources
  const combinedFilteredResources = sortedResources

  return {
    resources,
    filteredResources: combinedFilteredResources,
    loading,
    error,
    retryCount,
    maxRetries,
    lastError,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    allTags,
    filterOptions,
    sortOption,
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    toggleTag,
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
