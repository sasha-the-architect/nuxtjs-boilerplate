<template>
  <div
    v-if="relatedSearches.length > 0"
    class="mt-4 p-4 bg-blue-50 rounded-lg"
  >
    <h4 class="text-sm font-medium text-gray-900 mb-2">
      Did you mean?
    </h4>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(search, index) in relatedSearches"
        :key="index"
        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-150"
        @click="onSearchSelect(search)"
      >
        {{ search }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'

interface Props {
  query: string
  limit?: number
}

const emit = defineEmits<{
  'search-select': [query: string]
}>()

const props = withDefaults(defineProps<Props>(), {
  limit: 5,
})

const { resources } = useResourceData()
const { getRelatedSearches } = useAdvancedResourceSearch(resources)

const relatedSearches = computed(() => {
  if (!props.query || props.query.length < 2) return []
  return getRelatedSearches(props.query, props.limit)
})

const onSearchSelect = (query: string) => {
  emit('search-select', query)
}
</script>
