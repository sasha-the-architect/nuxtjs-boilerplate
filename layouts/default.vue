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

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center flex-1 max-w-lg mx-8">
            <SearchBar
              v-model="searchQuery"
              :aria-label="'Search for free resources'"
              @search="handleSearch"
            />
          </div>

          <nav
            class="hidden lg:flex items-center space-x-4"
            role="navigation"
            aria-label="Main navigation"
          >
            <NuxtLink
              to="/"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              :aria-label="'Free Stuff on the Internet - Return to home page'"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/search"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
              >Search</NuxtLink
            >
            <NuxtLink
              to="/ai-keys"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              AI Keys
            </NuxtLink>
            <NuxtLink
              to="/favorites"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              Favorites
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              About
            </NuxtLink>
            <NuxtLink
              to="/submit"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium font-medium bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-200"
              >Submit</NuxtLink
            >
            <NuxtLink
              to="/developer"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              Developer
            </NuxtLink>
            <NuxtLink
              to="/api-analytics"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              API Analytics
            </NuxtLink>
          </nav>

          <!-- Mobile menu button -->
          <div class="flex items-center lg:hidden">
            <button
              ref="mobileMenuButton"
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-800"
              aria-controls="mobile-menu"
              :aria-expanded="mobileMenuOpen"
              @click="toggleMobileMenu"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                :class="['h-6 w-6', { hidden: mobileMenuOpen }]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                :class="['h-6 w-6', { hidden: !mobileMenuOpen }]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-show="mobileMenuOpen" id="mobile-menu" class="lg:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NuxtLink
            to="/"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            @click="closeMobileMenu"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/search"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            Search
          </NuxtLink>
          <NuxtLink
            to="/ai-keys"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            AI Keys
          </NuxtLink>
          <NuxtLink
            to="/favorites"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            Favorites
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            About
          </NuxtLink>
          <NuxtLink
            to="/submit"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-200"
            @click="closeMobileMenu"
          >
            Submit
          </NuxtLink>
          <NuxtLink
            to="/developer"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            Developer
          </NuxtLink>
          <NuxtLink
            to="/api-analytics"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            API Analytics
          </NuxtLink>
          <!-- Mobile search bar -->
          <div class="px-2 pt-2 sm:px-3">
            <SearchBar
              v-model="searchQuery"
              :aria-label="'Search for free resources'"
              @search="handleMobileSearch"
            />
          </div>
        </div>
      </div>
    </header>
    <main id="main-content" role="main">
      <slot />
    </main>
    <footer class="bg-white mt-8 py-6 border-t" role="contentinfo">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm"
      >
        © {{ new Date().getFullYear() }} Free Stuff on the Internet. All rights
        reserved.
        <p class="sr-only">Footer content ends</p>
      </div>
    </footer>

    <!-- PWA Install Prompt -->
    <client-only>
      <PWAInstallPrompt />
    </client-only>

    <!-- Offline Indicator -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useResources } from '~/composables/useResources'
import SearchBar from '~/components/SearchBar.vue'
import PWAInstallPrompt from '~/components/PWAInstallPrompt.vue'
import OfflineIndicator from '~/components/OfflineIndicator.vue'

const mobileMenuOpen = ref(false)
const mobileMenuButton = ref<HTMLElement | null>(null)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleMobileSearch = (query: string) => {
  updateSearchQuery(query)
  closeMobileMenu()
  if (useRoute().path !== '/search') {
    navigateTo('/search')
  }
}

const { filterOptions, updateSearchQuery } = useResources()

const searchQuery = computed({
  get: () => filterOptions.value.searchQuery || '',
  set: value => updateSearchQuery(value),
})

const handleSearch = (query: string) => {
  updateSearchQuery(query)
  if (useRoute().path !== '/search') {
    navigateTo('/search')
  }
}

closeMobileMenu()
</script>
