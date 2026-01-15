<template>
  <nav
    class="mb-6"
    aria-label="Breadcrumb"
  >
    <ol class="flex items-center space-x-2 text-sm">
      <li>
        <NuxtLink
          to="/"
          class="text-blue-600 hover:text-blue-800"
        >
          Home
        </NuxtLink>
      </li>
      <li>
        <span class="mx-2 text-gray-400">/</span>
      </li>
      <li>
        <NuxtLink
          to="/search"
          class="text-blue-600 hover:text-blue-800"
        >
          Resources
        </NuxtLink>
      </li>
      <li>
        <span class="mx-2 text-gray-400">/</span>
      </li>
      <li
        class="text-gray-500 truncate"
        aria-current="page"
      >
        {{ title }}
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
