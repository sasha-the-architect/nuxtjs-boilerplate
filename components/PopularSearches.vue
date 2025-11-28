<template>
  <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Popular Searches</h3>
    <div class="space-y-3">
      <button
        v-for="(search, index) in popularSearches"
        :key="index"
        class="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors duration-150 flex justify-between items-center"
        @click="onSearchSelect(search.query)"
      >
        <span class="text-gray-800 truncate">{{ search.query }}</span>
        <span class="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">
          {{ search.count }}
        </span>
      </button>
      <div
        v-if="popularSearches.length === 0"
        class="text-center text-gray-500 text-sm py-4"
      >
        No popular searches yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'

interface Props {
  limit?: number
}

interface Emits {
  (event: 'search-select', query: string): void
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
})

const emit = defineEmits<Emits>()

const { resources } = useResourceData()
const { getPopularSearches } = useAdvancedResourceSearch(resources)

const popularSearches = computed(() => {
  return getPopularSearches(props.limit)
})

const onSearchSelect = (query: string) => {
  emit('search-select', query)
}
</script>
