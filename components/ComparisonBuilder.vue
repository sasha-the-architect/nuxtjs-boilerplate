<template>
  <div class="space-y-6">
    <!-- Comparison Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Resource Comparison
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Compare up to {{ maxResources }} resources side-by-side
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ comparisonCount }} of {{ maxResources }} selected
        </span>
        <div class="flex items-center">
          <div
            v-for="n in maxResources"
            :key="n"
            class="w-2 h-2 rounded-full mx-0.5"
            :class="
              n <= comparisonCount
                ? 'bg-blue-500'
                : 'bg-gray-300 dark:bg-gray-600'
            "
          />
        </div>
      </div>
    </div>

    <!-- Comparison Controls -->
    <div class="flex flex-wrap gap-3">
      <button
        v-if="comparisonCount > 0"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
        @click="clearComparison"
      >
        <svg
          class="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Clear All
      </button>

      <button
        v-if="comparisonCount > 1"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        @click="shareComparison"
      >
        <svg
          class="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        Share Comparison
      </button>
    </div>

    <!-- Selected Resources -->
    <div
      v-if="selectedResources.length > 0"
      class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
    >
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Selected Resources
      </h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="resource in selectedResources"
          :key="resource.id"
          class="flex items-center px-3 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
        >
          <span
            class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs"
          >
            {{ resource.title }}
          </span>
          <button
            class="ml-2 text-red-500 hover:text-red-700"
            @click="removeResource(resource.id)"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Comparison Table -->
    <ComparisonTable
      v-if="selectedResources.length >= 2"
      :resources="selectedResources"
      :criteria="defaultCriteria"
      @remove-resource="removeResource"
    />

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-12"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        No resources selected
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Add resources to compare them side-by-side.
      </p>
      <div class="mt-6">
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="$emit('browse-resources')"
        >
          Browse Resources
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import type { ComparisonCriteria } from '~/types/comparison'
import ComparisonTable from './ComparisonTable.vue'

interface Props {
  selectedResources: Resource[]
  maxResources?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxResources: 4,
})

const emit = defineEmits([
  'remove-resource',
  'clear-comparison',
  'share-comparison',
  'browse-resources',
])

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

// Computed properties
const comparisonCount = computed(() => props.selectedResources.length)

// Methods
const removeResource = (resourceId: string) => {
  emit('remove-resource', resourceId)
}

const clearComparison = () => {
  emit('clear-comparison')
}

const shareComparison = () => {
  emit('share-comparison')
}

// Expose methods for parent components
defineExpose({
  removeResource,
  clearComparison,
  shareComparison,
})
</script>
