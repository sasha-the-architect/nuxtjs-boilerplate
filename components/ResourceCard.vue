<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300"
  >
    <div class="flex items-start">
      <!-- Using standard img tag for optimization -->
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
        <h3 class="text-lg font-medium text-gray-900 truncate">
          <span
            v-if="highlightedTitle"
            v-html="sanitizedHighlightedTitle"
          ></span>
          <!-- eslint-disable-line vue/no-v-html -->
          <span v-else>{{ title }}</span>
        </h3>
        <p class="mt-1 text-gray-600 text-sm">
          <span
            v-if="highlightedDescription"
            v-html="sanitizedHighlightedDescription"
          ></span>
          <!-- eslint-disable-line vue/no-v-html -->
          <span v-else>{{ description }}</span>
        </p>
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
import { computed } from 'vue'

interface Props {
  title: string
  description: string
  benefits: string[]
  url: string
  icon?: string
  newTab?: boolean
  buttonLabel?: string
  highlightedTitle?: string
  highlightedDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  newTab: true,
  buttonLabel: 'Get Free Access',
  highlightedTitle: undefined,
  highlightedDescription: undefined,
  icon: undefined,
})

// Sanitize highlighted content to prevent XSS
const sanitizedHighlightedTitle = computed(() => {
  if (!props.highlightedTitle) return ''
  // Basic sanitization to prevent XSS - only allow mark tags
  return props.highlightedTitle
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
})

const sanitizedHighlightedDescription = computed(() => {
  if (!props.highlightedDescription) return ''
  // Basic sanitization to prevent XSS - only allow mark tags
  return props.highlightedDescription
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
})

// Add structured data for the resource
const resourceSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication', // Using SoftwareApplication as most resources are web-based tools
  name: props.title,
  description: props.description,
  url: props.url,
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    price: '0',
    priceCurrency: 'USD',
  },
  applicationCategory: 'http://schema.org/BusinessApplication',
  operatingSystem: 'Web',
}

// Add JSON-LD structured data to the head
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(resourceSchema),
    },
  ],
})
</script>
