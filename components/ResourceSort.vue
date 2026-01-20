<template>
  <div class="flex flex-col sm:flex-row sm:items-center gap-4">
    <div class="text-sm text-gray-800">
      <span class="font-medium">{{ totalResources }}</span> resources found
    </div>
    <div class="flex items-center space-x-2">
      <label
        for="sort"
        class="text-sm text-gray-800"
      >Sort by:</label>
      <select
        id="sort"
        :value="selectedSortOption ?? 'popularity-desc'"
        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-transparent sm:text-sm rounded-md"
        @change="handleChange"
        @keydown.enter="handleChange"
        @keydown.space="handleChange"
      >
        <option value="popularity-desc">
          Most Popular
        </option>
        <option value="alphabetical-asc">
          A-Z
        </option>
        <option value="alphabetical-desc">
          Z-A
        </option>
        <option value="date-added-desc">
          Newest First
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedSortOption?: string
  totalResources?: number
}

const emit = defineEmits<{
  (e: 'update-sort-option', option: string): void
}>()

defineProps<Props>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update-sort-option', target.value)
}
</script>
