import { ref, computed, readonly } from 'vue'
import { logError } from '~/utils/errorLogger'
import logger from '~/utils/logger'

interface EventsByType {
  page_view?: number
  resource_click?: number
  search?: number
  [key: string]: number | undefined
}

interface DailyTrend {
  date: string
  count: number
}

interface TopResource {
  id: string
  title: string
  views: number
}

interface TopCategory {
  name: string
  count: number
}

interface AnalyticsData {
  totalEvents: number
  eventsByType: EventsByType
  eventsByCategory: Record<string, number>
  resourceViews: Record<string, number>
  topResources: TopResource[]
  topCategories: TopCategory[]
  dailyTrends: DailyTrend[]
}

export const useAnalyticsPage = () => {
  const analyticsData = ref<AnalyticsData | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const startDate = ref('')
  const endDate = ref('')

  const initializeDateRange = () => {
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)

    startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
    endDate.value = now.toISOString().split('T')[0]
  }

  const maxDailyCount = computed(() => {
    if (!analyticsData.value?.dailyTrends) return 1
    return Math.max(...analyticsData.value.dailyTrends.map(day => day.count), 1)
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

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

      analyticsData.value = data.data
    } catch (err) {
      const errorObj = err as Error
      logError(
        `Failed to fetch analytics data: ${errorObj.message}`,
        errorObj,
        'useAnalyticsPage',
        { startDate: startDate.value, endDate: endDate.value }
      )
      logger.error('Error fetching analytics:', err)
      error.value = errorObj.message || 'Failed to load analytics data'
    } finally {
      loading.value = false
    }
  }

  initializeDateRange()

  return {
    analyticsData: readonly(analyticsData),
    loading: readonly(loading),
    error: readonly(error),
    startDate: readonly(startDate),
    endDate: readonly(endDate),
    maxDailyCount,
    formatDate,
    fetchAnalyticsData,
  }
}
