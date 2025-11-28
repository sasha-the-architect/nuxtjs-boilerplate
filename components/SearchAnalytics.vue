<template>
  <div
    class="search-analytics bg-white p-6 rounded-lg shadow border border-gray-200"
  >
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Search Analytics</h2>

    <!-- Search Performance Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-blue-800">Total Searches</h3>
        <p class="text-2xl font-bold text-blue-900">
          {{ analyticsData?.searchStats?.totalSearches || 0 }}
        </p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-green-800">Avg. Response Time</h3>
        <p class="text-2xl font-bold text-green-900">
          {{ analyticsData?.searchStats?.avgResponseTime || '0' }}ms
        </p>
      </div>
      <div class="bg-red-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-red-800">Zero-Result Searches</h3>
        <p class="text-2xl font-bold text-red-900">
          {{ analyticsData?.searchStats?.zeroResultSearches || 0 }}
        </p>
        <p class="text-xs text-red-600 mt-1">
          {{ zeroResultPercentage }}% of all searches
        </p>
      </div>
    </div>

    <!-- Popular Search Queries -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Popular Searches</h3>
        <button
          class="text-sm text-gray-600 hover:text-gray-900"
          @click="refreshData"
        >
          Refresh
        </button>
      </div>

      <div
        v-if="!analyticsData?.popularSearches?.length"
        class="text-gray-500 text-center py-4"
      >
        No popular search data available
      </div>

      <ul v-else class="space-y-2 max-h-60 overflow-y-auto">
        <li
          v-for="(search, index) in analyticsData.popularSearches"
          :key="index"
          class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
        >
          <div class="flex items-center">
            <span class="text-gray-500 font-medium w-6">#{{ index + 1 }}</span>
            <span class="ml-3 font-medium text-gray-800">{{
              search.query
            }}</span>
          </div>
          <span
            class="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
          >
            {{ search.count }} searches
          </span>
        </li>
      </ul>
    </div>

    <!-- Zero Result Queries -->
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        Zero-Result Queries
      </h3>

      <div
        v-if="!analyticsData?.zeroResultSearches?.length"
        class="text-gray-500 text-center py-4"
      >
        No zero-result search data available
      </div>

      <ul v-else class="space-y-2 max-h-60 overflow-y-auto">
        <li
          v-for="(search, index) in analyticsData.zeroResultSearches"
          :key="index"
          class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100 bg-red-50"
        >
          <div class="flex items-center">
            <span class="text-red-500 font-medium w-6">#{{ index + 1 }}</span>
            <span class="ml-3 font-medium text-red-800">{{
              search.query
            }}</span>
          </div>
          <span
            class="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full"
          >
            {{ search.count }} attempts
          </span>
        </li>
      </ul>
    </div>

    <!-- Search Trends Chart -->
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        Search Trends (Last 30 Days)
      </h3>

      <div
        v-if="!analyticsData?.searchTrends?.length"
        class="text-gray-500 text-center py-8"
      >
        No search trend data available
      </div>

      <div v-else class="h-64">
        <!-- Simple bar chart visualization -->
        <div class="flex items-end h-52 space-x-1">
          <div
            v-for="(day, index) in analyticsData.searchTrends"
            :key="index"
            class="flex flex-col items-center flex-1 min-w-0"
          >
            <div class="w-full flex justify-center">
              <div
                class="w-3/4 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                :style="{
                  height: `${(day.count / maxSearchTrendCount) * 100}%`,
                }"
                :title="`${day.date}: ${day.count} searches`"
              ></div>
            </div>
            <span
              class="text-xs text-gray-500 mt-1 truncate w-full text-center"
              :class="{ hidden: index % 3 !== 0 }"
            >
              <!-- Only show every 3rd date to avoid crowding -->
              {{ formatDate(day.date) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Performance Metrics -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Search Performance</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-gray-700 mb-2">Search Success Rate</h4>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-green-600 h-2.5 rounded-full"
              :style="{ width: `${successRatePercentage}%` }"
            ></div>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            {{ successRatePercentage }}% successful searches
          </p>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-gray-700 mb-2">Avg. Search Results</h4>
          <p class="text-xl font-bold text-gray-900">
            {{
              analyticsData?.searchStats?.avgResultsPerSearch?.toFixed(2) ||
              '0.00'
            }}
          </p>
          <p class="text-sm text-gray-600">results per search</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface PopularSearch {
  query: string
  count: number
}

interface ZeroResultSearch {
  query: string
  count: number
}

interface SearchTrend {
  date: string
  count: number
}

interface SearchAnalyticsData {
  searchStats: {
    totalSearches: number
    avgResponseTime: number
    zeroResultSearches: number
    avgResultsPerSearch: number
  }
  popularSearches: PopularSearch[]
  zeroResultSearches: ZeroResultSearch[]
  searchTrends: SearchTrend[]
}

interface Props {
  dateRange?: {
    start: string
    end: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  dateRange: () => ({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  }),
})

const analyticsData = ref<SearchAnalyticsData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Computed properties
const zeroResultPercentage = computed(() => {
  if (!analyticsData.value?.searchStats) return 0
  const { totalSearches, zeroResultSearches } = analyticsData.value.searchStats
  return totalSearches > 0
    ? ((zeroResultSearches / totalSearches) * 100).toFixed(2)
    : 0
})

const successRatePercentage = computed(() => {
  if (!analyticsData.value?.searchStats) return 0
  const { totalSearches, zeroResultSearches } = analyticsData.value.searchStats
  return totalSearches > 0
    ? (((totalSearches - zeroResultSearches) / totalSearches) * 100).toFixed(2)
    : 0
})

const maxSearchTrendCount = computed(() => {
  if (!analyticsData.value?.searchTrends) return 1
  return Math.max(...analyticsData.value.searchTrends.map(day => day.count), 1)
})

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const refreshData = async () => {
  await fetchAnalyticsData()
}

const fetchAnalyticsData = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch search-specific analytics data
    const response = await fetch(
      `/api/analytics/search?startDate=${props.dateRange.start}&endDate=${props.dateRange.end}`
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch search analytics: ${response.statusText}`
      )
    }

    const data = await response.json()
    analyticsData.value = data
  } catch (err: any) {
    // In a production environment, you would log this to an error tracking service
    // console.error('Error fetching search analytics:', err);
    error.value = err.message || 'Failed to load search analytics data'
  } finally {
    loading.value = false
  }
}

// Initialize data on component mount
onMounted(() => {
  fetchAnalyticsData()
})

// Watch for date range changes
watch(
  () => props.dateRange,
  () => {
    fetchAnalyticsData()
  },
  { deep: true }
)
</script>
