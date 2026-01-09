<template>
  <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Common Searches</h3>
    <div class="space-y-3">
      <button
        v-for="(search, index) in zeroResultSearches"
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
        v-if="zeroResultSearches.length === 0"
        class="text-center text-gray-500 text-sm py-4"
      >
        No common searches yet
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  limit: 10,
})

const emit = defineEmits<Emits>()

const { resources } = useResourceData()
const { getZeroResultSearches } = useAdvancedResourceSearch(resources)

const zeroResultSearches = computed(() => {
  return getZeroResultSearches(props.limit)
})

const onSearchSelect = (query: string) => {
  emit('search-select', query)
}
</script>
