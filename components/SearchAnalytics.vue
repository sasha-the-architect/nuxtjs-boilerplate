<template>
  <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-gray-900">Search Analytics</h3>
    </div>

    <!-- Search Performance Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-blue-800">Total Searches</h4>
        <p class="text-2xl font-bold text-blue-900">{{ totalSearches }}</p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-green-800">Avg. Results</h4>
        <p class="text-2xl font-bold text-green-900">{{ avgResults }}</p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-purple-800">Zero Results</h4>
        <p class="text-2xl font-bold text-purple-900">{{ zeroResultCount }}</p>
      </div>
    </div>

    <!-- Popular Searches -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Popular Searches</h4>
      <div class="space-y-2">
        <div 
          v-for="(search, index) in popularSearches" 
          :key="index"
          class="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
        >
          <span class="text-sm text-gray-700">{{ search.query }}</span>
          <span class="text-xs bg-gray-200 px-2 py-1 rounded">{{ search.count }}</span>
        </div>
        <div v-if="popularSearches.length === 0" class="text-sm text-gray-500 italic">
          No data available
        </div>
      </div>
    </div>

    <!-- Zero Result Queries -->
    <div>
      <h4 class="text-sm font-medium text-gray-900 mb-3">Zero Result Queries</h4>
      <div class="space-y-2">
        <div 
          v-for="(query, index) in zeroResultQueries" 
          :key="index"
          class="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
        >
          <span class="text-sm text-red-600">{{ query }}</span>
        </div>
        <div v-if="zeroResultQueries.length === 0" class="text-sm text-gray-500 italic">
          No zero result queries
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdvancedSearch } from '~/composables/useAdvancedSearch'
import { computed } from 'vue'

// Use the advanced search composable for analytics
const { searchAnalytics, getPopularSearches, getZeroResultQueries } = useAdvancedSearch()

// Compute metrics
const totalSearches = computed(() => searchAnalytics.value.length)

const avgResults = computed(() => {
  if (searchAnalytics.value.length === 0) return 0
  const totalResults = searchAnalytics.value.reduce((sum, analytics) => sum + analytics.resultCount, 0)
  return Math.round(totalResults / searchAnalytics.value.length * 100) / 100
})

const zeroResultCount = computed(() => {
  return searchAnalytics.value.filter(analytics => analytics.isZeroResult).length
})

// Get popular searches (top 5)
const popularSearches = computed(() => {
  return getPopularSearches(5)
})

// Get zero result queries (top 5)
const zeroResultQueries = computed(() => {
  return getZeroResultQueries(5)
})
</script>
</file>