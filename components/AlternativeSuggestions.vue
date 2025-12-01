<template>
  <div v-if="alternatives.length > 0" class="mt-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      Alternative Suggestions
    </h2>
    <p class="text-gray-600 mb-6">
      Users who viewed this resource also found these alternatives useful
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ResourceCard
        v-for="alternative in alternatives"
        :key="alternative.resource.id"
        :title="alternative.resource.title"
        :description="alternative.resource.description"
        :benefits="alternative.resource.benefits"
        :url="alternative.resource.url"
        :button-label="getButtonLabel(alternative.resource.category)"
        :similarity-score="alternative.similarityScore"
        :similarity-reason="alternative.reason"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import ResourceCard from './ResourceCard.vue'
import {
  useAlternatives,
  type AlternativeSuggestion,
} from '~/composables/useAlternatives'
import type { Resource } from '~/types/resource'

interface Props {
  resource?: Resource
}

const props = withDefaults(defineProps<Props>(), {
  resource: () => ({}) as Resource,
})

const alternatives = ref<AlternativeSuggestion[]>([])
const { getAllAlternatives } = useAlternatives()

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
  return categoryLabels[category] || 'Try Alternative'
}
// Initialize alternatives
const initAlternatives = () => {
  if (props.resource) {
    alternatives.value = getAllAlternatives(props.resource)
  }
}
// Initialize on component mount
onMounted(() => {
  initAlternatives()
})

// Watch for changes in the resource
watch(
  () => props.resource,
  () => {
    initAlternatives()
  }
)
</script>
