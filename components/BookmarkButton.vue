<template>
  <button
    :class="[
      'flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      isBookmarked
        ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
        : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100',
    ]"
    :aria-label="isBookmarked ? 'Remove bookmark' : 'Bookmark resource'"
    :title="isBookmarked ? 'Remove bookmark' : 'Bookmark resource'"
    @click="handleBookmarkToggle"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :class="isBookmarked ? 'fill-current' : 'stroke-current'"
      :stroke-width="isBookmarked ? '0' : '1.5'"
      class="w-5 h-5"
      viewBox="0 0 24 24"
    >
      <path d="M17.5 22l-1.5-1.5L12 18.1 8 20.5V3h4v6h4V3h4v17.5l-4.5-2.4z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBookmarks } from '~/composables/useBookmarks'

interface Props {
  resourceId?: string
  title?: string
  description?: string
  url?: string
}

const props = withDefaults(defineProps<Props>(), {
  resourceId: '',
  title: '',
  description: '',
  url: '',
})

const { isBookmarked, toggleBookmark } = useBookmarks()

// Check if the current resource is bookmarked
const isBookmarkedComputed = computed(() => isBookmarked(props.resourceId))

// Handle bookmark toggle
const handleBookmarkToggle = () => {
  toggleBookmark({
    id: props.resourceId,
    title: props.title,
    description: props.description,
    url: props.url,
  })
}
</script>
