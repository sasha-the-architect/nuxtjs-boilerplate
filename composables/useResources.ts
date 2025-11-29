import { computed, readonly } from 'vue'
import { useResourceData } from './useResourceData'
import { useResourceFilters } from './useResourceFilters'
import { useResourceSearch } from './useResourceSearch'
import { useResourceSort } from './useResourceSort'
import { useSearchHistory } from './useSearchHistory'
import { useResourceSearchAndFilter } from './useResourceSearchAndFilter'
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

  // Use the search and filter composable to combine search and filtering logic
  const { searchAndFilterResources } = useResourceSearchAndFilter(
    resources.value,
    computed(() => filterOptions.value.searchQuery),
    searchResources,
    computed(() => filterOptions.value)
  )

  // Use the sort composable with the search and filter results
  const { sortedResources } = useResourceSort(
    searchAndFilterResources,
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
