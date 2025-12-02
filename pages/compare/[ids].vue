<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Resource Comparison
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Comparing {{ resources.length }} resources side-by-side
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            Error loading comparison
          </h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <ComparisonTable
      v-else-if="resources.length >= 2"
      :resources="resources"
      :criteria="defaultCriteria"
      @remove-resource="handleRemoveResource"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, navigateTo } from '#app'
import logger from '~/utils/logger'
import type { Resource } from '~/types/resource'
import type { ComparisonCriteria } from '~/types/comparison'
import ComparisonTable from '~/components/ComparisonTable.vue'

// Get resource IDs from route
const route = useRoute()
const resourceIds = computed(() => {
  if (typeof route.params.ids === 'string') {
    return route.params.ids.split(',')
  }
  return []
})

// State
const loading = ref(true)
const error = ref<string | null>(null)
const resources = ref<Resource[]>([])

// Default comparison criteria
const defaultCriteria: ComparisonCriteria[] = [
  { id: 'title', name: 'Name', type: 'text', category: 'basic', weight: 1 },
  {
    id: 'description',
    name: 'Description',
    type: 'text',
    category: 'basic',
    weight: 1,
  },
  {
    id: 'pricingModel',
    name: 'Pricing',
    type: 'text',
    category: 'business',
    weight: 1,
  },
  {
    id: 'category',
    name: 'Category',
    type: 'text',
    category: 'basic',
    weight: 0.8,
  },
  {
    id: 'technology',
    name: 'Technology',
    type: 'list',
    category: 'technical',
    weight: 1,
  },
  {
    id: 'popularity',
    name: 'Popularity',
    type: 'number',
    category: 'metrics',
    weight: 0.7,
  },
  {
    id: 'benefits',
    name: 'Benefits',
    type: 'list',
    category: 'features',
    weight: 1,
  },
  {
    id: 'limitations',
    name: 'Limitations',
    type: 'list',
    category: 'features',
    weight: 0.8,
  },
  {
    id: 'platforms',
    name: 'Platforms',
    type: 'list',
    category: 'technical',
    weight: 0.7,
  },
  {
    id: 'features',
    name: 'Features',
    type: 'list',
    category: 'features',
    weight: 1,
  },
]

// Fetch comparison data
const fetchComparison = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await $fetch(`/api/v1/comparisons`, {
      params: {
        ids: resourceIds.value,
      },
    })

    resources.value = response.resources || []
  } catch (err: any) {
    logger.error('Error fetching comparison:', err)
    error.value =
      err.data?.statusMessage || err.message || 'Failed to load comparison'
  } finally {
    loading.value = false
  }
}

// Watch for route changes and fetch new data
watch(
  resourceIds,
  () => {
    if (resourceIds.value.length > 0) {
      fetchComparison()
    }
  },
  { immediate: true }
)

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

useSeoMeta({
  title: title.value,
  description:
    'Compare resources side-by-side to make informed decisions. Evaluate features, pricing, and more.',
  ogTitle: title.value,
  ogDescription: 'Compare resources side-by-side to make informed decisions',
  ogType: 'website',
  ogUrl: route.fullPath,
})

// Methods
const handleRemoveResource = (resourceId: string) => {
  // Remove the resource from the comparison and redirect to a new comparison URL
  const newIds = resourceIds.value.filter(id => id !== resourceId)
  if (newIds.length > 0) {
    navigateTo(`/compare/${newIds.join(',')}`)
  } else {
    navigateTo('/compare')
  }
}
</script>
