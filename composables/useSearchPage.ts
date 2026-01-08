import { computed, ref, readonly } from 'vue'
import type { SortOption } from '~/types/resource'
import { useResourceData } from './useResourceData'
import { useAdvancedResourceSearch } from './useAdvancedResourceSearch'
import { useFilterUtils } from './useFilterUtils'
import { trackSearch, trackFilter } from '~/utils/analytics'

// Extended filter options for search page
export interface SearchPageFilterOptions {
  searchQuery?: string
  categories?: string[]
  pricingModels?: string[]
  difficultyLevels?: string[]
  technologies?: string[]
  tags?: string[]
  benefits?: string[]
  dateRange?: string
}

type SearchPageSortOption = SortOption | 'relevance'

// Orchestrator composable for search page combining filtering, search, and analytics
export const useSearchPage = () => {
  const {
    resources,
    loading,
    error,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
  } = useResourceData()

  const allTags = computed(() => {
    const tagsSet = new Set<string>()
    resources.value.forEach(resource => {
      resource.tags?.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  })

  const allBenefits = computed(() => {
    const benefitsSet = new Set<string>()
    resources.value.forEach(resource => {
      resource.benefits?.forEach(benefit => benefitsSet.add(benefit))
    })
    return Array.from(benefitsSet).sort()
  })
  const { parseDate } = useFilterUtils()

  const filterOptions = ref<SearchPageFilterOptions>({
    searchQuery: '',
    categories: [],
    pricingModels: [],
    difficultyLevels: [],
    technologies: [],
    tags: [],
    benefits: [],
    dateRange: 'anytime',
  })

  const sortOption = ref<SearchPageSortOption>('relevance')

  const advancedSearch = useAdvancedResourceSearch(resources.value)

  const filteredResources = computed(() => {
    if (!resources.value.length) {
      return []
    }

    let result = [...resources.value]

    if (filterOptions.value.searchQuery) {
      result = advancedSearch.advancedSearchResources(
        filterOptions.value.searchQuery
      )
    }

    result = result.filter(resource => {
      const matchesCategory =
        !filterOptions.value.categories ||
        filterOptions.value.categories.length === 0 ||
        filterOptions.value.categories.includes(resource.category)

      const matchesPricing =
        !filterOptions.value.pricingModels ||
        filterOptions.value.pricingModels.length === 0 ||
        filterOptions.value.pricingModels.includes(resource.pricingModel)

      const matchesDifficulty =
        !filterOptions.value.difficultyLevels ||
        filterOptions.value.difficultyLevels.length === 0 ||
        filterOptions.value.difficultyLevels.includes(resource.difficulty)

      const matchesTechnology =
        !filterOptions.value.technologies ||
        filterOptions.value.technologies.length === 0 ||
        resource.technology?.some((tech: string) =>
          filterOptions.value.technologies?.includes(tech)
        )

      const matchesTag =
        !filterOptions.value.tags ||
        filterOptions.value.tags.length === 0 ||
        resource.tags?.some(tag => filterOptions.value.tags?.includes(tag))

      const matchesBenefit =
        !filterOptions.value.benefits ||
        filterOptions.value.benefits.length === 0 ||
        resource.benefits?.some(benefit =>
          filterOptions.value.benefits?.includes(benefit)
        )

      const now = new Date()
      let matchesDateRange = true
      if (
        filterOptions.value.dateRange &&
        filterOptions.value.dateRange !== 'anytime'
      ) {
        const resourceDate = new Date(resource.dateAdded || now)
        const timeDiff = now.getTime() - resourceDate.getTime()
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

        switch (filterOptions.value.dateRange) {
          case 'lastWeek':
            matchesDateRange = daysDiff <= 7
            break
          case 'lastMonth':
            matchesDateRange = daysDiff <= 30
            break
          case 'lastYear':
            matchesDateRange = daysDiff <= 365
            break
          default:
            matchesDateRange = true
        }
      }

      return (
        matchesCategory &&
        matchesPricing &&
        matchesDifficulty &&
        matchesTechnology &&
        matchesTag &&
        matchesBenefit &&
        matchesDateRange
      )
    })

    if (sortOption.value !== 'relevance') {
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
    }

    return result
  })

  const facetCounts = computed(() => {
    const searchQuery = filterOptions.value.searchQuery || ''

    const categoryCounts = advancedSearch.calculateFacetCounts(
      searchQuery,
      'category'
    )
    const pricingCounts = advancedSearch.calculateFacetCounts(
      searchQuery,
      'pricingModel'
    )
    const difficultyCounts = advancedSearch.calculateFacetCounts(
      searchQuery,
      'difficultyLevel'
    )
    const technologyCounts = advancedSearch.calculateFacetCounts(
      searchQuery,
      'technologies'
    )
    const tagCounts = advancedSearch.calculateFacetCounts(searchQuery, 'tags')
    const benefitCounts = advancedSearch.calculateFacetCounts(
      searchQuery,
      'benefits'
    )

    const allCounts: Record<string, number> = {}

    Object.entries(categoryCounts).forEach(([key, value]) => {
      allCounts[`category_${key}`] = value
    })

    Object.entries(pricingCounts).forEach(([key, value]) => {
      allCounts[`pricing_${key}`] = value
    })

    Object.entries(difficultyCounts).forEach(([key, value]) => {
      allCounts[`difficulty_${key}`] = value
    })

    Object.entries(technologyCounts).forEach(([key, value]) => {
      allCounts[`technology_${key}`] = value
    })

    Object.entries(tagCounts).forEach(([key, value]) => {
      allCounts[`tag_${key}`] = value
    })

    Object.entries(benefitCounts).forEach(([key, value]) => {
      allCounts[`benefits_${key}`] = value
    })

    return allCounts
  })

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
    trackFilter('category', category)
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
    trackFilter('pricing', pricingModel)
  }

  const toggleDifficultyLevel = (difficultyLevel: string) => {
    const current = [...(filterOptions.value.difficultyLevels || [])]
    const index = current.indexOf(difficultyLevel)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(difficultyLevel)
    }
    filterOptions.value.difficultyLevels = current
    trackFilter('difficulty', difficultyLevel)
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
    trackFilter('technology', technology)
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
    trackFilter('tag', tag)
  }

  const toggleBenefit = (benefit: string) => {
    const current = [...(filterOptions.value.benefits || [])]
    const index = current.indexOf(benefit)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(benefit)
    }
    filterOptions.value.benefits = current
    trackFilter('benefit', benefit)
  }

  const setDateRange = (dateRange: string) => {
    filterOptions.value.dateRange = dateRange
    trackFilter('dateRange', dateRange)
  }

  const setSortOption = (option: SearchPageSortOption) => {
    sortOption.value = option
  }

  const resetFilters = () => {
    filterOptions.value = {
      searchQuery: '',
      categories: [],
      pricingModels: [],
      difficultyLevels: [],
      technologies: [],
      tags: [],
      benefits: [],
      dateRange: 'anytime',
    }
    sortOption.value = 'relevance'
  }

  const handleSearch = (query: string) => {
    updateSearchQuery(query)

    setTimeout(() => {
      trackSearch(query, filteredResources.value.length)
    }, 500)
  }

  return {
    filterOptions: readonly(filterOptions),
    sortOption: readonly(sortOption),
    filteredResources,
    facetCounts,
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    toggleTag,
    toggleBenefit,
    setDateRange,
    setSortOption,
    resetFilters,
    handleSearch,
    savedSearches: advancedSearch.savedSearches,
    saveSearch: advancedSearch.saveSearch,
    removeSavedSearch: advancedSearch.removeSavedSearch,
    getPopularSearches: advancedSearch.getPopularSearches,
    getZeroResultSearches: advancedSearch.getZeroResultSearches,
    getRelatedSearches: advancedSearch.getRelatedSearches,
    createSearchSnippet: advancedSearch.createSearchSnippet,
    highlightSearchTerms: advancedSearch.highlightSearchTerms,
    loading,
    error,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    tags: allTags,
    benefits: allBenefits,
  }
}
