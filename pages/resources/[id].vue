<template>
  <div class="py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb Navigation -->
      <ResourceBreadcrumbs :title="resource?.title || ''" />

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow rounded-lg p-6 animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div class="h-32 bg-gray-200 rounded mb-6"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error || !resource" class="text-center py-12">
        <div class="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p class="text-red-600 text-lg mb-4">
          {{ error || 'Resource not found' }}
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
        >
          Back to Home
        </NuxtLink>
      </div>

      <!-- Resource Detail Content -->
      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <ResourceHeader
          :title="resource.title"
          :category="resource.category"
          :status="resource.status"
          :health-score="resource.healthScore"
          :url="resource.url"
        />

        <div class="p-6">
          <ResourceDetails
            :title="resource.title"
            :description="resource.description"
            :benefits="resource.benefits"
            :screenshots="resource.screenshots"
            :specifications="resource.specifications"
            :features="resource.features"
            :limitations="resource.limitations"
            :status="resource.status"
            :migration-path="resource.migrationPath"
            :deprecation-date="resource.deprecationDate"
            @image-error="handleImageError"
          />

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-2">
              <ResourceAnalytics :analytics-data="analyticsData" />
            </div>

            <!-- Sidebar -->
            <div class="md:col-span-1">
              <!-- Resource Status and Lifecycle -->
              <div
                v-if="resource.statusHistory || resource.updateHistory"
                class="mb-8"
              >
                <h3 class="text-lg font-medium text-gray-900 mb-3">
                  Lifecycle
                </h3>
                <LifecycleTimeline
                  :status-history="resource.statusHistory"
                  :update-history="resource.updateHistory"
                />
              </div>

              <!-- Health Monitor -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Health</h3>
                <HealthMonitor :resource-id="resource.id" :url="resource.url" />
              </div>

              <!-- Tags -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in resource.tags"
                    :key="tag"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Technologies -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">
                  Technologies
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tech in resource.technology"
                    :key="tech"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>

              <ResourceShare :share-urls="shareUrls" @copy="copyToClipboard" />
            </div>
          </div>
        </div>
      </div>

      <ResourceSimilar :resources="relatedResources" />

      <!-- Alternative Suggestions Section -->
      <div class="mt-12">
        <AlternativeSuggestions v-if="resource" :resource="resource" />
      </div>

      <ResourceComments
        :comments="sampleComments"
        :comment-count="3"
        @submit="handleCommentSubmit"
      />

      <!-- Recommendations Section -->
      <div class="mt-12">
        <RecommendationsSection
          :current-resource="resource"
          :current-category="resource?.category"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResources, type Resource } from '~/composables/useResources'
import ResourceBreadcrumbs from '~/components/ResourceBreadcrumbs.vue'
import ResourceHeader from '~/components/ResourceHeader.vue'
import ResourceDetails from '~/components/ResourceDetails.vue'
import ResourceAnalytics from '~/components/ResourceAnalytics.vue'
import ResourceShare from '~/components/ResourceShare.vue'
import ResourceSimilar from '~/components/ResourceSimilar.vue'
import ResourceComments from '~/components/ResourceComments.vue'
import RecommendationsSection from '~/components/RecommendationsSection.vue'
import AlternativeSuggestions from '~/components/AlternativeSuggestions.vue'
import logger from '~/utils/logger'

import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig, useSeoMeta } from '#imports'
import { useNuxtApp } from '#app'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import { useHead } from '#imports'
import { generateResourceShareUrls } from '~/utils/shareUtils'
import { trackResourceView } from '~/utils/analytics'

const route = useRoute()
const { resources, loading: resourcesLoading } = useResources()
const loading = ref(true)
const error = ref<string | null>(null)
const resource = ref<Resource | null>(null)
const relatedResources = ref<Resource[]>([])
const analyticsData = ref<any>(null)
const resourceStats = ref({
  viewCount: 0,
  trending: false,
  lastViewed: '',
})

const sampleComments = ref([
  {
    id: '1',
    author: 'Jane Doe',
    text: "I've been using this for a few months now and it's been really helpful for my development workflow.",
    timeAgo: '2 days ago',
    likes: 12,
  },
  {
    id: '2',
    author: 'John Smith',
    text: "The free tier limitations are a bit restrictive, but overall it's a great service.",
    timeAgo: '1 week ago',
    likes: 5,
  },
])

