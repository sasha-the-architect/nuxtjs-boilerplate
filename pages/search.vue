<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Search Resources
        </h1>
        <p class="mt-4 text-xl text-gray-500">
          Find the perfect free resources for your projects
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mb-8">
        <SearchBar v-model="searchQuery" @search="handleSearch" />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"
        ></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600 text-lg">Error loading resources: {{ error }}</p>
      </div>

      <!-- No Results State -->
      <div
        v-else-if="!filteredResources.length && !loading"
        class="text-center py-12"
      >
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          No resources found
        </h3>
        <p class="text-gray-500 mb-6">
          Try adjusting your search or filter criteria
        </p>
        <RelatedSearches
          :query="searchQuery"
          class="mb-6"
          @search-select="handleRelatedSearch"
        />
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
          @click="resetAllFilters"
        >
          Reset Filters
        </button>
      </div>

      <!-- Results with Filters -->
      <div v-else class="flex flex-col lg:flex-row gap-8">
        <!-- ARIA live region for search results -->
        <div
          id="search-results-status"
          role="status"
          aria-live="polite"
          class="sr-only"
        >
          {{ filteredResources.length }} resources found for your search
        </div>

        <!-- Filters Sidebar -->
        <div class="lg:w-1/4">
          <ResourceFilters
            :categories="categories"
            :pricing-models="pricingModels"
            :difficulty-levels="difficultyLevels"
            :technologies="technologies"
            :tags="tags"
            :benefits="benefits"
            :selected-categories="selectedCategories"
            :selected-pricing-models="selectedPricingModels"
            :selected-difficulty-levels="selectedDifficultyLevels"
            :selected-technologies="selectedTechnologies"
            :selected-tags="selectedTags"
            :selected-benefits="selectedBenefits"
            :selected-date-range="selectedDateRange"
            :search-query="searchQuery"
            :facet-counts="facetCounts"
            :saved-searches="savedSearches"
            role="region"
            aria-label="Resource filters"
            @toggle-category="enhancedToggleCategory"
            @toggle-pricing-model="enhancedTogglePricingModel"
            @toggle-difficulty-level="enhancedToggleDifficultyLevel"
            @toggle-technology="enhancedToggleTechnology"
            @toggle-tag="enhancedToggleTag"
            @toggle-benefit="enhancedToggleBenefit"
            @date-range-change="onDateRangeChange"
            @reset-filters="resetAllFilters"
            @use-saved-search="onUseSavedSearch"
            @remove-saved-search="onRemoveSavedSearch"
          />

          <!-- Show popular searches when there's no active search -->
          <PopularSearches
            v-if="!searchQuery"
            class="mt-6"
            @search-select="handlePopularSearch"
          />

          <!-- Show zero-result searches when there are no results -->
          <ZeroResultSearches
            v-if="searchQuery && !filteredResources.length && !loading"
            class="mt-6"
            @search-select="handlePopularSearch"
          />
        </div>

        <!-- Results Section -->
        <div class="lg:w-3/4">
          <ResourceSort
            :selected-sort-option="sortOption"
            :total-resources="filteredResources.length"
            @update-sort-option="setSortOption"
          />

          <div class="mt-6 grid grid-cols-1 gap-6">
            <ResourceCard
              v-for="resource in filteredResources"
              :id="resource.id"
              :key="resource.id"
              :title="resource.title"
              :description="resource.description"
              :benefits="resource.benefits"
              :url="resource.url"
              :button-label="getButtonLabel(resource.category)"
              :highlighted-title="
                highlightSearchTerms(resource.title, searchQuery)
              "
              :highlighted-description="
                createSearchSnippet(resource.description, searchQuery)
              "
              :search-query="searchQuery"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResources, type SortOption } from '~/composables/useResources'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'
