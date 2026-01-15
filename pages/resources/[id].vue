<template>
  <div class="py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb Navigation -->
      <ResourceBreadcrumbs :title="resource?.title || ''" />

      <!-- Loading State -->
      <div
        v-if="loading"
        class="bg-white shadow rounded-lg p-6 animate-pulse"
      >
        <div class="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-6" />
        <div class="h-32 bg-gray-200 rounded mb-6" />
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4" />
        <div class="h-4 bg-gray-200 rounded w-2/3 mb-6" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="h-4 bg-gray-200 rounded w-full mb-2" />
          <div class="h-4 bg-gray-200 rounded w-full mb-2" />
          <div class="h-4 bg-gray-200 rounded w-full mb-2" />
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error || !resource"
        class="text-center py-12"
      >
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
      <div
        v-else
        class="bg-white shadow rounded-lg overflow-hidden"
      >
        <ResourceHeader
          :title="resource.title"
          :category="resource.category"
          :status="resource.status"
          :health-score="resource.healthScore"
          :url="resource.url"
        />

        <div class="p-6">
          <ResourceDetails
            :title="resource.title"
            :description="resource.description"
            :benefits="resource.benefits"
            :screenshots="resource.screenshots"
            :specifications="resource.specifications"
            :features="resource.features"
            :limitations="resource.limitations"
            :status="resource.status"
            :migration-path="resource.migrationPath"
            :deprecation-date="resource.deprecationDate"
            @image-error="handleImageError"
          />

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-2">
              <ClientOnly>
                <LazyResourceAnalytics :analytics-data="analyticsData" />
              </ClientOnly>
            </div>

            <!-- Sidebar -->
            <div class="md:col-span-1">
              <!-- Resource Status and Lifecycle -->
              <div
                v-if="resource.statusHistory || resource.updateHistory"
                class="mb-8"
              >
                <h3 class="text-lg font-medium text-gray-900 mb-3">
                  Lifecycle
                </h3>
                <LifecycleTimeline
                  :status-history="resource.statusHistory"
                  :update-history="resource.updateHistory"
                />
              </div>

              <!-- Health Monitor -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">
                  Health
                </h3>
                <HealthMonitor
                  :resource-id="resource.id"
                  :url="resource.url"
                />
              </div>

              <!-- Tags -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">
                  Tags
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in resource.tags"
                    :key="tag"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ tag }}
                  </span>
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

              <ClientOnly>
                <LazyResourceShare
                  :share-urls="shareUrls"
                  @copy="copyToClipboard"
                />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>

      <ClientOnly>
        <LazyResourceSimilar :resources="relatedResources" />
      </ClientOnly>

      <!-- Alternative Suggestions Section -->
      <div class="mt-12">
        <ClientOnly>
          <LazyAlternativeSuggestions
            v-if="resource"
            :resource="resource"
          />
        </ClientOnly>
      </div>

      <ClientOnly>
        <LazyResourceComments
          :comments="[]"
          :comment-count="0"
          @submit="handleCommentSubmit"
        />
      </ClientOnly>

      <!-- Recommendations Section -->
      <div class="mt-12">
        <ClientOnly>
          <LazyRecommendationsSection
            :current-resource="resource"
            :current-category="resource?.category"
          />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ResourceBreadcrumbs from '~/components/ResourceBreadcrumbs.vue'
import ResourceHeader from '~/components/ResourceHeader.vue'
import ResourceDetails from '~/components/ResourceDetails.vue'
import LifecycleTimeline from '~/components/LifecycleTimeline.vue'
import HealthMonitor from '~/components/HealthMonitor.vue'
import { useResourceDetailPage } from '~/composables/useResourceDetailPage'

const {
  loading,
  error,
  resource,
  relatedResources,
  analyticsData,
  shareUrls,
  copyToClipboard,
  handleImageError,
  handleCommentSubmit,
} = useResourceDetailPage()
</script>
