<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1
          class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Welcome to Nuxt.js Boilerplate
        </h1>
        <p class="mt-6 max-w-lg mx-auto text-xl text-gray-500">
          A standardized template with Tailwind CSS, ESLint, and Stylelint
          configured.
        </p>
      </div>

      <div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900">Tailwind CSS</h3>
          <p class="mt-2 text-gray-500">
            Utility-first CSS framework for rapid UI development with
            standardized styling.
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900">ESLint</h3>
          <p class="mt-2 text-gray-500">
            JavaScript linter for identifying and fixing problems in your code.
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900">Stylelint</h3>
          <p class="mt-2 text-gray-500">
            CSS linter for maintaining consistent coding standards.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})
</script>
