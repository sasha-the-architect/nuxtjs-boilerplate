<template>
  <div class="mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Features</h2>
    <ul class="space-y-2">
      <li
        v-for="(feature, index) in features"
        :key="index"
        class="flex items-start"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-gray-700">{{ feature }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Props {
  features: string[]
}

defineProps<Props>()
</script>
