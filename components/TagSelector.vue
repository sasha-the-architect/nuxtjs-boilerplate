<template>
  <div class="tag-selector">
    <div class="search-container mb-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tags..."
          class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
          @focus="showDropdown = true"
          @keydown.down.prevent="navigateOptions('down')"
          @keydown.up.prevent="navigateOptions('up')"
          @keydown.enter.prevent="selectHighlightedOption"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            class="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Selected tags display -->
    <div v-if="selectedTags.length > 0" class="selected-tags mb-4">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in selectedTags"
          :key="tag.id"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
        >
          {{ tag.name }}
          <button
            type="button"
            class="ml-2 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-600 hover:bg-blue-200 focus:outline-none"
            @click="removeTag(tag.id)"
          >
            <span class="sr-only">Remove</span>
            <svg
              class="h-3 w-3"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 8 8"
            >
              <path
                stroke-linecap="round"
                stroke-width="1.5"
                d="M1 1l6 6m0-6L1 7"
              />
            </svg>
          </button>
        </span>
      </div>
    </div>

    <!-- Tag hierarchy tree -->
    <div
      v-if="showDropdown && filteredTags.length > 0"
      class="tag-tree-container"
    >
      <div
        class="max-h-60 overflow-y-auto border border-gray-200 rounded-md shadow-sm"
      >
        <ul class="py-1">
          <li v-for="tag in filteredTags" :key="tag.id">
            <TagTreeNode
              :tag="tag"
              :selected-tags="selectedTags"
              :level="0"
              @toggle-tag="toggleTag"
            />
          </li>
        </ul>
      </div>
    </div>

    <!-- Message when no tags match search -->
    <div
      v-else-if="showDropdown && searchQuery && filteredTags.length === 0"
      class="no-results text-sm text-gray-500 py-2 px-4"
    >
      No tags found for "{{ searchQuery }}"
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type {
  HierarchicalTag,
  TagWithHierarchy,
} from '~/types/hierarchicalTags'
import { useHierarchicalTags } from '~/composables/useHierarchicalTags'

interface Props {
  modelValue: string[]
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getAllTagsWithHierarchy, searchTags } = useHierarchicalTags()
const searchQuery = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(-1)

// Get all tags with hierarchy for the tree view
const allTags = computed(() => {
  return getAllTagsWithHierarchy().filter(tag => tag.isActive)
})

// Filter tags based on search query
const filteredTags = computed(() => {
  if (!searchQuery.value.trim()) {
    // Show root tags when no search query
    return allTags.value.filter(tag => tag.level === 0)
  }

  // Search all tags when there's a query
  return searchTags(searchQuery.value).map(tag => {
    // Find the full tag object with hierarchy info
    return allTags.value.find(t => t.id === tag.id) || (tag as TagWithHierarchy)
  })
})

// Get selected tags as objects
const selectedTags = computed(() => {
  return props.modelValue
    .map(tagId => allTags.value.find(tag => tag.id === tagId))
    .filter(tag => tag !== undefined) as TagWithHierarchy[]
})

const toggleTag = (tagId: string) => {
  const newSelected = [...props.modelValue]
  const index = newSelected.indexOf(tagId)

  if (index >= 0) {
    newSelected.splice(index, 1)
  } else {
    newSelected.push(tagId)
  }

  emit('update:modelValue', newSelected)
}

const removeTag = (tagId: string) => {
  const newSelected = props.modelValue.filter(id => id !== tagId)
  emit('update:modelValue', newSelected)
}

const navigateOptions = (direction: 'up' | 'down') => {
  if (filteredTags.value.length === 0) return

  if (direction === 'down') {
    highlightedIndex.value = Math.min(
      highlightedIndex.value + 1,
      filteredTags.value.length - 1
    )
  } else {
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  }
}

const selectHighlightedOption = () => {
  if (
    highlightedIndex.value >= 0 &&
    filteredTags.value[highlightedIndex.value]
  ) {
    toggleTag(filteredTags.value[highlightedIndex.value].id)
    highlightedIndex.value = -1
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.tag-selector')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tag-tree-container {
  position: absolute;
  width: 100%;
  z-index: 10;
  background: white;
  margin-top: 0.25rem;
}
</style>
