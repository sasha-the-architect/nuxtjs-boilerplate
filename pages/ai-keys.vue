<template>
  <div class="py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Free AI API Keys
        </h1>
        <p class="mt-4 text-xl text-gray-500">
          Access powerful AI models with these free API keys and tools
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

      <!-- Resources Grid -->
      <div v-else>
        <!-- Category Filters -->
        <div class="flex flex-wrap gap-2 mb-8">
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

        <!-- AI Resources Only -->
        <div class="space-y-8">
          <ResourceCard
            v-for="resource in filteredResources.filter(r =>
              r.category.includes('AI')
            )"
            :id="resource.id"
            :key="resource.id"
            :title="resource.title"
            :description="resource.description"
            :benefits="resource.benefits"
            :url="resource.url"
            :button-label="getButtonLabel(resource.category)"
          />
        </div>

        <!-- No Results Message -->
        <div
          v-if="
            filteredResources.filter(r => r.category.includes('AI')).length ===
              0 && !loading
          "
          class="text-center py-12"
        >
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            No AI resources found
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
const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: 'Free AI API Keys - Free Stuff on the Internet',
  ogTitle: 'Free AI API Keys - Free Stuff on the Internet',
  description:
    'Access powerful AI models with these free API keys and tools. Discover OpenAI, Hugging Face, Google AI Studio, and more free AI resources.',
  ogDescription:
    'Access powerful AI models with these free API keys and tools. Discover OpenAI, Hugging Face, Google AI Studio, and more free AI resources.',
  ogImage: '/og-image.jpg',
  ogUrl: `${runtimeConfig.public.siteUrl || runtimeConfig.public.canonicalUrl || 'http://localhost:3000'}/ai-keys`,
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
} = useResources()

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
