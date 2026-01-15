<template>
  <div
    v-if="resources && resources.length > 0"
    class="mt-12"
  >
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        Related Resources
      </h2>
      <NuxtLink
        to="/"
        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        View All
      </NuxtLink>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <LazyResourceCard
        v-for="resource in resources"
        :key="resource.id"
        :title="resource.title"
        :description="resource.description"
        :benefits="resource.benefits"
        :url="resource.url"
        :button-label="getButtonLabel(resource.category)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/composables/useResources'

interface Props {
  resources: Resource[]
}

defineProps<Props>()

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
</script>
