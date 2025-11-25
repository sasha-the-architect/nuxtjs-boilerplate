<template>
  <div class="py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb Navigation -->
      <nav class="mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2 text-sm">
          <li>
            <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">
              Home
            </NuxtLink>
          </li>
          <li>
            <span class="mx-2 text-gray-400">/</span>
          </li>
          <li>
            <NuxtLink to="/search" class="text-blue-600 hover:text-blue-800">
              Resources
            </NuxtLink>
          </li>
          <li>
            <span class="mx-2 text-gray-400">/</span>
          </li>
          <li class="text-gray-500 truncate" aria-current="page">
            {{ resource?.title }}
          </li>
        </ol>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow rounded-lg p-6 animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div class="h-32 bg-gray-200 rounded mb-6"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error || !resource" class="text-center py-12">
        <div class="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p class="text-red-600 text-lg mb-4">
          {{ error || 'Resource not found' }}
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
        >
          Back to Home
        </NuxtLink>
      </div>

      <!-- Resource Detail Content -->
      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Resource Header -->
        <div class="p-6 border-b border-gray-200">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div>
              <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
                {{ resource.title }}
              </h1>
              <p class="mt-2 text-gray-600">
                {{ resource.category }}
              </p>
            </div>
            <div class="mt-4 sm:mt-0">
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200"
              >
                Visit Resource
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ml-2 h-4 w-4"
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
            </div>
          </div>
        </div>

        <!-- Resource Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="md:col-span-2">
              <!-- Description -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <p class="text-gray-700 leading-relaxed">
                  {{ resource.description }}
                </p>
              </div>

              <!-- Free Tier Benefits -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Free Tier Benefits
                </h2>
                <ul class="space-y-2">
                  <li
                    v-for="(benefit, index) in resource.benefits"
                    :key="index"
                    class="flex items-start"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-gray-700">{{ benefit }}</span>
                  </li>
                </ul>
              </div>

              <!-- Additional Information -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Additional Information
                </h2>
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Pricing Model
                    </dt>
                    <dd class="mt-1 text-gray-900">
                      {{ resource.pricingModel }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Difficulty
                    </dt>
                    <dd class="mt-1 text-gray-900">
                      {{ resource.difficulty }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Date Added
                    </dt>
                    <dd class="mt-1 text-gray-900">
                      {{ formatDate(resource.dateAdded) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Popularity
                    </dt>
                    <dd class="mt-1 text-gray-900">
                      <div class="flex items-center">
                        <span class="mr-2">{{ resource.popularity }}/5</span>
                        <div class="flex">
                          <svg
                            v-for="star in 5"
                            :key="star"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            :class="
                              star <= resource.popularity
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            "
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                        </div>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="md:col-span-1">
              <!-- Tags -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span
                    v-for="tag in resource.tags"
                    :key="tag"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ tag }}
                  </span>
                </div>

                <!-- Hierarchical Tags if available -->
                <div
                  v-if="
                    resource.hierarchicalTags &&
                    resource.hierarchicalTags.length > 0
                  "
                  class="mt-4"
                >
                  <h4 class="text-md font-medium text-gray-700 mb-2">
                    Hierarchical Categories
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="hierarchicalTag in resource.hierarchicalTags"
                      :key="hierarchicalTag"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {{ getHierarchicalTagName(hierarchicalTag) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Technologies -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">
                  Technologies
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tech in resource.technology"
                    :key="tech"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>

              <!-- Share Section -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Share</h3>
                <SocialShare
                  :title="resource.title"
                  :description="resource.description"
                  :url="currentUrl"
                  resource-type="resource-detail"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Resources Section -->
      <div v-if="relatedResources && relatedResources.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ResourceCard
            v-for="resource in relatedResources"
            :key="resource.id"
            :title="resource.title"
            :description="resource.description"
            :benefits="resource.benefits"
            :url="resource.url"
            :button-label="getButtonLabel(resource.category)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResources, type Resource } from '~/composables/useResources'
import ResourceCard from '~/components/ResourceCard.vue'
import SocialShare from '~/components/SocialShare.vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRequestURL } from '#imports'
import { useHierarchicalTags } from '~/composables/useHierarchicalTags'

const route = useRoute()

// Get current URL for social sharing
const currentUrl = computed(() => {
  if (process.client) {
    return window.location.href
  }
  // In server-side rendering, use the request URL if available
  try {
    const requestURL = useRequestURL()
    return requestURL.href
  } catch {
    // Fallback to a default URL in case useRequestURL is not available
    return typeof window !== 'undefined'
      ? window.location.href
      : 'https://example.com/resources/' + route.params.id
  }
})

// Add date formatting function
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Get hierarchical tags service
const { findTagById } = useHierarchicalTags()

// Function to get hierarchical tag name by ID
const getHierarchicalTagName = (tagId: string): string => {
  const tag = findTagById(tagId)
  return tag ? tag.name : tagId // Return tag name or ID if not found
}

// Additional methods from the original script...
const getButtonLabel = (category: string) => {
  if (!category) return 'Get Free Access'
  const categoryLower = category.toLowerCase()
  if (categoryLower.includes('ai') || categoryLower.includes('tool'))
    return 'Try AI Tool'
  if (categoryLower.includes('hosting') || categoryLower.includes('server'))
    return 'Get Hosting'
  if (categoryLower.includes('database') || categoryLower.includes('db'))
    return 'Connect Database'
  return 'Get Free Access'
}
</script>
