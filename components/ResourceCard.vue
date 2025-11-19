<template>
  <div
    class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300"
  >
    <div class="flex items-start">
      <!-- Using Nuxt Image for optimization -->
      <div v-if="icon" class="flex-shrink-0 mr-4">
        <img
          :src="icon"
          :alt="title"
          width="48"
          height="48"
          class="w-12 h-12 rounded object-contain"
          loading="lazy"
        />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-medium text-gray-900 truncate">{{ title }}</h3>
        <p class="mt-1 text-gray-600 text-sm">{{ description }}</p>
        <div class="mt-3 bg-gray-50 p-3 rounded-md">
          <p class="font-medium text-gray-900 text-sm">Free Tier:</p>
          <ul class="mt-1 space-y-1 text-xs text-gray-700">
            <li v-for="(benefit, index) in benefits" :key="index">
              {{ benefit }}
            </li>
          </ul>
        </div>
        <div class="mt-3">
          <a
            :href="url"
            :target="newTab ? '_blank' : '_self'"
            rel="noopener noreferrer"
            class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200"
          >
            {{ buttonLabel }}
            <span v-if="newTab" class="ml-1 text-xs">(new tab)</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  benefits: string[]
  url: string
  icon?: string
  newTab?: boolean
  buttonLabel?: string
}

const {
  title,
  description,
  benefits,
  url,
  icon,
  newTab = true,
  buttonLabel = 'Get Free Access',
} = defineProps<Props>()
</script>
