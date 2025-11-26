<!-- components/AnalyticsDashboard.vue -->
<!-- Analytics Dashboard Component -->

<template>
  <div class="space-y-8">
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg
                class="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Page Views
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ formatNumber(dashboardMetrics.totalPageViews) }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg
                class="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Unique Visitors
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ formatNumber(dashboardMetrics.uniqueVisitors) }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <svg
                class="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Avg. Session Duration
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ formatDuration(dashboardMetrics.avgSessionDuration) }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-red-500 rounded-md p-3">
              <svg
                class="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Bounce Rate
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ dashboardMetrics.bounceRate.toFixed(1) }}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- User Growth Chart -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          User Growth
        </h3>
        <div class="h-80">
          <div
            v-if="
              dashboardMetrics.userGrowth &&
              dashboardMetrics.userGrowth.length > 0
            "
            class="h-full flex items-center justify-center"
          >
            <div class="w-full h-full flex flex-col">
              <div class="flex-1 grid grid-cols-10 gap-1">
                <div
                  v-for="(data, index) in dashboardMetrics.userGrowth.slice(
                    -10
                  )"
                  :key="index"
                  class="flex flex-col items-center justify-end"
                >
                  <div
                    class="w-6 bg-indigo-500 rounded-t"
                    :style="{
                      height: `${(data.count / Math.max(...dashboardMetrics.userGrowth.map(d => d.count))) * 80}%`,
                    }"
                  ></div>
                  <div
                    class="text-xs text-gray-500 mt-1 truncate w-full text-center"
                  >
                    {{ formatDate(data.date) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="h-full flex items-center justify-center text-gray-500"
          >
            No data available
          </div>
        </div>
      </div>

      <!-- Device Distribution -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Device Distribution
        </h3>
        <div class="h-80 flex items-center justify-center">
          <div
            v-if="
              deviceDistribution && Object.keys(deviceDistribution).length > 0
            "
            class="w-full"
          >
            <div
              v-for="(count, deviceType) in deviceDistribution"
              :key="deviceType"
              class="mb-2"
            >
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium">{{
                  deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
                }}</span>
                <span
                  >{{ count }} ({{
                    ((count / totalDevices) * 100).toFixed(1)
                  }}%)</span
                >
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-indigo-600 h-2.5 rounded-full"
                  :style="{ width: `${(count / totalDevices) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500">No device data available</div>
        </div>
      </div>
    </div>

    <!-- Top Resources and Popular Searches -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Top Resources -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Top Resources
          </h3>
        </div>
        <ul class="divide-y divide-gray-200">
          <li
            v-for="(resource, index) in dashboardMetrics.topResources"
            :key="resource.resourceId"
            class="px-4 py-4 sm:px-6"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-sm font-medium text-indigo-600 mr-2"
                  >{{ index + 1 }}.</span
                >
                <span class="text-sm font-medium text-gray-900">{{
                  resource.resourceId
                }}</span>
              </div>
              <div class="flex space-x-4 text-sm text-gray-500">
                <span>Clicks: {{ resource.clicks }}</span>
                <span>Views: {{ resource.views }}</span>
                <span>Bookmarks: {{ resource.bookmarks }}</span>
              </div>
            </div>
          </li>
        </ul>
        <div
          v-if="dashboardMetrics.topResources.length === 0"
          class="px-4 py-12 text-center text-gray-500"
        >
          No resource data available
        </div>
      </div>

      <!-- Popular Searches -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Popular Searches
          </h3>
        </div>
        <ul class="divide-y divide-gray-200">
          <li
            v-for="(search, index) in dashboardMetrics.popularSearches"
            :key="index"
            class="px-4 py-4 sm:px-6"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-sm font-medium text-indigo-600 mr-2"
                  >{{ index + 1 }}.</span
                >
                <span class="text-sm font-medium text-gray-900">{{
                  search.query
                }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <span>{{ search.count }} searches</span>
                <span
                  v-if="search.noResults"
                  class="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                  >No results</span
                >
              </div>
            </div>
          </li>
        </ul>
        <div
          v-if="dashboardMetrics.popularSearches.length === 0"
          class="px-4 py-12 text-center text-gray-500"
        >
          No search data available
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DashboardMetrics {
  totalPageViews: number
  uniqueVisitors: number
  avgSessionDuration: number
  topResources: any[]
  popularSearches: any[]
  userGrowth: { date: string; count: number }[]
  monthlyActiveUsers: number
  weeklyActiveUsers: number
  dailyActiveUsers: number
  bounceRate: number
}

const props = defineProps<{
  dashboardMetrics: DashboardMetrics
  deviceDistribution: Record<string, number>
}>()

const totalDevices = computed(() => {
  return Object.values(props.deviceDistribution).reduce(
    (sum, count) => sum + count,
    0
  )
})

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
</script>
