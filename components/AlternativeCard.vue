<template>
  <div
    class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="p-5">
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <h3
            class="text-lg font-semibold text-gray-900 truncate dark:text-white"
          >
            {{ title }}
          </h3>
          <p class="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
            {{ description }}
          </p>
        </div>
        <div
          v-if="showSimilarity && similarityScore !== undefined"
          class="ml-3"
        >
          <SimilarityBadge
            :score="similarityScore"
            :show-icon="true"
            :show-percentage="true"
          />
        </div>
      </div>

      <div class="mt-4">
        <div
          v-if="similarityFactors && similarityFactors.length > 0"
          class="mb-3"
        >
          <div class="flex flex-wrap gap-1">
            <span
              v-for="(factor, index) in similarityFactors"
              :key="index"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
            >
              {{ factor }}
            </span>
          </div>
        </div>

        <div v-if="benefits && benefits.length > 0" class="mb-3">
          <h4
            class="text-xs font-medium text-gray-500 uppercase tracking-wide dark:text-gray-400"
          >
            Key Benefits
          </h4>
          <ul class="mt-1 space-y-1">
            <li
              v-for="(benefit, index) in benefits.slice(0, 2)"
              :key="index"
              class="flex items-start"
            >
              <svg
                class="h-4 w-4 text-green-500 mr-1 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span class="text-sm text-gray-700 dark:text-gray-300 truncate">{{
                benefit
              }}</span>
            </li>
          </ul>
        </div>

        <div v-if="tags && tags.length > 0" class="mb-4">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in tags.slice(0, 3)"
              :key="tag"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              {{ tag }}
            </span>
            <span
              v-if="tags.length > 3"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            >
              +{{ tags.length - 3 }} more
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <a
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200"
            @click="handleClick"
          >
            {{ buttonLabel || 'Visit Resource' }}
            <svg
              class="ml-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>

          <div v-if="showBookmark" class="ml-3">
            <BookmarkButton
              :resource="bookmarkResource"
              @bookmark="handleBookmark"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SimilarityBadge from './SimilarityBadge.vue'
import BookmarkButton from './BookmarkButton.vue'
import type { Resource } from '~/types/resource'
import { trackResourceClick } from '~/utils/analytics'

interface Props {
  id?: string
  title: string
  description: string
  benefits?: string[]
  url: string
  buttonLabel?: string
  category?: string
  pricingModel?: string
  difficulty?: string
  tags?: string[]
  technology?: string[]
  dateAdded?: string
  showBookmark?: boolean
  showSimilarity?: boolean
  similarityScore?: number
  similarityFactors?: string[]
  rating?: number
  popularity?: number
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  benefits: () => [],
  tags: () => [],
  technology: () => [],
  showBookmark: false,
  showSimilarity: true,
  similarityScore: undefined,
  similarityFactors: () => [],
  rating: 0,
  popularity: 0,
  buttonLabel: 'Visit Resource',
  category: 'Other',
  pricingModel: 'Free',
  difficulty: 'Beginner',
  dateAdded: () => new Date().toISOString(),
})

const emit = defineEmits<{
  bookmark: [resource: Resource]
}>()

const bookmarkResource = computed(() => ({
  id: props.id || 'temp-id', // Use provided id if available
  title: props.title,
  description: props.description,
  benefits: props.benefits || [],
  url: props.url,
  category: props.category || 'Other',
  pricingModel: props.pricingModel || 'Free',
  difficulty: props.difficulty || 'Beginner',
  tags: props.tags || [],
  technology: props.technology || [],
  dateAdded: props.dateAdded || new Date().toISOString(),
  popularity: props.popularity,
  rating: props.rating,
}))

const handleBookmark = () => {
  emit('bookmark', bookmarkResource.value)
}

const handleClick = () => {
  // Track the alternative click with analytics
  if (props.id && props.title) {
    trackResourceClick(
      props.id,
      props.title,
      props.category || 'Alternative Resource'
    )
  }
}
</script>