import { useUrlSync } from '~/composables/useUrlSync'
import SearchBar from '~/components/SearchBar.vue'
import ResourceFilters from '~/components/ResourceFilters.vue'
import ResourceSort from '~/components/ResourceSort.vue'
import ResourceCard from '~/components/ResourceCard.vue'
import RelatedSearches from '~/components/RelatedSearches.vue'
import PopularSearches from '~/components/PopularSearches.vue'
import ZeroResultSearches from '~/components/ZeroResultSearches.vue'

definePageMeta({
  layout: 'default',
})

// Set page-specific meta tags
const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: 'Search Resources - Free Stuff on the Internet',
  ogTitle: 'Search Resources - Free Stuff on the Internet',
  description:
    'Search and filter through our collection of free resources including AI tools, hosting services, databases, and more for developers.',
  ogDescription:
    'Search and filter through our collection of free resources including AI tools, hosting services, databases, and more for developers.',
  ogImage: '/og-image.jpg',
  ogUrl: `${runtimeConfig.public.siteUrl || runtimeConfig.public.canonicalUrl || 'https://free-stuff-on-the-internet.vercel.app'}/search`,
  twitterCard: 'summary_large_image',
})

// Use the basic resources composable
const {
  filteredResources: basicFilteredResources,
  loading,
  error,
  categories,
  pricingModels,
  difficultyLevels,
  technologies,
  tags,
  benefits,
  filterOptions,
  sortOption,
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
  highlightSearchTerms,
} = useResources()

// Use the advanced search composable for faceted search
const { resources } = useResourceData()
const {
  calculateFacetCounts,
  advancedSearchResources,
  savedSearches,
  saveSearch,
  removeSavedSearch,
  getPopularSearches,
  getZeroResultSearches,
  getRelatedSearches,
  createSearchSnippet,
} = useAdvancedResourceSearch(resources)

