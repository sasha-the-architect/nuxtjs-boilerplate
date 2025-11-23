<template>
  <div class="py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb Navigation -->
      <nav class="mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2 text-sm">
          <li>
            <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">
              Home
            </NuxtLink>
          </li>
          <li>
            <span class="mx-2 text-gray-400">/</span>
          </li>
          <li>
            <NuxtLink to="/search" class="text-blue-600 hover:text-blue-800">
              Resources
            </NuxtLink>
          </li>
          <li>
            <span class="mx-2 text-gray-400">/</span>
          </li>
          <li class="text-gray-500 truncate" aria-current="page">
            {{ resource?.title }}
          </li>
        </ol>
      </nav>

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
        <!-- Resource Header -->
        <div class="p-6 border-b border-gray-200">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div>
              <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
                {{ resource.title }}
              </h1>
              <p class="mt-2 text-gray-600">
                {{ resource.category }}
              </p>
            </div>
            <div class="mt-4 sm:mt-0">
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200"
              >
                Visit Resource
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ml-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Resource Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="md:col-span-2">
              <!-- Description -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <p class="text-gray-700 leading-relaxed">
                  {{ resource.description }}
                </p>
              </div>

              <!-- Free Tier Benefits -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Free Tier Benefits
                </h2>
                <ul class="space-y-2">
                  <li
                    v-for="(benefit, index) in resource.benefits"
                    :key="index"
                    class="flex items-start"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-gray-700">{{ benefit }}</span>
                  </li>
                </ul>
              </div>

              <!-- Additional Information -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Additional Information
                </h2>
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Pricing Model
                    </dt>
                    <dd class="mt-1 text-gray-900">
                      {{ resource.pricingModel }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Difficulty
                    </dt>
                    <dd class="mt-1 text-gray-900">
                      {{ resource.difficulty }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Date Added
                    </dt>
                    <dd class="mt-1 text-gray-900">
                      {{ formatDate(resource.dateAdded) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Popularity
                    </dt>
                    <dd class="mt-1 text-gray-900">
                      <div class="flex items-center">
                        <span class="mr-2">{{ resource.popularity }}/5</span>
                        <div class="flex">
                          <svg
                            v-for="star in 5"
                            :key="star"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            :class="
                              star <= resource.popularity
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            "
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                        </div>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="md:col-span-1">
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

              <!-- Share Section -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Share</h3>
                <div class="flex space-x-3">
                  <a
                    :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(resource.title)}&url=${encodeURIComponent(currentUrl)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                      />
                    </svg>
                  </a>
                  <a
                    :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                  </a>
                  <a
                    :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 rounded-full bg-blue-800 text-white hover:bg-blue-900 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Resources Section -->
      <div v-if="relatedResources && relatedResources.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ResourceCard
            v-for="resource in relatedResources"
            :key="resource.id"
            :title="resource.title"
            :description="resource.description"
            :benefits="resource.benefits"
            :url="resource.url"
            :button-label="getButtonLabel(resource.category)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResources, type Resource } from '~/composables/useResources'
import ResourceCard from '~/components/ResourceCard.vue'
import { computed } from 'vue'

// Get the resource ID from the route
const route = useRoute()
const resourceId = computed(() => route.params.id as string)

// Get current URL for sharing
const currentUrl = computed(() => {
  if (process.client) {
    return window.location.href
  }
  return `https://free-stuff-on-the-internet.vercel.app/resources/${resourceId.value}`
})

// Use the resources composable
const { resources, loading, error: resourcesError } = useResources()

// Find the specific resource
const resource = computed(() => {
  if (!resources.value || !resourceId.value) return null
  return resources.value.find(r => r.id === resourceId.value) || null
})

// Get related resources based on category and tags
const relatedResources = computed(() => {
  if (!resource.value || !resources.value) return []

  // Calculate similarity score for each resource
  const calculateSimilarity = (r: any) => {
    let score = 0

    // Category match gives high score
    if (r.category === resource.value?.category) {
      score += 10
    }

    // Tag matches give additional score
    const commonTags = r.tags.filter((tag: string) =>
      resource.value?.tags.includes(tag)
    ).length
    score += commonTags * 2

    // Technology matches give additional score
    const commonTech = r.technology.filter((tech: string) =>
      resource.value?.technology.includes(tech)
    ).length
    score += commonTech

    return score
  }

  // Filter out the current resource and calculate scores
  const related = resources.value
    .filter(r => r.id !== resource.value?.id)
    .map(r => ({
      resource: r,
      score: calculateSimilarity(r),
    }))
    .filter(item => item.score > 0) // Only include resources with some similarity
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, 6) // Get top 6 matches
    .map(item => item.resource) // Extract just the resource objects

  return related.slice(0, 3) // Return the top 3
})

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Handle error state
const error = computed(() => {
  if (resourcesError.value) return resourcesError.value
  if (resourceId.value && !resource.value) return 'Resource not found'
  return null
})

// Set page title and meta tags
useSeoMeta({
  title: () =>
    resource.value
      ? `${resource.value.title} - Free Stuff on the Internet`
      : 'Resource Details - Free Stuff on the Internet',
  ogTitle: () =>
    resource.value
      ? `${resource.value.title} - Free Stuff on the Internet`
      : 'Resource Details - Free Stuff on the Internet',
  description: () =>
    resource.value
      ? `${resource.value.description} - Discover this free resource and similar tools on Free Stuff on the Internet.`
      : 'Detailed information about free resources available on the internet.',
  ogDescription: () =>
    resource.value
      ? `${resource.value.description} - Discover this free resource and similar tools on Free Stuff on the Internet.`
      : 'Detailed information about free resources available on the internet.',
  ogImage: '/og-image.jpg',
  ogUrl: () => currentUrl.value,
  twitterCard: 'summary_large_image',
})

// Add structured data for the resource
const resourceSchema = computed(() => {
  if (!resource.value) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: resource.value.title,
    description: resource.value.description,
    url: currentUrl.value,
    applicationCategory: resource.value.category,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'USD',
      description: resource.value.pricingModel,
    },
    creator: {
      '@type': 'Organization',
      name: 'Free Stuff on the Internet',
    },
    datePublished: resource.value.dateAdded,
    keywords: [...resource.value.tags, ...resource.value.technology].join(', '),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: resource.value.popularity,
      bestRating: 5,
      worstRating: 1,
      ratingCount: 1, // Placeholder, would be dynamic in real implementation
    },
    featureList: resource.value.benefits,
    isAccessibleForFree: true,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: resource.value.pricingModel,
      itemListElement: resource.value.benefits.map(benefit => ({
        '@type': 'Offer',
        name: benefit,
      })),
    },
  }
})

// Add JSON-LD structured data to the head
if (resourceSchema.value) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(resourceSchema.value),
      },
    ],
  })
}

// Set page layout
definePageMeta({
  layout: 'default',
})

// Helper function to get button label based on category
const getButtonLabel = (category: string) => {
  switch (category.toLowerCase()) {
    case 'ai tools':
      return 'Explore AI Tool'
    case 'vps':
      return 'Get VPS'
    case 'web hosting':
      return 'Find Hosting'
    case 'databases':
      return 'Explore Database'
    case 'cdn':
      return 'Get CDN'
    default:
      return 'Get Free Access'
  }
}
</script>
