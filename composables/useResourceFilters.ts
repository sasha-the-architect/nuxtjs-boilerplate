import { ref, computed, readonly } from 'vue'
import type { Resource, FilterOptions, SortOption } from '~/types/resource'
import { useFilterUtils } from './useFilterUtils'

// Composable for managing resource filters
export const useResourceFilters = (resources: readonly Resource[]) => {
  const { filterByAllCriteria, parseDate, toggleArrayItem } = useFilterUtils()

  // Filter options
  const filterOptions = ref<FilterOptions>({
    searchQuery: '',
    categories: [],
    pricingModels: [],
    difficultyLevels: [],
    technologies: [],
    tags: [],
  })

  // Sort option
  const sortOption = ref<SortOption>('popularity-desc')

  // Computed filtered and sorted resources
  const filteredResources = computed(() => {
    if (!resources.length) {
      return []
    }

    const result = filterByAllCriteria([...resources], filterOptions.value)

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

  // Methods to update filters
  const updateSearchQuery = (query: string) => {
    filterOptions.value.searchQuery = query
  }

  const toggleCategory = (category: string) => {
    filterOptions.value.categories = toggleArrayItem(
      filterOptions.value.categories || [],
      category
    )
  }

  const togglePricingModel = (pricingModel: string) => {
    filterOptions.value.pricingModels = toggleArrayItem(
      filterOptions.value.pricingModels || [],
      pricingModel
    )
  }

  const toggleDifficultyLevel = (difficulty: string) => {
    filterOptions.value.difficultyLevels = toggleArrayItem(
      filterOptions.value.difficultyLevels || [],
      difficulty
    )
  }

  const toggleTechnology = (technology: string) => {
    filterOptions.value.technologies = toggleArrayItem(
      filterOptions.value.technologies || [],
      technology
    )
  }

  const toggleTag = (tag: string) => {
    filterOptions.value.tags = toggleArrayItem(
      filterOptions.value.tags || [],
      tag
    )
  }

  const setSortOption = (option: SortOption) => {
    sortOption.value = option
  }

  // Reset all filters
  const resetFilters = () => {
    filterOptions.value = {
      searchQuery: '',
      categories: [],
      pricingModels: [],
      difficultyLevels: [],
      technologies: [],
      tags: [],
    }
    sortOption.value = 'popularity-desc'
  }

  return {
    filterOptions: readonly(filterOptions),
    sortOption: readonly(sortOption),
    filteredResources,
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    toggleTag,
    setSortOption,
    resetFilters,
  }
}
