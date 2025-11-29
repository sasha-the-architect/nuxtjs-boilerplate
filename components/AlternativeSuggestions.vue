<template>
  <div v-if="alternatives && alternatives.length > 0" class="mt-12">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Alternative Resources
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Resources that serve similar purposes or provide alternative solutions
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AlternativeCard
        v-for="alternative in alternatives"
        :key="alternative.resource.id"
        :title="alternative.resource.title"
        :description="alternative.resource.description"
        :benefits="alternative.resource.benefits"
        :url="alternative.resource.url"
        :button-label="getButtonLabel(alternative.resource.category)"
        :rating="alternative.resource.rating"
        :popularity="alternative.resource.popularity"
        :tags="alternative.resource.tags"
        :technology="alternative.resource.technology"
        :show-bookmark="true"
        :show-similarity="true"
        :similarity-score="alternative.score"
        :similarity-factors="alternative.similarityFactors"
        @bookmark="handleBookmark(alternative.resource)"
      />
    </div>

    <!-- Show more button if there are more alternatives than displayed -->
    <div v-if="hasMoreAlternatives" class="mt-6 flex justify-center">
      <button
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
        @click="loadMore"
      >
        Show More Alternatives
        <svg
          class="ml-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  </div>

  <!-- Empty state when no alternatives are available -->
  <div v-else-if="!loading && currentResource" class="mt-12 text-center py-12">
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
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
      No alternatives found
    </h3>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      We couldn't find any alternatives for this resource yet.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import AlternativeCard from './AlternativeCard.vue'
import { useAlternativeSuggestions } from '~/composables/useAlternativeSuggestions'
import { useResourceData } from '~/composables/useResourceData'
import { useBookmarks } from '~/composables/useBookmarks'
import type { Resource } from '~/types/resource'
import type { AlternativeSuggestion } from '~/composables/useAlternativeSuggestions'
</script>

<style scoped>
/* Add any specific styling for the alternatives section */
</style>
