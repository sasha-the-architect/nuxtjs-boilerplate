import { computed, ref, onMounted } from 'vue'
import { useRoute, useRuntimeConfig, useNuxtApp } from '#app'
import { useSeoMeta, useHead } from '#imports'
import logger from '~/utils/logger'
import type { Resource } from '~/types/resource'
import type { Comment } from '~/types/community'
import { useResources } from '~/composables/useResources'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import { generateResourceShareUrls } from '~/utils/shareUtils'
import { trackResourceView } from '~/utils/analytics'

export const useResourceDetailPage = () => {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const { resources, loading: resourcesLoading } = useResources()
  const { $analytics } = useNuxtApp()

  // State
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

  // Sample comments data
  const sampleComments = ref<Comment[]>([
    {
      id: '1',
      resourceId: '',
      content:
        "I've been using this for a few months now and it's been really helpful for my development workflow.",
      userId: 'user-1',
      userName: 'Jane Doe',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      votes: 12,
      replies: [],
      isEdited: false,
      status: 'active',
    },
    {
      id: '2',
      resourceId: '',
      content:
        "The free tier limitations are a bit restrictive, but overall it's a great service.",
      userId: 'user-2',
      userName: 'John Smith',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      votes: 5,
      replies: [],
      isEdited: false,
      status: 'active',
    },
  ])

  // Get resource ID from route params
  const resourceId = computed(() => {
    return typeof route.params.id === 'string' ? route.params.id : ''
  })

  // Get current URL for sharing
  const currentUrl = computed(() => {
    return `${runtimeConfig.public.canonicalUrl}/resources/${resourceId.value}`
  })

  // Generate share URLs with UTM parameters
  const shareUrls = computed(() => {
    if (!resource.value) return {}
    return generateResourceShareUrls(
      currentUrl.value,
      resource.value.title,
      resource.value.description
    )
  })

  // Enhanced related resources based on tags and category
  const getEnhancedRelatedResources = (currentResource: Resource | null) => {
    if (!currentResource) return []

    const engine = useRecommendationEngine(resources.value, {})
    return engine.getDiverseRecommendations(
      currentResource,
      currentResource.category
    )
  }

  // Fetch resource history (status and update history)
  const fetchResourceHistory = async (id: string) => {
    try {
      const history = await $fetch(`/api/resources/${id}/history`)
      if (history && resource.value) {
        resource.value.statusHistory = history.statusHistory
        resource.value.updateHistory = history.updateHistory
      }
    } catch (err) {
      logger.error('Error fetching resource history:', err)
    }
  }

  // Fetch analytics data for the resource
  const fetchResourceAnalytics = async (id: string) => {
    try {
      const response = await $fetch(`/api/analytics/resource/${id}`)
      if (response && response.data) {
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

  // Track resource view
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

  // Copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl.value)
    } catch {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = currentUrl.value
        textArea.setAttribute('readonly', '')
        textArea.style.cssText = `
          position: absolute;
          left: -9999px;
          top: -9999px;
          opacity: 0;
          pointer-events: none;
        `
        document.body.appendChild(textArea)
        textArea.select()
        textArea.setSelectionRange(0, 99999)
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (!successful) {
          throw new Error('execCommand copy failed')
        }
      } catch (fallbackErr) {
        console.error('Failed to copy to clipboard:', fallbackErr)
      }
    }
  }

  // Handle image error
  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = '/placeholder-image.jpg'
  }

  // Handle comment submit
  const handleCommentSubmit = (comment: string) => {
    logger.info('New comment:', comment)
  }

  // Set SEO meta tags and JSON-LD structured data
  const setSeoMetadata = () => {
    const { title, description } = resource.value || {}
    if (!title || !description) return

    useSeoMeta({
      title: `${title} - Free Resources for Developers`,
      ogTitle: `${title} - Free Resources for Developers`,
      description: `${description} - Discover this and other amazing free resources on Free Stuff on the Internet.`,
      ogDescription: `${description} - Discover this and other amazing free resources on Free Stuff on the Internet.`,
      ogUrl: currentUrl.value,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      articlePublishedTime: resource.value.dateAdded,
      articleModifiedTime: resource.value.dateAdded,
    })

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: resource.value.title,
      description: resource.value.description,
      url: resource.value.url,
      applicationCategory: resource.value.category,
      isBasedOn: resource.value.url,
      datePublished: resource.value.dateAdded,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: resource.value.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: resource.value.rating,
            bestRating: 5,
            worstRating: 1,
            ratingCount: resource.value.viewCount || 10,
          }
        : undefined,
      keywords: resource.value.tags.join(', '),
      thumbnailUrl: resource.value.icon,
      operatingSystem: resource.value.platforms
        ? resource.value.platforms.join(', ')
        : undefined,
    }

    Object.keys(structuredData).forEach((key: string) => {
      if ((structuredData as Record<string, unknown>)[key] === undefined) {
        delete (structuredData as Record<string, unknown>)[key]
      }
    })

    const safeJsonLd = JSON.stringify(structuredData)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/\//g, '\\u002f')

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: safeJsonLd,
        },
      ],
    })
  }

  // Load resource data
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

  // Initialize on mount
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
    // State
    loading,
    error,
    resource,
    relatedResources,
    analyticsData,
    resourceStats,
    sampleComments,

    // Computed
    resourceId,
    currentUrl,
    shareUrls,

    // Methods
    copyToClipboard,
    handleImageError,
    handleCommentSubmit,
    loadResource,
  }
}
