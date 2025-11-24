<template>
  <div class="relative">
    <button
      :aria-label="isBookmarked ? 'Manage bookmark' : 'Bookmark this resource'"
      class="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
      @click="toggleDropdown"
    >
      <svg
        v-if="isBookmarked"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-yellow-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="showDropdown && isBookmarked"
      class="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200"
      @click.stop
    >
      <div class="p-3 border-b border-gray-100">
        <h3 class="text-sm font-medium text-gray-900">Bookmark Options</h3>
      </div>
      <div class="p-3">
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1"
            >Add Notes</label
          >
          <textarea
            v-model="localNotes"
            @blur="updateNotes"
            class="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-gray-800 focus:border-gray-800"
            rows="2"
            placeholder="Add notes about this resource..."
          ></textarea>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1"
            >Tags</label
          >
          <input
            v-model="tagsInput"
            @blur="updateTags"
            @keyup.enter="updateTags"
            class="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-gray-800 focus:border-gray-800"
            placeholder="Add tags (comma separated)..."
          />
        </div>
      </div>
      <div class="p-2 border-t border-gray-100">
        <button
          @click="removeBookmark"
          class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
        >
          Remove Bookmark
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useBookmarks } from '~/composables/useBookmarks'
import { Resource } from '~/composables/useResources'

interface Props {
  resource: Resource
}

const props = defineProps<Props>()

const {
  isBookmarked: checkIsBookmarked,
  toggleBookmark,
  addNoteToBookmark,
  addTagsToBookmark,
  removeBookmark: removeBookmarkFromStore,
  getBookmarks,
} = useBookmarks()

const showDropdown = ref(false)

const isBookmarked = computed(() => {
  return checkIsBookmarked(props.resource.id)
})

// Track notes and tags locally
const localNotes = ref('')
const tagsInput = ref('')

// Update local state when resource is bookmarked
watch(isBookmarked, newVal => {
  if (newVal) {
    // Find the bookmarked resource to get existing notes and tags
    const bookmark = getBookmarks.value.find(b => b.id === props.resource.id)
    if (bookmark) {
      localNotes.value = bookmark.notes || ''
      tagsInput.value = bookmark.tags ? bookmark.tags.join(', ') : ''
    }
  } else {
    localNotes.value = ''
    tagsInput.value = ''
    showDropdown.value = false
  }
})

const toggleDropdown = (e: Event) => {
  e.stopPropagation()

  if (!isBookmarked.value) {
    // If not bookmarked, just toggle bookmark
    toggleBookmark(props.resource)
    return
  }

  // If bookmarked, toggle dropdown
  showDropdown.value = !showDropdown.value
}

const updateNotes = () => {
  if (localNotes.value.trim()) {
    addNoteToBookmark(props.resource.id, localNotes.value)
  }
}

const updateTags = () => {
  if (tagsInput.value.trim()) {
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)
    if (tags.length > 0) {
      addTagsToBookmark(props.resource.id, tags)
    }
  }
}

const removeBookmark = () => {
  removeBookmarkFromStore(props.resource.id)
  showDropdown.value = false
}

// Handle clicks outside the dropdown to close it
const handleClickOutside = (event: Event) => {
  if (!(event.target as Element).closest('.relative')) {
    showDropdown.value = false
  }
}

// Add event listener when component mounts
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// Remove event listener when component unmounts
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Expose the toggleBookmarkHandler for external use
defineExpose({
  toggleBookmark,
})
</script>
