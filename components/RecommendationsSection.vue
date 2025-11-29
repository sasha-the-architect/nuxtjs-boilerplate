<template>
  <div class="recommendations-section">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Recommended for You
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Resources we think you'll find valuable based on your interests
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"
      ></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
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
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="recommendations.length === 0" class="text-center py-12">
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
          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6.03 8 6 10v1a1 1 0 001 1h3m4 0v4a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4m4 0h3"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        No recommendations available
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        We couldn't find any recommendations based on your current selection.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RecommendationCard
        v-for="rec in recommendations"
        :key="rec.resource.id"
        :resource="rec.resource"
        @bookmark="handleBookmark"
      />
    </div>

    <div v-if="recommendations.length > 0" class="mt-6 flex justify-center">
      <button
        @click="refreshRecommendations"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        <svg
          class="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh Recommendations
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import RecommendationCard from './RecommendationCard.vue'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import { useResourceData } from '~/composables/useResourceData'
import { useBookmarks } from '~/composables/useBookmarks'
import type { RecommendationResult } from '~/composables/useRecommendationEngine'
import type { Resource } from '~/types/resource'

interface Props {
  currentResource?: Resource
  currentCategory?: string
}

const props = defineProps<Props>()

const { resources } = useResourceData()
const { addBookmark } = useBookmarks()
const loading = ref(true)
const error = ref<string | null>(null)
const recommendations = ref<RecommendationResult[]>([])

// Initialize recommendation engine
const initRecommendations = async () => {
  try {
    loading.value = true
    error.value = null

    // Wait for resources to be loaded
    if (!resources.value || resources.value.length === 0) {
      // Wait a bit for resources to load
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (resources.value && resources.value.length > 0) {
      const engine = useRecommendationEngine(resources.value)
      recommendations.value = engine.getDiverseRecommendations(
        props.currentResource,
        props.currentCategory
      )
    }
  } catch (err) {
    error.value = 'Failed to load recommendations'
    console.error('Error loading recommendations:', err)
  } finally {
    loading.value = false
  }
}

const refreshRecommendations = () => {
  initRecommendations()
}

const handleBookmark = (resource: Resource) => {
  addBookmark(resource)
  // Could add UI feedback here
}

// Initialize on component mount
onMounted(() => {
  initRecommendations()
})

// Watch for changes in current resource or category
watch(
  () => [props.currentResource, props.currentCategory],
  () => {
    initRecommendations()
  }
)
</script>

<style scoped>
.recommendations-section {
  @apply p-4;
}
</style>
