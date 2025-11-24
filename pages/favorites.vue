<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Your Bookmarks</h1>
      <p class="text-gray-600">Resources you've saved for later reference</p>
    </div>

    <!-- Empty state -->
    <div v-if="bookmarks.length === 0" class="text-center py-12">
      <div
        class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">No bookmarks yet</h3>
      <p class="text-gray-500 mb-6">
        Save resources by clicking the bookmark icon on resource cards
      </p>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
      >
        Browse Resources
      </NuxtLink>
    </div>

    <!-- Bookmarks list -->
    <div v-else class="space-y-4">
      <div class="flex justify-between items-center mb-4">
        <p class="text-gray-600">
          {{ bookmarks.length }} saved resource{{
            bookmarks.length !== 1 ? 's' : ''
          }}
        </p>
        <div class="flex space-x-2">
          <button
            @click="exportBookmarksToFile"
            class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Export
          </button>
          <button
            @click="showImportModal = true"
            class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Import
          </button>
          <button
            @click="clearBookmarks"
            class="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            Clear All
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          :title="bookmark.title"
          :description="bookmark.description"
          :benefits="bookmark.benefits"
          :url="bookmark.url"
          :icon="bookmark.icon"
          :id="bookmark.id"
        />
      </div>
    </div>

    <!-- Import Modal -->
    <div
      v-if="showImportModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Import Bookmarks</h3>
        <p class="text-gray-600 text-sm mb-4">
          Paste your exported bookmark data below
        </p>

        <textarea
          v-model="importData"
          class="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-gray-800 focus:border-gray-800"
          placeholder="Paste exported bookmark data..."
        ></textarea>

        <div class="mt-4 flex justify-end space-x-3">
          <button
            @click="showImportModal = false"
            class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="handleImportBookmarks"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookmarks } from '~/composables/useBookmarks'
import ResourceCard from '~/components/ResourceCard.vue'

const { getBookmarks, exportBookmarks, importBookmarks, clearBookmarks } =
  useBookmarks()

const bookmarks = computed(() => getBookmarks.value)
const showImportModal = ref(false)
const importData = ref('')

const exportBookmarksToFile = () => {
  const data = exportBookmarks()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleImportBookmarks = () => {
  if (importData.value.trim()) {
    const success = importBookmarks(importData.value)
    if (success) {
      showImportModal.value = false
      importData.value = ''
      // Show success message
    } else {
      // Show error message
      alert('Invalid bookmark data format')
    }
  }
}
</script>
