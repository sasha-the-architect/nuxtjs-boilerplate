import { ref, computed, onMounted } from 'vue'
import type { SearchAnalyticsData } from '~/types/analytics'
import { logError } from '~/utils/errorLogger'
import type { ApiResponse, ApiClient } from '~/utils/api-client'
import { useNuxtApp } from '#app'

interface UseSearchAnalyticsOptions {
  apiClient?: ApiClient
}

export function useSearchAnalytics(options: UseSearchAnalyticsOptions = {}) {
  const { apiClient: providedClient } = options
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
      const client =
        providedClient ||
        (() => {
          const { $apiClient } = useNuxtApp()
          return $apiClient
        })()
      const response: ApiResponse<SearchAnalyticsData> = await client.get(
        '/api/analytics/search',
        {
          params: {
            days: timeRange.value,
          },
        }
      )

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || 'Failed to fetch search analytics data'
        )
      }

      searchAnalytics.value = response.data
    } catch (err: unknown) {
      logError(
        'Error fetching search analytics:',
        err instanceof Error ? err : undefined,
        'useSearchAnalytics'
      )
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
