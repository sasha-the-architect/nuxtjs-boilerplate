import { computed, ref, watch } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useNuxtApp } from '#app'
import logger from '~/utils/logger'
import type { Resource } from '~/types/resource'
import type { ComparisonCriteria } from '~/types/comparison'
import { useResourceComparison } from '~/composables/useResourceComparison'

interface UseComparisonPageOptions {
  autoFetch?: boolean
}

export const useComparisonPage = (options?: UseComparisonPageOptions) => {
  const route = useRoute()
  const { config: comparisonConfig } = useResourceComparison()

  // State
  const loading = ref(true)
  const error = ref<string | null>(null)
  const resources = ref<Resource[]>([])

  // Get resource IDs from route
  const resourceIds = computed(() => {
    if (typeof route.params.ids === 'string') {
      return route.params.ids.split(',')
    }
    return []
  })

  // Default comparison criteria from config
  const defaultCriteria = computed<ComparisonCriteria[]>(
    () => comparisonConfig.value.defaultCriteria
  )

  // Fetch comparison data
  const fetchComparison = async () => {
    try {
      loading.value = true
      error.value = null

      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.get<{ resources: Resource[] }>(
        '/api/v1/comparisons',
        {
          params: {
            ids: resourceIds.value.join(','),
          },
        }
      )

      if (response.success && response.data) {
        resources.value = response.data.resources || []
      } else {
        error.value = response.error?.message || 'Failed to load comparison'
      }
    } catch (err) {
      logger.error('Error fetching comparison:', err)
      error.value =
        err.data?.statusMessage || err.message || 'Failed to load comparison'
    } finally {
      loading.value = false
    }
  }

  // Watch for route changes and fetch new data
  if (options?.autoFetch !== false) {
    watch(
      resourceIds,
      () => {
        if (resourceIds.value.length > 0) {
          fetchComparison()
        }
      },
      { immediate: true }
    )
  }

  // Page metadata
  const title = computed(() => {
    if (resources.value.length > 0) {
      const titles = resources.value.slice(0, 3).map(r => r.title)
      if (resources.value.length > 3) {
        return `Compare ${titles.join(' vs ')} and ${resources.value.length - 3} more`
      }
      return `Compare ${titles.join(' vs ')}`
    }
    return 'Resource Comparison'
  })

  // Handle remove resource
  const handleRemoveResource = (resourceId: string) => {
    const newIds = resourceIds.value.filter(id => id !== resourceId)
    if (newIds.length > 0) {
      navigateTo(`/compare/${newIds.join(',')}`)
    } else {
      navigateTo('/compare')
    }
  }

  return {
    // State
    loading,
    error,
    resources,

    // Computed
    resourceIds,
    defaultCriteria,
    title,

    // Methods
    fetchComparison,
    handleRemoveResource,
  }
}
