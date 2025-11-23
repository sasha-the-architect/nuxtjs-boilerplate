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
            :selected-categories="selectedCategories"
            :selected-pricing-models="selectedPricingModels"
            :selected-difficulty-levels="selectedDifficultyLevels"
            :selected-technologies="selectedTechnologies"
            role="region"
            aria-label="Resource filters"
            @toggle-category="toggleCategory"
            @toggle-pricing-model="togglePricingModel"
            @toggle-difficulty-level="toggleDifficultyLevel"
            @toggle-technology="toggleTechnology"
            @reset-filters="resetAllFilters"
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
                highlightSearchTerms(resource.description, searchQuery)
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResources, type SortOption } from '~/composables/useResources'
import { useUrlSync } from '~/composables/useUrlSync'
import SearchBar from '~/components/SearchBar.vue'
import ResourceFilters from '~/components/ResourceFilters.vue'
import ResourceSort from '~/components/ResourceSort.vue'
import ResourceCard from '~/components/ResourceCard.vue'

definePageMeta({
  layout: 'default',
})

// Set page-specific meta tags
useSeoMeta({
  title: 'Search Resources - Free Stuff on the Internet',
  ogTitle: 'Search Resources - Free Stuff on the Internet',
  description:
    'Search and filter through our collection of free resources including AI tools, hosting services, databases, and more for developers.',
  ogDescription:
    'Search and filter through our collection of free resources including AI tools, hosting services, databases, and more for developers.',
  ogImage: '/og-image.jpg',
  ogUrl: 'https://free-stuff-on-the-internet.vercel.app/search',
  twitterCard: 'summary_large_image',
})

// Use the resources composable
const {
  filteredResources,
  loading,
  error,
  categories,
  pricingModels,
  difficultyLevels,
  technologies,
  filterOptions,
  sortOption,
  updateSearchQuery,
  toggleCategory,
  togglePricingModel,
  toggleDifficultyLevel,
  toggleTechnology,
  setSortOption,
  resetFilters,
  highlightSearchTerms,
} = useResources()

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

// Handle search
const handleSearch = (query: string) => {
  updateSearchQuery(query)
}

// Reset all filters
const resetAllFilters = () => {
  resetFilters()
  searchQuery.value = ''
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
