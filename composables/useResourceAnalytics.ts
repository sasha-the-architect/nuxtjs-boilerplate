import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'
import logger from '~/utils/logger'

export interface ResourceAnalytics {
  resourceId: string
  viewCount: number
  uniqueVisitors: number
  avgTimeOnPage: number
  bounceRate: number
  lastViewed: string
}

export const useResourceAnalytics = () => {
  const analytics = ref<Record<string, ResourceAnalytics>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchResourceAnalytics = async (resourceId: string) => {
    try {
      loading.value = true
      error.value = null

      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.get<ResourceAnalytics>(
        `/api/analytics/resource/${resourceId}`
      )

      if (response.success && response.data) {
        analytics.value[resourceId] = response.data
      } else {
        // Fallback to default values if no analytics data
        analytics.value[resourceId] = {
          resourceId,
          viewCount: 0,
          uniqueVisitors: 0,
          avgTimeOnPage: 0,
          bounceRate: 0,
          lastViewed: new Date().toISOString(),
        }
      }
    } catch (err) {
      logger.error('Error fetching resource analytics:', err)
      error.value = 'Failed to load analytics data'

      // Set default values in case of error
      analytics.value[resourceId] = {
        resourceId,
        viewCount: 0,
        uniqueVisitors: 0,
        avgTimeOnPage: 0,
        bounceRate: 0,
        lastViewed: new Date().toISOString(),
      }
    } finally {
      loading.value = false
    }
  }

  const getViewCount = (resourceId: string) => {
    return analytics.value[resourceId]?.viewCount || 0
  }

  const getUniqueVisitors = (resourceId: string) => {
    return analytics.value[resourceId]?.uniqueVisitors || 0
  }

  const getAvgTimeOnPage = (resourceId: string) => {
    return analytics.value[resourceId]?.avgTimeOnPage || 0
  }

  const getBounceRate = (resourceId: string) => {
    return analytics.value[resourceId]?.bounceRate || 0
  }

  return {
    analytics: computed(() => analytics.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchResourceAnalytics,
    getViewCount,
    getUniqueVisitors,
    getAvgTimeOnPage,
    getBounceRate,
  }
}
