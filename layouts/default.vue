<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Skip to main content link for screen readers -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
    >
      Skip to main content
    </a>

    <header class="bg-white shadow" role="banner">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink
              to="/"
              class="text-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              :aria-label="'Free Stuff on the Internet - Return to home page'"
            >
              Free Stuff on the Internet
            </NuxtLink>
          </div>
          <div class="flex items-center flex-1 max-w-lg mx-8">
            <SearchBar
              v-model="searchQuery"
              :aria-label="'Search for free resources'"
              @search="handleSearch"
            />
          </div>
          <nav
            class="flex items-center space-x-4"
            role="navigation"
            aria-label="Main navigation"
          >
            <NuxtLink
              to="/"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/search"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
              >Search</NuxtLink
            >
            <NuxtLink
              to="/ai-keys"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              AI Keys
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              About
            </NuxtLink>
            <NuxtLink
              to="/submit"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium font-medium bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-200"
              >Submit</NuxtLink
            >
          </nav>
        </div>
      </div>
    </header>
    <main id="main-content" role="main">
      <slot />
    </main>
    <footer class="bg-white mt-8 py-6 border-t" role="contentinfo">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm"
      >
        © {{ new Date().getFullYear() }} Free Stuff on the Internet. All rights
        reserved.
        <p class="sr-only">Footer content ends</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useResources } from '~/composables/useResources'
import SearchBar from '~/components/SearchBar.vue'

// Use the resources composable to enable global search
const { filterOptions, updateSearchQuery } = useResources()

// Reactive reference for search query
const searchQuery = computed({
  get: () => filterOptions.value.searchQuery || '',
  set: value => updateSearchQuery(value),
})

// Handle search
const handleSearch = (query: string) => {
  updateSearchQuery(query)

  // If we're not on the search page, navigate to it
  if (useRoute().path !== '/search') {
    navigateTo('/search')
  }
}
</script>
