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

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12 mt-16">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"
        ></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 mt-16">
        <p class="text-red-600 text-lg">Error loading resources: {{ error }}</p>
      </div>

      <!-- Resources Grid -->
      <div v-else class="mt-16">
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
import { useResources } from '~/composables/useResources'
import { useUrlSync } from '~/composables/useUrlSync'
import ResourceCard from '~/components/ResourceCard.vue'
import SearchBar from '~/components/SearchBar.vue'
import ResourceSort from '~/components/ResourceSort.vue'

definePageMeta({
  layout: 'default',
})

// Set page-specific meta tags
useSeoMeta({
  title: 'Free Stuff on the Internet - Free Resources for Developers',
  ogTitle: 'Free Stuff on the Internet - Free Resources for Developers',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogDescription:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogImage: '/og-image.jpg',
  ogUrl: 'https://free-stuff-on-the-internet.vercel.app/',
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
</script>
