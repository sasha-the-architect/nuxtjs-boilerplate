<!-- pages/analytics.vue -->
<!-- Analytics Dashboard Page -->

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p class="mt-2 text-gray-600">
          Track user behavior, resource performance, and platform insights
        </p>
      </div>

      <!-- Privacy Notice -->
      <div class="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Privacy Notice</h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>
                All analytics data is collected anonymously. No personal
                information is tracked or stored.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Range Selector -->
      <div
        class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <label
            for="date-range"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Date Range</label
          >
          <select
            id="date-range"
            v-model="selectedDateRange"
            class="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
        <div class="flex space-x-3">
          <button
            @click="refreshData"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              class="-ml-1 mr-2 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clip-rule="evenodd"
              />
            </svg>
            Refresh
          </button>
          <button
            @click="exportData"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              class="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        ></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-md p-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Error loading analytics
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <AnalyticsDashboard
          :dashboard-metrics="dashboardMetrics"
          :device-distribution="deviceDistribution"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'], // This would require authentication in a real implementation
})

const loading = ref(true)
const error = ref<string | null>(null)
const selectedDateRange = ref('30') // Default to last 30 days
const dashboardMetrics = ref({
  totalPageViews: 0,
  uniqueVisitors: 0,
  avgSessionDuration: 0,
  topResources: [],
  popularSearches: [],
  userGrowth: [],
  monthlyActiveUsers: 0,
  weeklyActiveUsers: 0,
  dailyActiveUsers: 0,
  bounceRate: 0,
})

const deviceDistribution = ref<Record<string, number>>({})
const totalDevices = computed(() => {
  return Object.values(deviceDistribution.value).reduce(
    (sum, count) => sum + count,
    0
  )
})

// Fetch analytics data
const fetchAnalytics = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch('/api/analytics/dashboard', {
      params: {
        from: getDateRangeStart(selectedDateRange.value).toISOString(),
        to: new Date().toISOString(),
      },
    })

    if (response.success) {
      dashboardMetrics.value = response.data

      // Get user device distribution
      const userResponse = await $fetch('/api/analytics/users')
      if (userResponse.success) {
        deviceDistribution.value = userResponse.deviceDistribution || {}
      }
    }
  } catch (err) {
    console.error('Error fetching analytics:', err)
    error.value =
      err instanceof Error ? err.message : 'Failed to load analytics data'
  } finally {
    loading.value = false
  }
}

const getDateRangeStart = (days: string) => {
  const date = new Date()
  date.setDate(date.getDate() - parseInt(days))
  return date
}

const refreshData = () => {
  fetchAnalytics()
}

const exportData = () => {
  // In a real implementation, this would download a CSV or JSON file
  alert('Data export functionality would be implemented here')
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// Initial data fetch
onMounted(() => {
  fetchAnalytics()
})
</script>
