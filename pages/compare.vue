<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Resource Comparison
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Compare resources side-by-side to make informed decisions
      </p>
    </div>

    <ComparisonBuilder
      :selected-resources="selectedResources"
      :max-resources="4"
      @remove-resource="removeResource"
      @clear-comparison="clearComparison"
      @share-comparison="shareComparison"
      @browse-resources="browseResources"
    />
  </div>
</template>

<script setup lang="ts">
import { useResourceComparison } from '~/composables/useResourceComparison'
import type { Resource } from '~/types/resource'
import ComparisonBuilder from '~/components/ComparisonBuilder.vue'

// Use the comparison composable
const { selectedResources, removeResource, clearComparison, comparisonCount } =
  useResourceComparison()

// Page metadata
useSeoMeta({
  title: 'Resource Comparison Tool - Compare Side-by-Side',
  description:
    'Compare multiple resources side-by-side to make informed decisions. Find the best alternatives and evaluate features, pricing, and more.',
  ogTitle: 'Resource Comparison Tool',
  ogDescription:
    'Compare multiple resources side-by-side to make informed decisions',
  ogType: 'website',
  ogUrl: '/compare',
})

// Methods
const shareComparison = () => {
  // Create a shareable URL with the selected resources
  const resourceIds = selectedResources.value.map(r => r.id).join(',')
  const shareUrl = `${window.location.origin}/compare/${resourceIds}`

  // Copy to clipboard
  navigator.clipboard
    .writeText(shareUrl)
    .then(() => {
      // Show success notification
      console.log('Comparison URL copied to clipboard')
    })
    .catch(err => {
      console.error('Failed to copy URL: ', err)
    })
}

const browseResources = () => {
  // Navigate to search page
  navigateTo('/search')
}
</script>
