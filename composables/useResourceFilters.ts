import { ref, computed, readonly } from 'vue'
import type { Resource, FilterOptions, SortOption } from '~/types/resource'
import { useFilterUtils } from './useFilterUtils'

// Composable for managing resource filters
export const useResourceFilters = (resources: readonly Resource[]) => {
  const { filterByAllCriteria, parseDate } = useFilterUtils()

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
    const current = [...(filterOptions.value.categories || [])]
    const index = current.indexOf(category)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(category)
    }
    filterOptions.value.categories = current
  }

  const togglePricingModel = (pricingModel: string) => {
    const current = [...(filterOptions.value.pricingModels || [])]
    const index = current.indexOf(pricingModel)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(pricingModel)
    }
    filterOptions.value.pricingModels = current
  }

  const toggleDifficultyLevel = (difficulty: string) => {
    const current = [...(filterOptions.value.difficultyLevels || [])]
    const index = current.indexOf(difficulty)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(difficulty)
    }
    filterOptions.value.difficultyLevels = current
  }

  const toggleTechnology = (technology: string) => {
    const current = [...(filterOptions.value.technologies || [])]
    const index = current.indexOf(technology)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(technology)
    }
    filterOptions.value.technologies = current
  }

  const toggleTag = (tag: string) => {
    const current = [...(filterOptions.value.tags || [])]
    const index = current.indexOf(tag)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(tag)
    }
    filterOptions.value.tags = current
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
