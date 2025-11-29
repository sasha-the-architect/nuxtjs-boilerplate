<template>
  <div class="w-full max-w-2xl">
    <!-- Saved Search Form -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-3">
        Save Current Search
      </h3>
      <div class="flex flex-col sm:flex-row gap-3">
        <input
          v-model="newSavedSearchName"
          type="text"
          placeholder="Name your search..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
          @keydown.enter="saveCurrentSearch"
        />
        <button
          @click="saveCurrentSearch"
          :disabled="!currentQuery || !newSavedSearchName.trim()"
          class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Search
        </button>
      </div>
      <p v-if="currentQuery" class="mt-2 text-sm text-gray-600">
        Current query:
        <span class="font-mono bg-gray-100 px-2 py-1 rounded">{{
          currentQuery
        }}</span>
      </p>
    </div>

    <!-- Saved Searches List -->
    <div v-if="savedSearches.length > 0" class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-3">
        Your Saved Searches
      </h3>
      <div class="space-y-3">
        <div
          v-for="search in savedSearches"
          :key="search.query"
          class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center">
              <button
                class="text-left font-medium text-gray-800 truncate hover:text-gray-600 mr-2"
                :title="`Search: ${search.query}`"
                @click="onUseSavedSearch(search)"
              >
                {{ search.name || search.query }}
              </button>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                :title="`Created: ${formatDate(search.createdAt)}`"
              >
                {{ formatDate(search.createdAt) }}
              </span>
            </div>
            <p
              class="text-sm text-gray-600 mt-1 font-mono bg-gray-100 px-2 py-1 rounded inline-block"
            >
              {{ search.query }}
            </p>
          </div>
          <div class="flex space-x-2">
            <button
              class="text-gray-400 hover:text-blue-500 focus:outline-none"
              :aria-label="`Edit saved search: ${search.query}`"
              @click="editSavedSearch(search)"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
            </button>
            <button
              class="text-gray-400 hover:text-red-500 focus:outline-none"
              :aria-label="`Remove saved search: ${search.query}`"
              @click="onRemoveSavedSearch(search.query)"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No saved searches</h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by performing a search and saving it for later.
      </p>
    </div>

    <!-- Edit Saved Search Modal -->
    <div
      v-if="editingSearch"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      style="display: flex; align-items: center; justify-content: center"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      >
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900">Edit Saved Search</h3>
          <div class="mt-2 px-7 py-3">
            <input
              v-model="editingSearch.name"
              type="text"
              placeholder="Name your search..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            />
            <p
              class="mt-2 text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded"
            >
              {{ editingSearch.query }}
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="updateSavedSearch"
              class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 mr-2"
            >
              Update
            </button>
            <button
              @click="cancelEdit"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface SavedSearch {
  name: string
  query: string
  createdAt: Date
}

interface Props {
  savedSearches: SavedSearch[]
  currentQuery: string
}

interface Emits {
  (event: 'save-search', name: string, query: string): void
  (event: 'use-saved-search', search: SavedSearch): void
  (event: 'remove-saved-search', query: string): void
  (
    event: 'update-saved-search',
    oldQuery: string,
    newName: string,
    newQuery: string
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const newSavedSearchName = ref('')
const editingSearch = ref<SavedSearch | null>(null)

const saveCurrentSearch = () => {
  if (props.currentQuery && newSavedSearchName.value.trim()) {
    emit('save-search', newSavedSearchName.value.trim(), props.currentQuery)
    newSavedSearchName.value = ''
  }
}

const onUseSavedSearch = (search: SavedSearch) => {
  emit('use-saved-search', search)
}

const onRemoveSavedSearch = (query: string) => {
  emit('remove-saved-search', query)
}

const editSavedSearch = (search: SavedSearch) => {
  editingSearch.value = { ...search }
}

const updateSavedSearch = () => {
  if (editingSearch.value) {
    emit(
      'update-saved-search',
      editingSearch.value.query,
      editingSearch.value.name,
      editingSearch.value.query
    )
    editingSearch.value = null
  }
}

const cancelEdit = () => {
  editingSearch.value = null
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
