<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-semibold text-gray-900">
              Free Stuff on the Internet
            </NuxtLink>
          </div>
          <div class="flex items-center flex-1 max-w-lg mx-8">
            <SearchBar v-model="searchQuery" @search="handleSearch" />
          </div>
          <nav class="flex items-center space-x-4">
            <NuxtLink
              to="/"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/search"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >Search</NuxtLink
            >
            <NuxtLink
              to="/ai-keys"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              AI Keys
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
            <NuxtLink
              to="/submit"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium font-medium bg-gray-100 hover:bg-gray-200 rounded-md"
              >Submit</NuxtLink
            >
          </nav>
        </div>
      </div>
    </header>
    <main>
      <slot />
    </main>
    <footer class="bg-white mt-8 py-6 border-t">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm"
      >
        © {{ new Date().getFullYear() }} Free Stuff on the Internet. All rights
        reserved.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
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
