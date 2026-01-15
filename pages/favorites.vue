<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          My Bookmarks
        </h1>
        <p class="mt-4 text-xl text-gray-600">
          {{ bookmarkCount }} bookmarked resource<span
            v-if="bookmarkCount !== 1"
          >s</span>
        </p>
      </div>

      <!-- Empty state -->
      <div
        v-if="bookmarkCount === 0"
        class="text-center py-16"
      >
        <div class="mx-auto h-24 w-24 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <h3 class="mt-4 text-xl font-medium text-gray-900">
          No bookmarks yet
        </h3>
        <p class="mt-2 text-gray-600">
          Start bookmarking resources by clicking the star icon on any resource
          card.
        </p>
        <div class="mt-6">
          <NuxtLink
            to="/"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
          >
            Browse Resources
          </NuxtLink>
        </div>
      </div>

      <!-- Bookmarks content -->
      <div v-else>
        <!-- Controls -->
        <div class="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-700">
              Showing {{ getAllBookmarks.length }} bookmarked resource<span
                v-if="getAllBookmarks.length !== 1"
              >s</span>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="exportBookmarks"
            >
              Export
            </button>
            <button
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              @click="clearBookmarks"
            >
              Clear All
            </button>
          </div>
        </div>

        <!-- Bookmarks grid -->
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <LazyResourceCard
            v-for="bookmark in getAllBookmarks"
            :id="bookmark.id"
            :key="bookmark.id"
            :title="bookmark.title"
            :description="bookmark.description"
            :benefits="['Bookmarked resource']"
            :url="bookmark.url"
            :button-label="'Visit Resource'"
          >
            <template #actions>
              <button
                class="text-red-500 hover:text-red-700"
                :aria-label="`Remove ${bookmark.title} from bookmarks`"
                title="Remove bookmark"
                @click="removeBookmark(bookmark.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </template>
          </LazyResourceCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookmarks } from '~/composables/useBookmarks'

// Set page-specific meta tags
useSeoMeta({
  title: 'My Bookmarks - Free Stuff on Internet',
  ogTitle: 'My Bookmarks - Free Stuff on Internet',
  description: 'View and manage your bookmarked resources.',
  ogDescription: 'View and manage your bookmarked resources.',
})

definePageMeta({
  layout: 'default',
})

const {
  getAllBookmarks,
  bookmarkCount,
  removeBookmark,
  exportBookmarks,
  clearBookmarks,
} = useBookmarks()
</script>
