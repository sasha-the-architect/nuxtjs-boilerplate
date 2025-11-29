<template>
  <div
    class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
  >
    <div class="p-5">
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ resource.title }}
          </h3>
          <p class="text-sm text-gray-500 mt-1 truncate">
            {{ resource.category }}
          </p>
        </div>
        <SimilarityBadge v-if="similarityScore" :score="similarityScore" />
      </div>

      <p class="mt-3 text-sm text-gray-600 line-clamp-2">
        {{ resource.description }}
      </p>

      <div class="mt-4 flex items-center justify-between">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in resource.tags.slice(0, 3)"
            :key="tag"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-[80px]"
            :title="tag"
          >
            {{ tag }}
          </span>
          <span
            v-if="resource.tags.length > 3"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            +{{ resource.tags.length - 3 }}
          </span>
        </div>
      </div>

      <div class="mt-4 flex space-x-3">
        <NuxtLink
          :to="`/resources/${resource.id}`"
          class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          View Details
        </NuxtLink>
        <a
          :href="resource.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
          @click="trackAlternativeClick"
        >
          Visit
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'
import SimilarityBadge from '~/components/SimilarityBadge.vue'
import { useNuxtApp } from '#app'

interface Props {
  resource: Resource
  similarityScore?: number
  currentResourceId: string
}

const props = defineProps<Props>()

const { $analytics } = useNuxtApp()

const trackAlternativeClick = () => {
  if ($analytics && $analytics.trackAlternativeClick) {
    $analytics.trackAlternativeClick(
      props.currentResourceId,
      props.resource.id,
      props.resource.title
    )
  }
}
</script>