const handleCommentSubmit = (comment: string) => {
  logger.info('New comment:', comment)
}

// Get current URL for sharing
const currentUrl = computed(() => {
  const runtimeConfig = useRuntimeConfig()
  return `${runtimeConfig.public.canonicalUrl}/resources/${route.params.id}`
})

// Handle image error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/placeholder-image.jpg' // fallback image
}

// Get button label based on category
const getButtonLabel = (category: string) => {
  const categoryLabels: Record<string, string> = {
    'AI Tools': 'Try AI Tool',
    Hosting: 'Get Hosting',
    Databases: 'Connect Database',
    CDN: 'Use CDN',
    VPS: 'Get VPS',
    Analytics: 'Use Analytics',
    APIs: 'Use API',
    'Developer Tools': 'Use Tool',
    Design: 'Use Design Tool',
    Productivity: 'Boost Productivity',
  }
  return categoryLabels[category] || 'Get Resource'
}

// Enhanced related resources based on tags and category
const getEnhancedRelatedResources = (currentResource: Resource | null) => {
  if (!currentResource) return []

  // First get resources by category
  let categoryResources = resources.value.filter(
    r => r.category === currentResource.category && r.id !== currentResource.id
  )

  // If we don't have enough, get resources by tags
  if (categoryResources.length < 3) {
    const tagBasedResources = resources.value
      .filter(
        r =>
          r.id !== currentResource.id &&
          r.tags.some(tag => currentResource.tags.includes(tag))
      )
      .filter(r => !categoryResources.some(cr => cr.id === r.id)) // Avoid duplicates

    // Combine and limit to 6 total
    const combined = [...categoryResources, ...tagBasedResources].slice(0, 6)

    // Sort by relevance: category first, then tag matches
    return combined
      .sort((a, b) => {
        const aByCategory = a.category === currentResource.category ? 1 : 0
        const bByCategory = b.category === currentResource.category ? 1 : 0
        if (aByCategory !== bByCategory) return bByCategory - aByCategory

        // If same category status, sort by number of matching tags
        const aTagMatches = a.tags.filter(tag =>
          currentResource.tags.includes(tag)
        ).length
        const bTagMatches = b.tags.filter(tag =>
          currentResource.tags.includes(tag)
        ).length
        return bTagMatches - aTagMatches
      })
      .slice(0, 3)
  }

  return categoryResources.slice(0, 3)
}