// Compute the filtered resources using advanced search when possible
const filteredResources = computed(() => {
  if (filterOptions.value.searchQuery) {
    // Apply filters to the advanced search results
    const searchResults = advancedSearchResources(
      filterOptions.value.searchQuery
    )

    // Apply other filters (categories, pricing, etc.) to the search results
    return searchResults.filter(resource => {
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
        filterOptions.value.difficultyLevels.includes(resource.difficultyLevel)

      const matchesTechnology =
        !filterOptions.value.technologies ||
        filterOptions.value.technologies.length === 0 ||
        resource.technologies?.some((tech: string) =>
          filterOptions.value.technologies.includes(tech)
        )

      const matchesTag =
        !filterOptions.value.tags ||
        filterOptions.value.tags.length === 0 ||
        resource.tags?.some((tag: string) =>
          filterOptions.value.tags.includes(tag)
        )

      const matchesBenefit =
        !filterOptions.value.benefits ||
        filterOptions.value.benefits.length === 0 ||
        resource.benefits?.some((benefit: string) =>
          filterOptions.value.benefits.includes(benefit)
        )

      // Date range filter
      const now = new Date()
      let matchesDateRange = true
      if (filterOptions.value.dateRange) {
        const resourceDate = new Date(
          resource.createdAt || resource.addedAt || now
        )
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
  } else {
    // If no search query, use the basic filtered resources
    return basicFilteredResources.value
  }
})

// Calculate facet counts based on current search and filters
const facetCounts = computed(() => {
  const searchQuery = filterOptions.value.searchQuery || ''

  const categoryCounts = calculateFacetCounts(searchQuery, 'category')
  const pricingCounts = calculateFacetCounts(searchQuery, 'pricingModel')
  const difficultyCounts = calculateFacetCounts(searchQuery, 'difficultyLevel')
  const technologyCounts = calculateFacetCounts(searchQuery, 'technologies')
  const tagCounts = calculateFacetCounts(searchQuery, 'tags')
  const benefitCounts = calculateFacetCounts(searchQuery, 'benefits')

  // Combine all counts into a single object with appropriate keys
  const allCounts: Record<string, number> = {}

  // Add category counts
  Object.entries(categoryCounts).forEach(([key, value]) => {
    allCounts[`category_${key}`] = value
  })

  // Add pricing counts
  Object.entries(pricingCounts).forEach(([key, value]) => {
    allCounts[`pricing_${key}`] = value
  })

  // Add difficulty counts
  Object.entries(difficultyCounts).forEach(([key, value]) => {
    allCounts[`difficulty_${key}`] = value
  })

  // Add technology counts
  Object.entries(technologyCounts).forEach(([key, value]) => {
    allCounts[`technology_${key}`] = value
  })

  // Add tag counts
  Object.entries(tagCounts).forEach(([key, value]) => {
    allCounts[`tag_${key}`] = value
  })

  // Add benefit counts
  Object.entries(benefitCounts).forEach(([key, value]) => {
    allCounts[`benefits_${key}`] = value
  })

  return allCounts
})

// Enhanced toggle functions with analytics tracking
const enhancedToggleCategory = (category: string) => {
  toggleCategory(category)
  trackFilter('category', category)
}

const enhancedTogglePricingModel = (pricingModel: string) => {
  togglePricingModel(pricingModel)
  trackFilter('pricing', pricingModel)
}

const enhancedToggleDifficultyLevel = (difficultyLevel: string) => {
  toggleDifficultyLevel(difficultyLevel)
  trackFilter('difficulty', difficultyLevel)
}

const enhancedToggleTechnology = (technology: string) => {
  toggleTechnology(technology)
  trackFilter('technology', technology)
}

const enhancedToggleTag = (tag: string) => {
  toggleTag(tag)
  trackFilter('tag', tag)
}

const enhancedToggleBenefit = (benefit: string) => {
  toggleBenefit(benefit)
  trackFilter('benefit', benefit)
}

const onDateRangeChange = (dateRange: string) => {
  setDateRange(dateRange)
  trackFilter('dateRange', dateRange)
}

// Set up URL synchronization
useUrlSync(filterOptions, sortOption)

// Reactive references for filters
const searchQuery = computed({
  get: () => filterOptions.value.searchQuery || '',
  set: value => updateSearchQuery(value),
})

const selectedCategories = computed(() => filterOptions.value.categories || [])
const selectedPricingModels = computed(
  () => filterOptions.value.pricingModels || []
)
const selectedDifficultyLevels = computed(
  () => filterOptions.value.difficultyLevels || []
)
const selectedTechnologies = computed(
  () => filterOptions.value.technologies || []
)
const selectedTags = computed(() => filterOptions.value.tags || [])
const selectedBenefits = computed(() => filterOptions.value.benefits || [])
const selectedDateRange = computed(
  () => filterOptions.value.dateRange || 'anytime'
)

import { trackSearch, trackFilter } from '~/utils/analytics'

// Handle search
const handleSearch = (query: string) => {
  updateSearchQuery(query)

  // Track the search event with results count after a short delay to ensure results are updated
  setTimeout(() => {
    trackSearch(query, filteredResources.value.length)
  }, 500)
}

// Reset all filters
const resetAllFilters = () => {
  resetFilters()
  searchQuery.value = ''
}

// Handle related searches
const handleRelatedSearch = (query: string) => {
  searchQuery.value = query
  updateSearchQuery(query)
}

// Handle popular searches
const handlePopularSearch = (query: string) => {
  searchQuery.value = query
  updateSearchQuery(query)
}

// Handle saved searches
const onUseSavedSearch = (search: {
  name: string
  query: string
  createdAt: Date
}) => {
  searchQuery.value = search.query
  updateSearchQuery(search.query)
}

const onRemoveSavedSearch = (query: string) => {
  removeSavedSearch(query)
}

// Helper function to get button label based on category
const getButtonLabel = (category: string) => {
  switch (category.toLowerCase()) {
    case 'ai tools':
      return 'Explore AI Tools'
    case 'vps':
      return 'Get VPS'
    case 'web hosting':
      return 'Find Hosting'
    case 'databases':
      return 'Explore Databases'
    case 'cdn':
      return 'Get CDN'
    default:
      return 'Get Free Access'
  }
}
</script>
