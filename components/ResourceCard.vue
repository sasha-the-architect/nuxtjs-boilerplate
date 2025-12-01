<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    v-if="!hasError"
    class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300"
    role="article"
  >
    <div class="flex items-start">
      <div v-if="icon" class="flex-shrink-0 mr-4">
        <OptimizedImage
          :src="icon"
          :alt="title"
          width="48"
          height="48"
          format="webp"
          loading="lazy"
          quality="80"
          img-class="w-12 h-12 rounded object-contain"
          @error="handleImageError"
        />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3
            id="resource-title"
            class="text-lg font-medium text-gray-900 truncate"
          >
            <NuxtLink
              v-if="id"
              :to="`/resources/${id}`"
              class="hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded-sm"
              :aria-label="`View details for ${title}`"
            >
              <span
                v-if="highlightedTitle"
                v-html="sanitizedHighlightedTitle"
              ></span>
              <!-- eslint-disable-line vue/no-v-html -->
              <span v-else>{{ title }}</span>
            </NuxtLink>
            <span v-else>
              <span
                v-if="highlightedTitle"
                v-html="sanitizedHighlightedTitle"
              ></span>
              <!-- eslint-disable-line vue/no-v-html -->
              <span v-else>{{ title }}</span>
            </span>
          </h3>
          <!-- Resource status badge -->
          <ResourceStatus
            v-if="status"
            :status="status"
            :health-score="healthScore"
          />
        </div>
        <p id="resource-description" class="mt-1 text-gray-800 text-sm">
          <span
            v-if="highlightedDescription"
            v-html="sanitizedHighlightedDescription"
          ></span>
          <!-- eslint-disable-line vue/no-v-html -->
          <span v-else>{{ description }}</span>
        </p>
        <div
          class="mt-3 bg-gray-50 p-3 rounded-md"
          role="region"
          aria-label="Free tier information"
        >
          <p id="free-tier-label" class="font-medium text-gray-900 text-sm">
            Free Tier:
          </p>
          <ul class="mt-1 space-y-1 text-xs text-gray-800" role="list">
            <li v-for="(benefit, index) in benefits" :key="index">
              {{ benefit }}
            </li>
          </ul>
        </div>

        <!-- Similarity information (for alternative suggestions) -->
        <div v-if="similarityScore && similarityScore > 0" class="mt-3">
          <div class="flex items-center">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full"
                :style="{ width: `${similarityScore * 100}%` }"
              ></div>
            </div>
            <span class="ml-2 text-xs font-medium text-gray-700">
              {{ Math.round(similarityScore * 100) }}% match
            </span>
          </div>
          <p v-if="similarityReason" class="mt-1 text-xs text-gray-600">
            {{ similarityReason }}
          </p>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <a
            :href="url"
            :target="newTab ? '_blank' : '_self'"
            rel="noopener noreferrer"
            class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
            :aria-label="`Visit ${title} - opens in ${newTab ? 'new tab' : 'same window'}`"
            @click="handleLinkClick"
          >
            {{ buttonLabel }}
            <span v-if="newTab" class="ml-1 text-xs">(new tab)</span>
          </a>
          <div class="flex items-center space-x-2">
            <!-- Bookmark button -->
            <BookmarkButton
              v-if="id"
              :resource-id="id"
              :title="title"
              :description="description"
              :url="url"
            />
            <!-- Share button -->
            <ShareButton
              v-if="id"
              :title="title"
              :description="description"
              :url="`${runtimeConfig.public.canonicalUrl}/resources/${id}`"
            />
            <!-- Compare button -->
            <button
              v-if="id"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :aria-label="`Add ${title} to comparison`"
              title="Add to comparison"
              @click="addResourceToComparison"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fill-rule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <!-- Slot for additional actions -->
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </div>
  </article>

  <!-- Error state -->
  <div v-else class="bg-white p-6 rounded-lg shadow border border-red-200">
    <div class="flex items-start">
      <div class="flex-shrink-0 mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 text-red-600"
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
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-medium text-red-900">Resource Unavailable</h3>
        <p class="mt-1 text-red-700 text-sm">
          This resource could not be displayed due to an error.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useHead, useRuntimeConfig } from '#imports'
