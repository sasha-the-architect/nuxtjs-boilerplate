<template>
  <div
    v-if="analyticsData"
    class="mb-8 bg-gray-50 p-6 rounded-lg"
  >
    <h2 class="text-xl font-semibold text-gray-900 mb-4">
      Resource Analytics
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-500">
          Total Views
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-1">
          {{ formatNumber(analyticsData.viewCount) }}
        </div>
      </div>
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-500">
          Unique Visitors
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-1">
          {{ formatNumber(analyticsData.uniqueVisitors) }}
        </div>
      </div>
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-500">
          Last Viewed
        </div>
        <div class="text-lg text-gray-900 mt-1">
          {{ formatDate(analyticsData.lastViewed) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AnalyticsData {
  viewCount: number
  uniqueVisitors: number
  lastViewed: string
}

interface Props {
  analyticsData: AnalyticsData | null
}

const props = defineProps<Props>()

// Use props to avoid eslint warning
void props.analyticsData

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>
