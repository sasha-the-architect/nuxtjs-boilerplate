/**
 * Composable for resource detail page
 * Orchestrates resource loading, analytics, SEO, and UI interactions
 *
 * Architecture Principles:
 * - Single Responsibility: Coordinates multiple single-responsibility utilities
 * - Separation of Concerns: Delegates to specialized utilities
 * - Orchestrator Pattern: Manages data flow between utilities
 */
import { computed, ref, onMounted } from 'vue'
import {
  useRoute,
  useRuntimeConfig,
  useNuxtApp,
  useSeoMeta,
  useHead,
} from '#app'
import logger from '~/utils/logger'
import type { Resource } from '~/types/resource'
import { useResources } from '~/composables/useResources'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import { generateResourceShareUrls } from '~/utils/shareUtils'
import { trackResourceView } from '~/utils/analytics'
import { generateSeoData } from '~/utils/seo'
import { copyToClipboard } from '~/utils/clipboard'

export const useResourceDetailPage = () => {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const { resources, loading: resourcesLoading } = useResources()
  const { $analytics } = useNuxtApp()

  const loading = ref(true)
  const error = ref<string | null>(null)
  const resource = ref<Resource | null>(null)
  const relatedResources = ref<Resource[]>([])
  const analyticsData = ref<Record<string, unknown> | null>(null)
  const resourceStats = ref({
    viewCount: 0,
    trending: false,
    lastViewed: '',
  })

  const resourceId = computed(() => {
    return typeof route.params.id === 'string' ? route.params.id : ''
  })

  const currentUrl = computed(() => {
    return `${runtimeConfig.public.canonicalUrl}/resources/${resourceId.value}`
  })

  const shareUrls = computed(() => {
    if (!resource.value) return {}
    return generateResourceShareUrls(
      currentUrl.value,
      resource.value.title,
      resource.value.description
    )
  })

  const getEnhancedRelatedResources = (currentResource: Resource | null) => {
    if (!currentResource) return []

    const engine = useRecommendationEngine(resources.value, {})
    return engine.getDiverseRecommendations(
      currentResource,
      currentResource.category
    )
  }

  const fetchResourceHistory = async (id: string) => {
    try {
      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.get<{
        statusHistory: unknown[]
        updateHistory: unknown[]
      }>(`/api/resources/${id}/history`)

      if (response.success && response.data && resource.value) {
        resource.value.statusHistory = response.data.statusHistory
        resource.value.updateHistory = response.data.updateHistory
      }
    } catch (err) {
      logger.error('Error fetching resource history:', err)
    }
  }

  const fetchResourceAnalytics = async (id: string) => {
    try {
      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.get<Record<string, unknown>>(
        `/api/analytics/resource/${id}`
      )

      if (response.success && response.data) {
        analyticsData.value = response.data
      }
    } catch (err) {
      logger.error('Error fetching resource analytics:', err)
      analyticsData.value = {
        resourceId: id,
        viewCount: resource.value?.viewCount || 0,
        uniqueVisitors: 0,
        avgTimeOnPage: 0,
        bounceRate: 0,
        lastViewed: new Date().toISOString(),
      }
    }
  }

  const trackView = async () => {
    if (!resource.value) return

    try {
      await trackResourceView(
        resource.value.id,
        resource.value.title,
        resource.value.category
      )

      if ($analytics && $analytics.trackResourceView) {
        $analytics.trackResourceView(
          resource.value.id,
          resource.value.title,
          resource.value.category
        )
      }

      if (analyticsData.value) {
        analyticsData.value.viewCount =
          ((analyticsData.value.viewCount as number) || 0) + 1
      }
    } catch (err) {
      logger.error('Error tracking resource view:', err)
    }
  }

  const handleCopyToClipboard = async () => {
    const result = await copyToClipboard(currentUrl.value)
    if (!result.success && result.error) {
      logger.error('Failed to copy to clipboard:', result.error)
    }
  }

  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = '/placeholder-image.jpg'
  }

  const handleCommentSubmit = (comment: string) => {
    logger.info('New comment:', comment)
  }

  const setSeoMetadata = () => {
    if (!resource.value) return

    const { seoMeta, structuredData } = generateSeoData(
      resource.value,
      currentUrl.value
    )

    useSeoMeta(seoMeta)

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: structuredData,
        },
      ],
    })
  }

  const loadResource = async () => {
    try {
      if (!resourceId.value) {
        throw new Error('Invalid resource ID')
      }

      const foundResource = resources.value.find(r => r.id === resourceId.value)

      if (!foundResource) {
        throw new Error('Resource not found')
      }

      resource.value = foundResource
      relatedResources.value = getEnhancedRelatedResources(resource.value)
      await fetchResourceAnalytics(resourceId.value)
      await fetchResourceHistory(resourceId.value)
      await trackView()

      resourceStats.value = {
        viewCount: Math.floor(Math.random() * 1000) + 100,
        trending: Math.random() > 0.5,
        lastViewed: new Date().toISOString(),
      }

      setSeoMetadata()
    } catch (err) {
      logger.error('Error loading resource:', err)
      error.value = 'Failed to load resource'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (resourcesLoading.value) {
      const checkResources = () => {
        if (!resourcesLoading.value) {
          loadResource()
        } else {
          setTimeout(checkResources, 100)
        }
      }
      checkResources()
    } else {
      loadResource()
    }
  })

  return {
    loading,
    error,
    resource,
    relatedResources,
    analyticsData,
    resourceStats,
    resourceId,
    currentUrl,
    shareUrls,
    copyToClipboard: handleCopyToClipboard,
    handleImageError,
    handleCommentSubmit,
    loadResource,
  }
}
