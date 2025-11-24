import { ref, computed, readonly } from 'vue'
import type { Resource, FilterOptions, SortOption } from '~/types/resource'
import { useResourceData } from './useResourceData'
import { useResourceFilters } from './useResourceFilters'
import { useResourceSearch } from './useResourceSearch'

// Re-export types for backward compatibility
export type { Resource, FilterOptions, SortOption }

// Main composable for managing resources
export const useResources = () => {
  // Use the resource data composable
  const { resources, loading, error, retryCount, maxRetries, retryResources } =
    useResourceData()

  // Use the resource filters composable
  const {
    filterOptions,
    sortOption,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    setSortOption,
    resetFilters,
  } = useResourceFilters(resources.value)

  // Use the resource search composable
  const {
    filteredResources,
    highlightSearchTerms,
    getSuggestions,
    getSearchHistory,
    addSearchToHistory,
    clearSearchHistory,
  } = useResourceSearch(resources.value, filterOptions, sortOption)

  return {
    resources: readonly(resources),
    filteredResources,
    loading: readonly(loading),
    error: readonly(error),
    retryCount: readonly(retryCount),
    maxRetries,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    filterOptions: readonly(filterOptions),
    sortOption: readonly(sortOption),
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
