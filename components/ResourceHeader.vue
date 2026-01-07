<template>
  <div class="p-6 border-b border-gray-200">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          {{ title }}
        </h1>
        <div class="flex items-center mt-2 gap-2">
          <p class="text-gray-600">
            {{ category }}
          </p>
          <ResourceStatus
            v-if="status"
            :status="status"
            :health-score="healthScore"
          />
        </div>
      </div>
      <div class="mt-4 sm:mt-0">
        <a
          :href="url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200"
        >
          Visit Resource
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="ml-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  category: string
  status?: string
  healthScore?: number
  url: string
}

defineProps<Props>()
</script>
