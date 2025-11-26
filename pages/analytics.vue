<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Search Analytics Dashboard
        </h1>
        <p class="mt-4 text-xl text-gray-500">
          Insights and metrics for search performance and user behavior
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Search Analytics -->
        <div>
          <SearchAnalytics />
        </div>

        <!-- Performance Metrics -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          
          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">Recent Search Performance</h4>
              <div class="space-y-2">
                <div 
                  v-for="(perf, index) in searchPerformance" 
                  :key="index"
                  class="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div class="flex-1 truncate pr-4">
                    <span class="text-sm text-gray-700 truncate">{{ perf.query }}</span>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {{ perf.timeMs }}ms
                    </span>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {{ perf.resultCount }} results
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Performance Stats</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-blue-50 p-3 rounded">
                  <p class="text-xs text-blue-600">Avg. Search Time</p>
                  <p class="text-lg font-bold text-blue-900">{{ avgSearchTime }}ms</p>
                </div>
                <div class="bg-green-50 p-3 rounded">
                  <p class="text-xs text-green-600">Avg. Results</p>
                  <p class="text-lg font-bold text-green-900">{{ avgResultsCount }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchAnalytics from '~/components/SearchAnalytics.vue'
import { useAdvancedSearch } from '~/composables/useAdvancedSearch'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
})

// Set page-specific meta tags
const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: 'Search Analytics Dashboard - Free Stuff on the Internet',
  ogTitle: 'Search Analytics Dashboard - Free Stuff on the Internet',
  description: 'Analytics dashboard showing search performance and user behavior metrics.',
  ogDescription: 'Analytics dashboard showing search performance and user behavior metrics.',
  ogImage: '/og-image.jpg',
  ogUrl: `${runtimeConfig.public.siteUrl || runtimeConfig.public.canonicalUrl || 'https://free-stuff-on-the-internet.vercel.app'}/analytics`,
  twitterCard: 'summary_large_image',
})

// Use the advanced search composable for analytics
const { searchAnalytics } = useAdvancedSearch()

// Compute performance metrics
const avgSearchTime = computed(() => {
  if (searchPerformance.value.length === 0) return 0
  const total = searchPerformance.value.reduce((sum, perf) => sum + perf.timeMs, 0)
  return Math.round(total / searchPerformance.value.length * 100) / 100
})

const avgResultsCount = computed(() => {
  if (searchPerformance.value.length === 0) return 0
  const total = searchPerformance.value.reduce((sum, perf) => sum + perf.resultCount, 0)
  return Math.round(total / searchPerformance.value.length * 100) / 100
})

// Mock performance data - in a real implementation, this would come from search events
const searchPerformance = computed(() => {
  // For now, return empty array - in a real implementation this would be populated
  // by tracking search performance in the search page
  return []
})
</script>
</file>