<template>
  <div class="relative w-full max-w-2xl">
    <div class="relative">
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <svg
          class="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        id="search-input"
        type="text"
        :value="modelValue"
        class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
        placeholder="Search resources by name, description, tags..."
        aria-label="Search resources"
        aria-describedby="search-results-info"
        @input="handleInput"
      />
      <div
        v-if="modelValue"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <button
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Clear search"
          @click="clearSearch"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
    <!-- ARIA live region for search results information -->
    <div
      id="search-results-info"
      role="status"
      aria-live="polite"
      class="sr-only"
    >
      Search results will be updated automatically
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'search', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('search', target.value)
}

const clearSearch = () => {
  emit('update:modelValue', '')
  emit('search', '')
}
</script>