// Fetch resource by ID
onMounted(async () => {
  try {
    // Wait for resources to load
    const loadResource = async () => {
      const resourceId = route.params.id as string
      resource.value = resources.value.find(r => r.id === resourceId) || null
      if (!resource.value) {
        error.value = 'Resource not found'
      } else {
        // Use the enhanced recommendation engine to find related resources
        const engine = useRecommendationEngine(resources.value)
        const recommendations = engine
          .getContentBasedRecommendations(resource.value!)
          .filter(rec => rec.resource.id !== resource.value?.id)
          .slice(0, 3) // Limit to 3 related resources

        relatedResources.value = recommendations.map(rec => rec.resource)

        // Get enhanced related resources
        relatedResources.value = getEnhancedRelatedResources(resource.value)

        // Fetch analytics data for this resource
        fetchResourceAnalytics(resourceId)

        // Fetch resource history (status and update history)
        fetchResourceHistory(resourceId)

        // Track resource view
        await trackResourceView(
          resource.value.id,
          resource.value.title,
          resource.value.category
        )

        // Set basic stats (in a real implementation, fetch from API)
        resourceStats.value = {
          viewCount: Math.floor(Math.random() * 1000) + 100, // Simulated view count
          trending: Math.random() > 0.5, // Simulated trending status
          lastViewed: new Date().toISOString(),
        }
      }
      loading.value = false
    }

    if (resourcesLoading.value) {
      // We need to wait until resources are loaded
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
  } catch (err) {
    error.value = 'Failed to load resource'
    loading.value = false
  }
})

// Fetch resource history (status and update history)
const fetchResourceHistory = async (resourceId: string) => {
  try {
    const history = await $fetch(`/api/resources/${resourceId}/history`)
    if (history) {
      // Update resource with history data
      if (resource.value) {
        resource.value.statusHistory = history.statusHistory
        resource.value.updateHistory = history.updateHistory
      }
    }
  } catch (err) {
    logger.error('Error fetching resource history:', err)
    // If history fetch fails, continue without history data
  }
}

// Fetch analytics data for the resource
const fetchResourceAnalytics = async (resourceId: string) => {
  try {
    const response = await $fetch(`/api/analytics/resource/${resourceId}`)
    if (response && response.data) {
      analyticsData.value = response.data
    }
  } catch (err) {
    logger.error('Error fetching resource analytics:', err)
    // Set default values if analytics fetch fails
    analyticsData.value = {
      resourceId,
      viewCount: resource.value?.viewCount || 0,
      uniqueVisitors: 0,
      avgTimeOnPage: 0,
      bounceRate: 0,
      lastViewed: new Date().toISOString(),
    }
  }
}

// Copy URL to clipboard
const copyToClipboard = async () => {
  try {
    // Modern clipboard API approach
    await navigator.clipboard.writeText(currentUrl.value)
    // We could add a toast notification here in the future
  } catch (err) {
    // Fallback for older browsers that don't support Clipboard API
    try {
      // Try to use the deprecated execCommand as a last resort
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl.value
      // Avoid scrolling to the bottom
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
      textArea.setSelectionRange(0, 99999) // For mobile devices
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (!successful) {
        throw new Error('execCommand copy failed')
      }
    } catch (fallbackErr) {
      console.error('Failed to copy to clipboard:', fallbackErr)
      // Optionally show an error message to the user
    }
  }
}

// Generate share URLs with UTM parameters
const shareUrls = computed(() => {
  if (!resource.value) return {}
  return generateResourceShareUrls(
    currentUrl.value,
    resource.value.title,
    resource.value.description
  )
})

// Track resource view when the resource is loaded and update analytics data
if (resource.value) {
  // Use the analytics plugin to track the resource view
  const { $analytics } = useNuxtApp()
  if ($analytics && $analytics.trackResourceView) {
    $analytics.trackResourceView(
      resource.value.id,
      resource.value.title,
      resource.value.category
    )

    // Update the view count in the resource analytics data
    if (analyticsData.value) {
      analyticsData.value.viewCount = (analyticsData.value.viewCount || 0) + 1
    }
  }
}

// Set dynamic meta tags for the resource
const { title, description } = resource.value || {}
if (title && description) {
  useSeoMeta({
    title: `${title} - Free Resources for Developers`,
    ogTitle: `${title} - Free Resources for Developers`,
    description: `${description} - Discover this and other amazing free resources on Free Stuff on the Internet.`,
    ogDescription: `${description} - Discover this and other amazing free resources on Free Stuff on the Internet.`,
    ogUrl: currentUrl.value,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    // Enhanced SEO with structured data
    articlePublishedTime: resource.value?.dateAdded,
    articleModifiedTime: resource.value?.dateAdded,
  })

  // Add JSON-LD structured data for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication', // or 'WebSite' depending on the resource type
    name: resource.value.title,
    description: resource.value.description,
    url: resource.value.url,
    applicationCategory: resource.value.category,
    isBasedOn: resource.value.url,
    datePublished: resource.value.dateAdded,
    offers: {
      '@type': 'Offer',
      price: '0', // Free tier
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: resource.value.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: resource.value.rating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: resource.value.viewCount || 10, // Use view count as rating count if available
        }
      : undefined,
    keywords: resource.value.tags.join(', '),
    thumbnailUrl: resource.value.icon || undefined,
    operatingSystem: resource.value.platforms
      ? resource.value.platforms.join(', ')
      : undefined,
    softwareVersion: undefined, // Add version if available
  }

  // Remove undefined properties
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key]
    }
  })

  // Safely serialize JSON-LD to prevent XSS by escaping special characters
  const safeJsonLd = JSON.stringify(structuredData)
    .replace(/</g, '\\u003c') // Escape < to prevent script tags
    .replace(/>/g, '\\u003e') // Escape > to prevent script tags
    .replace(/\//g, '\\u002f') // Escape / to prevent closing script tags

  // Add the structured data to the page
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: safeJsonLd,
      },
    ],
  })
}
</script>
