<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">
              Free Stuff on the Internet
            </h1>
          </div>
          <nav class="flex items-center space-x-4">
            <NuxtLink
              to="/"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >Home</NuxtLink
            >
            <NuxtLink
              to="/ai-keys"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >AI Keys</NuxtLink
            >
            <NuxtLink
              to="/about"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >About</NuxtLink
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

<script setup>
// Default layout component
</script>
