<template>
  <div class="mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">
      Limitations
    </h2>
    <ul class="space-y-2">
      <li
        v-for="(limitation, index) in limitations"
        :key="index"
        class="flex items-start"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-gray-700">{{ limitation }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Props {
  limitations: string[]
}

defineProps<Props>()
</script>
