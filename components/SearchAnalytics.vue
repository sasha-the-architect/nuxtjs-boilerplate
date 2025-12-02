<template>
  <div class="search-analytics bg-white p-6 rounded-lg shadow mb-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">Search Analytics</h2>
      <div class="flex space-x-2">
        <select
          v-model="timeRange"
          class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="fetchSearchAnalytics"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-600 text-center py-8">
      <p class="text-lg font-medium">Error loading search analytics</p>
      <p class="mt-2">{{ error }}</p>
      <button
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        @click="fetchSearchAnalytics"
      >
        Retry
      </button>
    </div>

    <!-- Search Analytics Overview Cards -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div class="flex items-center">
          <div class="rounded-full bg-blue-100 p-3">
            <svg
              class="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Total Searches</h3>
            <p class="text-2xl font-semibold text-gray-900">
              {{ searchAnalytics?.data?.totalSearches || 0 }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 p-4 rounded-lg border border-green-100">
        <div class="flex items-center">
          <div class="rounded-full bg-green-100 p-3">
            <svg
              class="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Success Rate</h3>
            <p class="text-2xl font-semibold text-gray-900">
              {{
                searchAnalytics?.data?.successRate
                  ? `${searchAnalytics.data.successRate}%`
                  : '0%'
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <div class="flex items-center">
          <div class="rounded-full bg-yellow-100 p-3">
            <svg
              class="h-6 w-6 text-yellow-600"
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
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Zero-Result</h3>
            <p class="text-2xl font-semibold text-gray-900">
              {{ searchAnalytics?.data?.zeroResultCount || 0 }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <div class="flex items-center">
          <div class="rounded-full bg-purple-100 p-3">
            <svg
              class="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Avg Response</h3>
            <p class="text-2xl font-semibold text-gray-900">
              {{
                searchAnalytics?.data?.avgResponseTime
                  ? `${searchAnalytics.data.avgResponseTime}ms`
                  : '0ms'
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Data Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Search Trends Chart -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Search Trends</h3>
        <div
          v-if="!searchAnalytics?.data?.searchTrends?.length"
          class="h-64 flex items-center justify-center"
        >
          <p class="text-gray-500">No search trend data available</p>
        </div>
        <div v-else class="h-64">
          <!-- Simple bar chart visualization -->
          <div class="flex items-end h-48 space-x-1">
            <div
              v-for="(day, index) in searchAnalytics.data.searchTrends"
              :key="index"
              class="flex flex-col items-center flex-1 min-w-0"
            >
              <div class="w-full flex justify-center">
                <div
                  class="w-3/4 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  :style="{ height: `${(day.count / maxSearchCount) * 100}%` }"
                  :title="`${day.date}: ${day.count} searches`"
                ></div>
              </div>
              <span
                class="text-xs text-gray-500 mt-1 truncate w-full text-center"
                >{{ formatDate(day.date) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Searches -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Popular Searches</h3>
        <div
          v-if="!searchAnalytics?.data?.popularSearches?.length"
          class="text-gray-500 text-center py-8"
        >
          No popular search data available
        </div>
        <ul v-else class="space-y-3 max-h-64 overflow-y-auto">
          <li
            v-for="(search, index) in searchAnalytics.data.popularSearches"
            :key="search.query"
            class="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
          >
            <div class="flex items-center">
              <span class="text-gray-500 font-medium w-6"
                >#{{ index + 1 }}</span
              >
              <span class="ml-2 font-medium truncate max-w-xs">{{
                search.query
              }}</span>
            </div>
            <span class="text-gray-700 font-medium">{{ search.count }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Additional Search Analytics Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Zero-Result Queries -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Zero-Result Queries
        </h3>
        <div
          v-if="!searchAnalytics?.data?.zeroResultQueries?.length"
          class="text-gray-500 text-center py-8"
        >
          No zero-result query data available
        </div>
        <ul v-else class="space-y-2 max-h-64 overflow-y-auto">
          <li
            v-for="(query, index) in searchAnalytics.data.zeroResultQueries"
            :key="query.query"
            class="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
          >
            <div class="flex items-center">
              <span class="text-gray-500 w-6">#{{ index + 1 }}</span>
              <span class="text-gray-700 ml-2">{{ query.query }}</span>
            </div>
            <span class="font-medium">{{ query.count }}</span>
          </li>
        </ul>
      </div>

      <!-- Search Performance -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Search Performance
        </h3>
        <div
          v-if="!searchAnalytics?.data?.performanceMetrics"
          class="text-gray-500 text-center py-8"
        >
          No performance data available
        </div>
        <div v-else class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-3 rounded border border-gray-200">
              <p class="text-sm text-gray-500">Fast Searches (&lt;100ms)</p>
              <p class="text-xl font-semibold text-green-600">
                {{ searchAnalytics.data.performanceMetrics.fastSearches }}
              </p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <p class="text-sm text-gray-500">Medium Searches (100-500ms)</p>
              <p class="text-xl font-semibold text-yellow-600">
                {{ searchAnalytics.data.performanceMetrics.mediumSearches }}
              </p>
            </div>
          </div>
          <div class="bg-white p-3 rounded border border-gray-200">
            <p class="text-sm text-gray-500">Slow Searches (&gt;500ms)</p>
            <p class="text-xl font-semibold text-red-600">
              {{ searchAnalytics.data.performanceMetrics.slowSearches }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import logger from '~/utils/logger'

// Define types
interface SearchAnalyticsData {
  success: boolean
  data: {
    totalSearches: number
    successRate: number
    zeroResultCount: number
    avgResponseTime: number
    searchTrends: Array<{ date: string; count: number }>
    popularSearches: Array<{ query: string; count: number }>
    zeroResultQueries: Array<{ query: string; count: number }>
    performanceMetrics: {
      fastSearches: number
      mediumSearches: number
      slowSearches: number
    }
  }
  dateRange: {
    start: string
    end: string
  }
}

// State
const searchAnalytics = ref<SearchAnalyticsData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const timeRange = ref('30') // Default to 30 days

// Get the maximum search count for scaling the chart
const maxSearchCount = computed(() => {
  if (!searchAnalytics.value?.data?.searchTrends) return 1
  return Math.max(
    ...searchAnalytics.value.data.searchTrends.map(day => day.count),
    1
  )
})

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Fetch search analytics data
const fetchSearchAnalytics = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(
      `/api/analytics/search?days=${timeRange.value}`
    )
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch search analytics data')
    }

    searchAnalytics.value = data
  } catch (err: any) {
    logger.error('Error fetching search analytics:', err)
    error.value = err.message || 'Failed to load search analytics data'
  } finally {
    loading.value = false
  }
}

// Initialize data on component mount
onMounted(() => {
  fetchSearchAnalytics()
})
</script>
