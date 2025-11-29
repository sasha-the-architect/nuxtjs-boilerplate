<template>
  <div v-if="savedSearches.length > 0" class="mb-6">
    <h4 class="text-sm font-medium text-gray-900 mb-3">Saved Searches</h4>
    <div class="space-y-2">
      <div
        v-for="search in savedSearches"
        :key="search.query"
        class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
      >
        <div class="flex-1 min-w-0">
          <button
            class="text-left text-sm text-gray-800 truncate hover:text-gray-600"
            :title="`Search: ${search.query}`"
            @click="onUseSavedSearch(search)"
          >
            {{ search.name || search.query }}
          </button>
          <p class="text-xs text-gray-500 mt-1">
            {{ formatDate(search.createdAt) }}
          </p>
        </div>
        <button
          class="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
          :aria-label="`Remove saved search: ${search.query}`"
          @click="onRemoveSavedSearch(search.query)"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
  </div>
</template>

<script setup lang="ts">
interface SavedSearch {
  name: string
  query: string
  createdAt: Date
}

interface Props {
  savedSearches: SavedSearch[]
}

interface Emits {
  (event: 'use-saved-search', search: SavedSearch): void
  (event: 'remove-saved-search', query: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const onUseSavedSearch = (search: SavedSearch) => {
  emit('use-saved-search', search)
}

const onRemoveSavedSearch = (query: string) => {
  emit('remove-saved-search', query)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
