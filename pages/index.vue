<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1
          class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Free Stuff on the Internet
        </h1>
        <p class="mt-6 max-w-lg mx-auto text-xl text-gray-500">
          Discover amazing free resources available on the internet - from AI
          tools to hosting services.
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mt-8 max-w-2xl mx-auto">
        <SearchBar v-model="searchQuery" @search="handleSearch" />
      </div>

      <!-- Loading State with Skeletons -->
      <div v-if="loading" class="mt-16">
        <div class="flex flex-wrap gap-2 mb-8 justify-center">
          <div
            v-for="i in 5"
            :key="i"
            class="px-3 py-1 text-sm rounded-full border bg-gray-200 animate-pulse"
            style="width: 80px; height: 28px"
          ></div>
        </div>

        <div class="flex justify-between items-center mb-6">
          <div class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <!-- Resources Grid with Skeletons -->
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <ResourceCardSkeleton v-for="i in 6" :key="`skeleton-${i}`" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 mt-16">
        <div class="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p class="text-red-600 text-lg mb-4">
          Error loading resources: {{ error }}
        </p>
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
          @click="retryResources"
        >
          Retry
        </button>
      </div>

      <!-- Resources Grid -->
      <div v-else class="mt-16">
        <!-- ARIA live region for search results -->
        <div
          id="search-results-status"
          role="status"
          aria-live="polite"
          class="sr-only"
        >
          {{ filteredResources.length }} resources found for your search
        </div>

        <!-- Category Filters -->
        <div class="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            v-for="category in categories"
            :key="category"
            :class="[
              'px-3 py-1 text-sm rounded-full border',
              selectedCategories.includes(category)
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            ]"
            :aria-label="
              selectedCategories.includes(category)
                ? `Remove ${category} filter`
                : `Filter by ${category}`
            "
            :aria-pressed="selectedCategories.includes(category)"
            @click="toggleCategory(category)"
          >
            {{ category }}
          </button>
        </div>

        <!-- Results Info -->
        <div class="flex justify-between items-center mb-6">
          <ResourceSort
            :selected-sort-option="sortOption"
            :total-resources="filteredResources.length"
            @update-sort-option="setSortOption"
          />
        </div>

        <!-- Resources Grid -->
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

        <!-- No Results Message -->
        <div
          v-if="!filteredResources.length && !loading"
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

        <!-- Trending Resources Section -->
        <div v-if="filteredResources.length > 0 && !loading" class="mt-16">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Trending Resources
          </h2>
          <div class="grid grid-cols-1 gap-6">
            <ResourceCard
              v-for="resource in trendingResources"
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
import ResourceCard from '~/components/ResourceCard.vue'
import SearchBar from '~/components/SearchBar.vue'
import ResourceSort from '~/components/ResourceSort.vue'

definePageMeta({
  layout: 'default',
})

const runtimeConfig = useRuntimeConfig()

// Set page-specific meta tags
useSeoMeta({
  title: 'Free Stuff on the Internet - Free Resources for Developers',
  ogTitle: 'Free Stuff on the Internet - Free Resources for Developers',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogDescription:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogImage: '/og-image.jpg',
  ogUrl: runtimeConfig.public.canonicalUrl,
  twitterCard: 'summary_large_image',
})

// Use the resources composable
const {
  filteredResources,
  loading,
  error,
  categories,
  filterOptions,
  sortOption,
  updateSearchQuery,
  toggleCategory,
  setSortOption,
  resetFilters,
  resources,
  highlightSearchTerms,
  retryResources,
} = useResources()

// Compute trending resources (top 5 by popularity)
const trendingResources = computed(() => {
  if (!resources.value || resources.value.length === 0) return []

  return [...resources.value]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 5)
})

// Set up URL synchronization
useUrlSync(filterOptions, sortOption)

// Reactive references for filters
const searchQuery = computed({
  get: () => filterOptions.value.searchQuery || '',
  set: value => updateSearchQuery(value),
})

const selectedCategories = computed(() => filterOptions.value.categories || [])

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

// Function to get related resources based on category
const getRelatedResources = (currentResource: any, allResources: any[]) => {
  if (!currentResource?.category) return []

  return allResources
    .filter(
      (resource: any) =>
        resource.category === currentResource.category &&
        resource.id !== currentResource.id
    )
    .slice(0, 3) // Limit to 3 related resources
}

// Function to get trending resources (top 5 by popularity)
const getTrendingResources = (allResources: any[]) => {
  return [...allResources]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 5)
}
</script>
