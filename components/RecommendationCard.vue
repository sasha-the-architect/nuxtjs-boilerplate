<template>
  <div
    class="recommendation-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
  >
    <div class="p-4">
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <h3
            class="text-lg font-semibold text-gray-900 dark:text-white truncate"
          >
            {{ resource.title }}
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {{ resource.description }}
          </p>
        </div>
        <div v-if="resource.icon" class="ml-3 flex-shrink-0">
          <img
            :src="resource.icon"
            :alt="resource.title"
            class="w-8 h-8 rounded object-contain"
          />
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-1">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
        >
          {{ resource.category }}
        </span>
        <span
          v-for="tag in resource.tags.slice(0, 3)"
          :key="tag"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        >
          {{ tag }}
        </span>
        <span
          v-if="resource.tags.length > 3"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          +{{ resource.tags.length - 3 }} more
        </span>
      </div>

      <div class="mt-3 flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fill-rule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ resource.popularity }} views</span>
        </div>
        <div
          class="text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        >
          {{ resource.pricingModel }}
        </div>
      </div>

      <div class="mt-4 flex space-x-2">
        <a
          :href="resource.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View Resource
        </a>
        <button
          @click="emit('bookmark', resource)"
          class="inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
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
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'

interface Props {
  resource: Resource
}

interface Emits {
  (e: 'bookmark', resource: Resource): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
