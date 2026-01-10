import { computed, ref, readonly } from 'vue'
import type { SortOption } from '~/types/resource'
import { useResourceData } from './useResourceData'
import { useAdvancedResourceSearch } from './useAdvancedResourceSearch'
import { useFilterUtils } from './useFilterUtils'
import { useResourceSort } from './useResourceSort'
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
  const { filterByAllCriteriaWithDateRange, toggleArrayItem } = useFilterUtils()

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

  const { sortResources } = useResourceSort(
    computed(() => resources.value),
    sortOption
  )

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

    result = result.filter(
      resource =>
        filterByAllCriteriaWithDateRange([resource], {
          ...filterOptions.value,
          benefits: filterOptions.value.benefits,
          dateRange: filterOptions.value.dateRange,
        }).length > 0
    )

    return sortResources(result, sortOption.value)
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
    filterOptions.value.categories = toggleArrayItem(
      filterOptions.value.categories || [],
      category
    )
    trackFilter('category', category)
  }

  const togglePricingModel = (pricingModel: string) => {
    filterOptions.value.pricingModels = toggleArrayItem(
      filterOptions.value.pricingModels || [],
      pricingModel
    )
    trackFilter('pricing', pricingModel)
  }

  const toggleDifficultyLevel = (difficultyLevel: string) => {
    filterOptions.value.difficultyLevels = toggleArrayItem(
      filterOptions.value.difficultyLevels || [],
      difficultyLevel
    )
    trackFilter('difficulty', difficultyLevel)
  }

  const toggleTechnology = (technology: string) => {
    filterOptions.value.technologies = toggleArrayItem(
      filterOptions.value.technologies || [],
      technology
    )
    trackFilter('technology', technology)
  }

  const toggleTag = (tag: string) => {
    filterOptions.value.tags = toggleArrayItem(
      filterOptions.value.tags || [],
      tag
    )
    trackFilter('tag', tag)
  }

  const toggleBenefit = (benefit: string) => {
    filterOptions.value.benefits = toggleArrayItem(
      filterOptions.value.benefits || [],
      benefit
    )
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
