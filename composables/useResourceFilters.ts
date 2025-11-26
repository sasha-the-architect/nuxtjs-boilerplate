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

  // Advanced filter options
  const advancedFilterOptions = ref({
    popularityMin: null as number | null,
    popularityMax: null as number | null,
    dateRange: null as number | null,
    openSource: null as boolean | null,
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
        resource.technology.some((tech: string) =>
          filterOptions.value.technologies!.includes(tech)
        )
      )
    }

    // Apply advanced filters
    // Popularity range filter
    if (advancedFilterOptions.value.popularityMin !== null) {
      result = result.filter(
        resource =>
          resource.popularity >= advancedFilterOptions.value.popularityMin!
      )
    }

    if (advancedFilterOptions.value.popularityMax !== null) {
      result = result.filter(
        resource =>
          resource.popularity <= advancedFilterOptions.value.popularityMax!
      )
    }

    // Date range filter
    if (advancedFilterOptions.value.dateRange !== null) {
      const cutoffDate = new Date()
      cutoffDate.setDate(
        cutoffDate.getDate() - advancedFilterOptions.value.dateRange
      )

      result = result.filter(resource => {
        const resourceDate = new Date(resource.dateAdded)
        return resourceDate >= cutoffDate
      })
    }

    // Open source filter
    if (advancedFilterOptions.value.openSource !== null) {
      result = result.filter(resource => {
        const description = resource.description.toLowerCase()
        const title = resource.title.toLowerCase()
        const tags = resource.tags.map((t: string) => t.toLowerCase())

        if (advancedFilterOptions.value.openSource) {
          return (
            description.includes('open source') ||
            title.includes('open source') ||
            tags.some(
              (t: string) =>
                t.includes('open-source') || t.includes('open_source')
            )
          )
        } else {
          return !(
            description.includes('open source') ||
            title.includes('open source') ||
            tags.some(
              (t: string) =>
                t.includes('open-source') || t.includes('open_source')
            )
          )
        }
      })
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

  // Update advanced filter options
  const updatePopularityRange = (min: number | null, max: number | null) => {
    advancedFilterOptions.value.popularityMin = min
    advancedFilterOptions.value.popularityMax = max
  }

  const updateDateRange = (days: number | null) => {
    advancedFilterOptions.value.dateRange = days
  }

  const updateOpenSourceFilter = (isOpenSource: boolean | null) => {
    advancedFilterOptions.value.openSource = isOpenSource
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
    advancedFilterOptions.value = {
      popularityMin: null,
      popularityMax: null,
      dateRange: null,
      openSource: null,
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
    setSortOption,
    resetFilters,
    // Advanced filter methods
    updatePopularityRange,
    updateDateRange,
    updateOpenSourceFilter,
  }
}
