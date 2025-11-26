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
  })

  // Sort option
  const sortOption = ref<SortOption>('popularity-desc')

  // Calculate dynamic filter counts for each filter type
  const filterCounts = computed(() => {
    const baseResources = [...resources]
    const counts: {
      categories: { [key: string]: number }
      pricingModels: { [key: string]: number }
      difficultyLevels: { [key: string]: number }
      technologies: { [key: string]: number }
    } = {
      categories: {},
      pricingModels: {},
      difficultyLevels: {},
      technologies: {},
    }

    // Count available resources for each category
    baseResources.forEach(resource => {
      if (!counts.categories[resource.category]) {
        counts.categories[resource.category] = 0
      }
      counts.categories[resource.category]++
    })

    // Count available resources for each pricing model
    baseResources.forEach(resource => {
      if (!counts.pricingModels[resource.pricingModel]) {
        counts.pricingModels[resource.pricingModel] = 0
      }
      counts.pricingModels[resource.pricingModel]++
    })

    // Count available resources for each difficulty level
    baseResources.forEach(resource => {
      if (!counts.difficultyLevels[resource.difficulty]) {
        counts.difficultyLevels[resource.difficulty] = 0
      }
      counts.difficultyLevels[resource.difficulty]++
    })

    // Count available resources for each technology
    baseResources.forEach(resource => {
      resource.technology.forEach(tech => {
        if (!counts.technologies[tech]) {
          counts.technologies[tech] = 0
        }
        counts.technologies[tech]++
      })
    })

    // Now apply current filters to get updated counts
    let currentResources = [...baseResources]

    // Apply current category filter if any
    if (
      filterOptions.value.categories &&
      filterOptions.value.categories.length > 0
    ) {
      currentResources = currentResources.filter(resource =>
        filterOptions.value.categories!.includes(resource.category)
      )
    }

    // Apply current pricing model filter if any
    if (
      filterOptions.value.pricingModels &&
      filterOptions.value.pricingModels.length > 0
    ) {
      currentResources = currentResources.filter(resource =>
        filterOptions.value.pricingModels!.includes(resource.pricingModel)
      )
    }

    // Apply current difficulty level filter if any
    if (
      filterOptions.value.difficultyLevels &&
      filterOptions.value.difficultyLevels.length > 0
    ) {
      currentResources = currentResources.filter(resource =>
        filterOptions.value.difficultyLevels!.includes(resource.difficulty)
      )
    }

    // Apply current technology filter if any
    if (
      filterOptions.value.technologies &&
      filterOptions.value.technologies.length > 0
    ) {
      currentResources = currentResources.filter(resource =>
        resource.technology.some(tech =>
          filterOptions.value.technologies!.includes(tech)
        )
      )
    }

    // Recalculate counts based on current filtered resources
    const filteredCounts: {
      categories: { [key: string]: number }
      pricingModels: { [key: string]: number }
      difficultyLevels: { [key: string]: number }
      technologies: { [key: string]: number }
    } = {
      categories: {},
      pricingModels: {},
      difficultyLevels: {},
      technologies: {},
    }

    currentResources.forEach(resource => {
      // Update category counts
      if (!filteredCounts.categories[resource.category]) {
        filteredCounts.categories[resource.category] = 0
      }
      filteredCounts.categories[resource.category]++

      // Update pricing model counts
      if (!filteredCounts.pricingModels[resource.pricingModel]) {
        filteredCounts.pricingModels[resource.pricingModel] = 0
      }
      filteredCounts.pricingModels[resource.pricingModel]++

      // Update difficulty level counts
      if (!filteredCounts.difficultyLevels[resource.difficulty]) {
        filteredCounts.difficultyLevels[resource.difficulty] = 0
      }
      filteredCounts.difficultyLevels[resource.difficulty]++

      // Update technology counts
      resource.technology.forEach(tech => {
        if (!filteredCounts.technologies[tech]) {
          filteredCounts.technologies[tech] = 0
        }
        filteredCounts.technologies[tech]++
      })
    })

    return filteredCounts
  })

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
    filterOptions: readonly(filterOptions),
    sortOption: readonly(sortOption),
    filteredResources,
    filterCounts,
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    setSortOption,
    resetFilters,
  }
}