import { useResourceComparison } from '~/composables/useResourceComparison'
import OptimizedImage from '~/components/OptimizedImage.vue'
import BookmarkButton from '~/components/BookmarkButton.vue'
import ShareButton from '~/components/ShareButton.vue'
import ResourceStatus from '~/components/ResourceStatus.vue'
import { trackResourceView, trackResourceClick } from '~/utils/analytics'
import { sanitizeAndHighlight } from '~/utils/sanitize'
import { logError } from '~/utils/errorLogger'

interface Props {
  title: string
  description: string
  benefits: string[]
  url: string
  id?: string
  category?: string // Added for analytics tracking
  icon?: string
  newTab?: boolean
  buttonLabel?: string
  highlightedTitle?: string
  highlightedDescription?: string
  searchQuery?: string
  similarityScore?: number
  similarityReason?: string
}

// Get the comparison composable
const { addResource, selectedResources } = useResourceComparison()

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  category: 'unknown',
  newTab: true,
  buttonLabel: 'Get Free Access',
  highlightedTitle: undefined,
  highlightedDescription: undefined,
  icon: undefined,
  searchQuery: '',
  status: 'active',
  healthScore: undefined,
  similarityScore: undefined,
  similarityReason: undefined,
})

const hasError = ref(false)

// Track resource view when component mounts
onMounted(() => {
  if (props.id) {
    trackResourceView(props.id, props.title, props.category)
  }
})

// Sanitize highlighted content to prevent XSS using centralized utility
const sanitizedHighlightedTitle = computed(() => {
  if (!props.highlightedTitle) return ''
  // Use the centralized sanitization utility with the actual search query
  return sanitizeAndHighlight(
    props.highlightedTitle,
    props.searchQuery || props.highlightedTitle
  )
})

const sanitizedHighlightedDescription = computed(() => {
  if (!props.highlightedDescription) return ''
  // Use the centralized sanitization utility with the actual search query
  return sanitizeAndHighlight(
    props.highlightedDescription,
    props.searchQuery || props.highlightedDescription
  )
})

// Handle image loading errors
const handleImageError = () => {
  hasError.value = true
  logError(
    `Failed to load image for resource: ${props.title}`,
    undefined,
    'ResourceCard',
    { resourceTitle: props.title, resourceUrl: props.image }
  )
}

// Handle link clicks and validate URL
const handleLinkClick = (event: Event) => {
  // Track the resource click
  if (props.id) {
    trackResourceClick(props.id, props.title, props.category)
  }

  try {
    const url = new URL(props.url)
    // URL is valid, allow the click
  } catch (err) {
    event.preventDefault()
    hasError.value = true
    logError(
      `Invalid URL for resource: ${props.url}`,
      err as Error,
      'ResourceCard',
      { resourceTitle: props.title, resourceUrl: props.url, error: err }
    )
  }
}

// Get runtime config for canonical URL
const runtimeConfig = useRuntimeConfig()

// Method to add resource to comparison
const addResourceToComparison = () => {
  if (!props.id) return

  // Create a resource object with the required properties
  const resource = {
    id: props.id,
    title: props.title,
    description: props.description,
    benefits: props.benefits,
    url: props.url,
    category: props.category || 'unknown',
  }

  // Add the resource to comparison
  const added = addResource(resource as any)

  if (added) {
    // Navigate to comparison page
    navigateTo('/compare')
  }
}

// Add structured data for the resource
const resourceSchema = computed(() => {
  // Only create schema if there's no error
  if (hasError.value) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication', // Using SoftwareApplication as most resources are web-based tools
    name: props.title,
    description: props.description,
    url: props.url,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'USD',
    },
    applicationCategory: 'http://schema.org/BusinessApplication',
    operatingSystem: 'Web',
  }
})

// Add JSON-LD structured data to the head if no error
// Skip useHead in test environment to avoid injection issues
if (typeof useHead === 'function') {
  useHead(() => {
    if (hasError.value || !resourceSchema.value) {
      return {}
    }
    // Safely serialize JSON-LD to prevent XSS by escaping special characters
    const safeJsonLd = JSON.stringify(resourceSchema.value)
      .replace(/</g, '\\u003c') // Escape < to prevent script tags
      .replace(/>/g, '\\u003e') // Escape > to prevent script tags
      .replace(/\//g, '\\u002f') // Escape / to prevent closing script tags
    return {
      script: [
        {
          type: 'application/ld+json',
          innerHTML: safeJsonLd,
        },
      ],
    }
  })
}
</script>
