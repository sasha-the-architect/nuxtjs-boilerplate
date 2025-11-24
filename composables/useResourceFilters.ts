import { computed, ref } from 'vue'
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
  })

  // Sort option
  const sortOption = ref<SortOption>('popularity-desc')

  // Get unique categories
  const categories = computed(() => {
    return [...new Set(resources.map(r => r.category))]
  })

  // Get unique pricing models
  const pricingModels = computed(() => {
    return [...new Set(resources.map(r => r.pricingModel))]
  })

  // Get unique difficulty levels
  const difficultyLevels = computed(() => {
    return [...new Set(resources.map(r => r.difficulty))]
  })

  // Get unique technologies
  const technologies = computed(() => {
    const allTechnologies = resources.flatMap(r => r.technology)
    return [...new Set(allTechnologies)]
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
    }
    sortOption.value = 'popularity-desc'
  }

  return {
    filterOptions: ref(filterOptions.value),
    sortOption: ref(sortOption.value),
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
  }
}
