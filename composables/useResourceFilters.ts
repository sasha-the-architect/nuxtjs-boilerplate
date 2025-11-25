import { ref, computed, readonly } from 'vue'
import type { Resource, FilterOptions, SortOption } from '~/types/resource'

// Composable for managing resource filters
export const useResourceFilters = (resources: readonly Resource[]) => {
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
  })

  // Methods to update filters
  const updateSearchQuery = (query: string) => {
    filterOptions.value.searchQuery = query
  }

  const toggleCategory = (category: string) => {
    if (!filterOptions.value.categories) filterOptions.value.categories = []
    const index = filterOptions.value.categories.indexOf(category)
    if (index > -1) {
      filterOptions.value.categories.splice(index, 1)
    } else {
      filterOptions.value.categories.push(category)
    }
  }

  const togglePricingModel = (pricingModel: string) => {
    if (!filterOptions.value.pricingModels)
      filterOptions.value.pricingModels = []
    const index = filterOptions.value.pricingModels.indexOf(pricingModel)
    if (index > -1) {
      filterOptions.value.pricingModels.splice(index, 1)
    } else {
      filterOptions.value.pricingModels.push(pricingModel)
    }
  }

  const toggleDifficultyLevel = (difficulty: string) => {
    if (!filterOptions.value.difficultyLevels)
      filterOptions.value.difficultyLevels = []
    const index = filterOptions.value.difficultyLevels.indexOf(difficulty)
    if (index > -1) {
      filterOptions.value.difficultyLevels.splice(index, 1)
    } else {
      filterOptions.value.difficultyLevels.push(difficulty)
    }
  }

  const toggleTechnology = (technology: string) => {
    if (!filterOptions.value.technologies) filterOptions.value.technologies = []
    const index = filterOptions.value.technologies.indexOf(technology)
    if (index > -1) {
      filterOptions.value.technologies.splice(index, 1)
    } else {
      filterOptions.value.technologies.push(technology)
    }
  }

  const toggleTag = (tag: string) => {
    if (!filterOptions.value.tags) filterOptions.value.tags = []
    const index = filterOptions.value.tags.indexOf(tag)
    if (index > -1) {
      filterOptions.value.tags.splice(index, 1)
    } else {
      filterOptions.value.tags.push(tag)
    }
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
