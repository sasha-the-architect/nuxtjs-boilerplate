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

    <div
      v-if="loading"
      class="flex justify-center items-center py-12"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
      />
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
import ComparisonTable from '~/components/ComparisonTable.vue'
import { useComparisonPage } from '~/composables/useComparisonPage'
import { useRoute } from '#app'

const route = useRoute()
const {
  loading,
  error,
  resources,
  defaultCriteria,
  title,
  handleRemoveResource,
} = useComparisonPage()

useSeoMeta({
  title: title.value,
  description:
    'Compare resources side-by-side to make informed decisions. Evaluate features, pricing, and more.',
  ogTitle: title.value,
  ogDescription: 'Compare resources side-by-side to make informed decisions',
  ogType: 'website',
  ogUrl: route.fullPath,
})
</script>
