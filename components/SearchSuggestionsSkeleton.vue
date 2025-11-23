<template>
  <div
    class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-96 overflow-auto border border-gray-200"
  >
    <!-- Loading indicator -->
    <div class="px-4 py-3">
      <div class="flex items-center">
        <svg
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-sm text-gray-500">Searching...</span>
      </div>
    </div>

    <!-- Skeleton items -->
    <div class="px-4 py-2">
      <div v-for="i in 5" :key="i" class="py-2 animate-pulse">
        <div class="flex items-start">
          <div
            class="w-4 h-4 mr-2 mt-0.5 bg-gray-200 rounded-full flex-shrink-0"
          ></div>
          <div class="flex flex-col flex-1">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Skeleton loading component for SearchSuggestions
</script>
