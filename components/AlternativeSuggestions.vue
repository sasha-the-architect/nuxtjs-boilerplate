<template>
  <div v-if="alternatives && alternatives.length > 0" class="mt-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Alternative Resources</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <AlternativeCard
        v-for="alternative in alternatives"
        :key="alternative.id"
        :resource="alternative"
        :similarity-score="getSimilarityScore(alternative.id)"
        :current-resource-id="currentResourceId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'
import AlternativeCard from '~/components/AlternativeCard.vue'

interface Props {
  currentResourceId: string
  alternatives: Resource[]
}

const props = defineProps<Props>()

const getSimilarityScore = (alternativeId: string) => {
  // If the resource has a similarity score property, return it
  // Otherwise, return a default value
  const resource = props.alternatives.find(r => r.id === alternativeId)
  return resource?.similarityScore || 0
}
</script>
