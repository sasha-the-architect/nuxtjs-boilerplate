<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1
          class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Free Stuff on the Internet
        </h1>
        <p class="mt-6 max-w-lg mx-auto text-xl text-gray-600">
          Discover amazing free resources available on the internet - from AI
          tools to hosting services.
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mt-8 max-w-2xl mx-auto">
        <SearchBar
          v-model="searchQuery"
          @search="handleSearch"
        />
      </div>

      <!-- Loading State with Skeletons -->
      <div
        v-if="loading"
        class="mt-16"
      >
        <div class="flex flex-wrap gap-2 mb-8 justify-center">
          <div
            v-for="i in 5"
            :key="i"
            class="px-3 py-1 text-sm rounded-full border bg-gray-200 animate-pulse"
            style="width: 80px; height: 28px"
          />
        </div>

        <div class="flex justify-between items-center mb-6">
          <div class="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>

        <!-- Resources Grid with Skeletons -->
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <ResourceCardSkeleton
            v-for="i in 6"
            :key="`skeleton-${i}`"
          />
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="mt-16"
      >
        <ErrorMessage
          :message="errorMessage || error"
          variant="error"
          :action="{ label: 'Retry', handler: retryResources }"
        />
      </div>

      <!-- Resources Grid -->
      <div
        v-else
        class="mt-16"
      >
        <!-- ARIA live region for search results -->
        <div
          id="search-results-status"
          role="status"
          aria-live="polite"
          class="sr-only"
        >
          {{ filteredResources.length }} resources found for your search
        </div>

        <!-- Filters Section -->
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Resource Filters Component -->
          <div class="lg:w-1/4">
            <ResourceFilters
              :categories="categories"
              :pricing-models="pricingModels"
              :difficulty-levels="difficultyLevels"
              :technologies="technologies"
              :tags="allTags"
              :selected-categories="filterOptions.categories"
              :selected-pricing-models="filterOptions.pricingModels"
              :selected-difficulty-levels="filterOptions.difficultyLevels"
              :selected-technologies="filterOptions.technologies"
              :selected-tags="filterOptions.tags"
              @toggle-category="toggleCategory"
              @toggle-pricing-model="togglePricingModel"
              @toggle-difficulty-level="toggleDifficultyLevel"
              @toggle-technology="toggleTechnology"
              @toggle-tag="toggleTag"
              @reset-filters="resetFilters"
            />
          </div>

          <!-- Category Filters (for mobile) -->
          <div class="lg:hidden flex flex-wrap gap-2 mb-4 justify-center">
            <button
              v-for="category in categories"
              :key="category"
              :class="[
                'px-3 py-1 text-sm rounded-full border',
                selectedCategories.includes(category)
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50',
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

          <!-- Resources Grid -->
          <div class="lg:w-3/4">
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
              <LazyResourceCard
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
                  highlightSearchTerms(resource.description, searchQuery)
                "
              />
            </div>
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
          <div
            v-if="filteredResources.length > 0 && !loading"
            class="mt-16"
          >
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              Trending Resources
            </h2>
            <div class="grid grid-cols-1 gap-6">
              <LazyResourceCard
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

        <!-- Recommendations Section -->
        <div
          v-if="filteredResources.length > 0 && !loading"
          class="mt-16"
        >
          <ClientOnly>
            <LazyRecommendationsSection />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResources } from '~/composables/useResources'
import { useUrlSync } from '~/composables/useUrlSync'
import { useHomePage } from '~/composables/useHomePage'
import { getButtonLabel } from '~/utils/resourceHelper'
import SearchBar from '~/components/SearchBar.vue'
import ResourceSort from '~/components/ResourceSort.vue'
import ResourceFilters from '~/components/ResourceFilters.vue'

definePageMeta({
  layout: 'default',
})

// Set page-specific meta tags
const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: 'Free Stuff on the Internet - Free Resources for Developers',
  ogTitle: 'Free Stuff on the Internet - Free Resources for Developers',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogDescription:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogImage: '/og-image.jpg',
  ogUrl:
    runtimeConfig.public.siteUrl ||
    runtimeConfig.public.canonicalUrl ||
    'http://localhost:3000',
  twitterCard: 'summary_large_image',
})

// Use the resources composable
const {
  filteredResources,
  loading,
  error,
  errorMessage,
  categories,
  pricingModels,
  difficultyLevels,
  technologies,
  allTags,
  filterOptions,
  sortOption,
  updateSearchQuery,
  toggleCategory,
  togglePricingModel,
  toggleDifficultyLevel,
  toggleTechnology,
  toggleTag,
  setSortOption,
  resetFilters,
  resources,
  highlightSearchTerms,
  retryResources,
} = useResources()

const { trendingResources } = useHomePage(resources.value)

useUrlSync(filterOptions, sortOption)

const searchQuery = computed({
  get: () => filterOptions.value.searchQuery || '',
  set: value => updateSearchQuery(value),
})

const selectedCategories = computed(() => filterOptions.value.categories || [])

const handleSearch = (query: string) => {
  updateSearchQuery(query)
}

const resetAllFilters = () => {
  resetFilters()
  searchQuery.value = ''
}
</script>
