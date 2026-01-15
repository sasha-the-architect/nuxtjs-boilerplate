import { ref, computed, onMounted } from 'vue'
import type { SearchAnalyticsData } from '~/types/analytics'
import { logError } from '~/utils/errorLogger'

export function useSearchAnalytics() {
  const searchAnalytics = ref<SearchAnalyticsData | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const timeRange = ref('30')

  const maxSearchCount = computed(() => {
    if (!searchAnalytics.value?.data?.searchTrends) return 1
    return Math.max(
      ...searchAnalytics.value.data.searchTrends.map(day => day.count),
      1
    )
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

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
    } catch (err: unknown) {
      logError('Error fetching search analytics:', err, 'useSearchAnalytics')
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load search analytics data'
      error.value = errorMessage
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchSearchAnalytics()
  })

  return {
    searchAnalytics,
    loading,
    error,
    timeRange,
    maxSearchCount,
    formatDate,
    fetchSearchAnalytics,
  }
}
