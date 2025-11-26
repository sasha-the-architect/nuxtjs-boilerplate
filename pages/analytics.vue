<template>
  <div class="analytics-dashboard min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p class="mt-2 text-gray-600">
          Track user behavior and resource performance
        </p>
      </div>

      <!-- Date Range Selector -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Start Date</label
            >
            <input
              v-model="startDate"
              type="date"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >End Date</label
            >
            <input
              v-model="endDate"
              type="date"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex items-end">
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @click="fetchAnalyticsData"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="bg-white p-8 rounded-lg shadow flex justify-center"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white p-8 rounded-lg shadow">
        <div class="text-red-600 text-center">
          <p class="text-lg font-medium">Error loading analytics data</p>
          <p class="mt-2">{{ error }}</p>
          <button
            class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            @click="fetchAnalyticsData"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Analytics Overview Cards -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div class="bg-white p-6 rounded-lg shadow">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Total Events</h3>
              <p class="text-2xl font-semibold text-gray-900">
                {{ analyticsData?.data?.totalEvents || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Unique Views</h3>
              <p class="text-2xl font-semibold text-gray-900">
                {{ analyticsData?.data?.eventsByType?.page_view || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Resource Clicks</h3>
              <p class="text-2xl font-semibold text-gray-900">
                {{ analyticsData?.data?.eventsByType?.resource_click || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Searches</h3>
              <p class="text-2xl font-semibold text-gray-900">
                {{ analyticsData?.data?.eventsByType?.search || 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Data Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Daily Trends Chart -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Daily Activity</h2>
          <div
            v-if="!analyticsData?.data?.dailyTrends?.length"
            class="h-64 flex items-center justify-center"
          >
            <p class="text-gray-500">No data available</p>
          </div>
          <div v-else class="h-64">
            <!-- Simple bar chart visualization -->
            <div class="flex items-end h-48 space-x-1">
              <div
                v-for="(day, index) in analyticsData?.data?.dailyTrends"
                :key="index"
                class="flex flex-col items-center flex-1 min-w-0"
              >
                <div class="w-full flex justify-center">
                  <div
                    class="w-3/4 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    :style="{ height: `${(day.count / maxDailyCount) * 100}%` }"
                    :title="`${day.date}: ${day.count} events`"
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

        <!-- Top Resources -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Top Resources</h2>
          <div
            v-if="!analyticsData?.data?.topResources?.length"
            class="text-gray-500 text-center py-8"
          >
            No resource data available
          </div>
          <ul v-else class="space-y-3">
            <li
              v-for="(resource, index) in analyticsData?.data?.topResources"
              :key="resource.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div class="flex items-center">
                <span class="text-gray-500 font-medium w-6"
                  >#{{ index + 1 }}</span
                >
                <span class="ml-2 font-medium truncate max-w-xs">{{
                  resource.title
                }}</span>
              </div>
              <span class="text-gray-700 font-medium"
                >{{ resource.views }} views</span
              >
            </li>
          </ul>
        </div>
      </div>

      <!-- Additional Analytics Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Events by Type -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Events by Type</h2>
          <div
            v-if="
              !analyticsData?.data?.eventsByType ||
              Object.keys(analyticsData.data.eventsByType).length === 0
            "
            class="text-gray-500 text-center py-8"
          >
            No event type data available
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="(count, type) in analyticsData.data.eventsByType"
              :key="type"
              class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <span class="text-gray-700 capitalize">{{
                type.replace('_', ' ')
              }}</span>
              <span class="font-medium">{{ count }}</span>
            </li>
          </ul>
        </div>

        <!-- Top Categories -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Top Categories</h2>
          <div
            v-if="!analyticsData?.data?.topCategories?.length"
            class="text-gray-500 text-center py-8"
          >
            No category data available
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="(category, index) in analyticsData?.data?.topCategories"
              :key="category.name"
              class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <div class="flex items-center">
                <span class="text-gray-500 w-6">#{{ index + 1 }}</span>
                <span class="text-gray-700 ml-2">{{ category.name }}</span>
              </div>
              <span class="font-medium">{{ category.count }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Define types
interface AnalyticsData {
  success: boolean
  data: {
    totalEvents: number
    eventsByType: Record<string, number>
    eventsByCategory: Record<string, number>
    resourceViews: Record<string, number>
    topResources: Array<{ id: string; title: string; views: number }>
    topCategories: Array<{ name: string; count: number }>
    dailyTrends: Array<{ date: string; count: number }>
  }
  dateRange: {
    start: string
    end: string
  }
}

// State
const analyticsData = ref<AnalyticsData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const startDate = ref('')
const endDate = ref('')

// Initialize date range to last 30 days
const now = new Date()
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(now.getDate() - 30)

startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
endDate.value = now.toISOString().split('T')[0]

// Get the maximum daily count for scaling the chart
const maxDailyCount = computed(() => {
  if (!analyticsData.value?.data?.dailyTrends) return 1
  return Math.max(
    ...analyticsData.value.data.dailyTrends.map(day => day.count),
    1
  )
})

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Fetch analytics data
const fetchAnalyticsData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(
      `/api/analytics/data?startDate=${startDate.value}&endDate=${endDate.value}`
    )
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch analytics data')
    }

    analyticsData.value = data
  } catch (err: any) {
    console.error('Error fetching analytics:', err)
    error.value = err.message || 'Failed to load analytics data'
  } finally {
    loading.value = false
  }
}

// Initialize data on component mount
onMounted(() => {
  fetchAnalyticsData()
})
</script>
