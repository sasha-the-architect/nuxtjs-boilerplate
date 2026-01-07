<template>
  <div class="py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb Navigation -->
      <ResourceBreadcrumbs :title="resource?.title || ''" />

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
              <div class="flex items-center mt-2 gap-2">
                <p class="text-gray-600">
                  {{ resource.category }}
                </p>
                <ResourceStatus
                  v-if="resource.status"
                  :status="resource.status"
                  :health-score="resource.healthScore"
                />
              </div>
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
          <!-- Deprecation notice if resource is deprecated or discontinued -->
          <DeprecationNotice
            v-if="
              resource.status &&
              (resource.status === 'deprecated' ||
                resource.status === 'discontinued' ||
                resource.status === 'pending')
            "
            :status="resource.status"
            :migration-path="resource.migrationPath"
            :deprecation-date="resource.deprecationDate"
          />

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
            </div>

            <!-- Screenshots/Gallery -->
            <div
              v-if="resource.screenshots && resource.screenshots.length > 0"
              class="mb-8"
            >
              <h2 class="text-xl font-semibold text-gray-900 mb-4">
                Screenshots
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="(screenshot, index) in resource.screenshots"
                  :key="index"
                  class="overflow-hidden rounded-lg border border-gray-200"
                >
                  <img
                    :src="screenshot"
                    :alt="`${resource.title} screenshot ${index + 1}`"
                    class="w-full h-48 object-cover"
                    @error="handleImageError"
                  />
                </div>
              </div>
            </div>

            <!-- Specifications -->
            <div
              v-if="
                resource.specifications &&
                Object.keys(resource.specifications).length > 0
              "
              class="mb-8"
            >
              <h2 class="text-xl font-semibold text-gray-900 mb-4">
                Specifications
              </h2>
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <template
                  v-for="(value, key) in resource.specifications"
                  :key="key"
                >
                  <div>
                    <dt class="text-sm font-medium text-gray-500 capitalize">
                      {{ key.replace(/([A-Z])/g, ' $1').trim() }}
                    </dt>
                    <dd class="mt-1 text-gray-900">{{ value }}</dd>
                  </div>
                </template>
              </dl>
            </div>

            <!-- Features -->
            <div
              v-if="resource.features && resource.features.length > 0"
              class="mb-8"
            >
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Features</h2>
              <ul class="space-y-2">
                <li
                  v-for="(feature, index) in resource.features"
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
                  <span class="text-gray-700">{{ feature }}</span>
                </li>
              </ul>
            </div>

            <!-- Limitations -->
            <div
              v-if="resource.limitations && resource.limitations.length > 0"
              class="mb-8"
            >
              <h2 class="text-xl font-semibold text-gray-900 mb-4">
                Limitations
              </h2>
              <ul class="space-y-2">
                <li
                  v-for="(limitation, index) in resource.limitations"
                  :key="index"
                  class="flex items-start"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="text-gray-700">{{ limitation }}</span>
                </li>
              </ul>
            </div>

            <!-- Resource Analytics -->
            <div v-if="analyticsData" class="mb-8 bg-gray-50 p-6 rounded-lg">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">
                Resource Analytics
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded border">
                  <div class="text-sm text-gray-500">Total Views</div>
                  <div class="text-2xl font-bold text-gray-900 mt-1">
                    {{ formatNumber(analyticsData.viewCount) }}
                  </div>
                </div>
                <div class="bg-white p-4 rounded border">
                  <div class="text-sm text-gray-500">Unique Visitors</div>
                  <div class="text-2xl font-bold text-gray-900 mt-1">
                    {{ formatNumber(analyticsData.uniqueVisitors) }}
                  </div>
                </div>
                <div class="bg-white p-4 rounded border">
                  <div class="text-sm text-gray-500">Last Viewed</div>
                  <div class="text-lg text-gray-900 mt-1">
                    {{ formatDate(analyticsData.lastViewed) }}
                  </div>
                </div>
              </div>

              <!-- Resource Statistics -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Resource Statistics
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-gray-900">
                      {{ resourceStats.viewCount }}
                    </div>
                    <div class="text-sm text-gray-600">Views</div>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-gray-900">
                      {{ resource.popularity }}/5
                    </div>
                    <div class="text-sm text-gray-600">Rating</div>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-gray-900">
                      <span
                        :class="
                          resourceStats.trending
                            ? 'text-green-600'
                            : 'text-gray-600'
                        "
                      >
                        {{ resourceStats.trending ? 'Trending' : 'Stable' }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-600">Status</div>
                  </div>
                </div>
              </div>

              <!-- Screenshots/Gallery Section -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Screenshots
                </h2>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <div
                    v-for="n in 3"
                    :key="n"
                    class="aspect-video bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-500"
                  >
                    Image {{ n }}
                  </div>
                </div>
              </div>

              <!-- User Reviews Section -->
              <div class="mb-8">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-semibold text-gray-900">
                    User Reviews
                  </h2>
                  <button
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Write a Review
                  </button>
                </div>

                <div class="space-y-4">
                  <!-- Sample review -->
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center">
                        <div
                          class="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10"
                        />
                        <div class="ml-3">
                          <div class="font-medium text-gray-900">User Name</div>
                          <div class="flex items-center">
                            <div class="flex">
                              <svg
                                v-for="star in 5"
                                :key="star"
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-4 w-4 text-yellow-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                />
                              </svg>
                            </div>
                            <span class="ml-2 text-sm text-gray-500"
                              >5 days ago</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                    <p class="text-gray-700 text-sm">
                      Great resource! Very helpful for my project. The free tier
                      provides enough functionality to get started.
                    </p>
                  </div>

                  <!-- More reviews would appear here -->
                  <div class="text-center py-4">
                    <button
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Load More Reviews
                    </button>
                  </div>
                </div>
              </div>

              <!-- Resource Statistics -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Resource Statistics
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-gray-900">
                      {{ resourceStats.viewCount }}
                    </div>
                    <div class="text-sm text-gray-600">Views</div>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-gray-900">
                      {{ resource.popularity }}/5
                    </div>
                    <div class="text-sm text-gray-600">Rating</div>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-gray-900">
                      <span
                        :class="
                          resourceStats.trending
                            ? 'text-green-600'
                            : 'text-gray-600'
                        "
                      >
                        {{ resourceStats.trending ? 'Trending' : 'Stable' }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-600">Status</div>
                  </div>
                </div>
              </div>

              <!-- Screenshots/Gallery Section -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">
                  Screenshots
                </h2>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <div
                    v-for="n in 3"
                    :key="n"
                    class="aspect-video bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-500"
                  >
                    Image {{ n }}
                  </div>
                </div>
              </div>

              <!-- User Reviews Section -->
              <div class="mb-8">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-semibold text-gray-900">
                    User Reviews
                  </h2>
                  <button
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Write a Review
                  </button>
                </div>

                <div class="space-y-4">
                  <!-- Sample review -->
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center">
                        <div
                          class="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10"
                        />
                        <div class="ml-3">
                          <div class="font-medium text-gray-900">User Name</div>
                          <div class="flex items-center">
                            <div class="flex">
                              <svg
                                v-for="star in 5"
                                :key="star"
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-4 w-4 text-yellow-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                />
                              </svg>
                            </div>
                            <span class="ml-2 text-sm text-gray-500"
                              >5 days ago</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                    <p class="text-gray-700 text-sm">
                      Great resource! Very helpful for my project. The free tier
                      provides enough functionality to get started.
                    </p>
                  </div>

                  <!-- More reviews would appear here -->
                  <div class="text-center py-4">
                    <button
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Load More Reviews
                    </button>
                  </div>
                </div>
              </div>
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
                <h3 class="text-lg font-medium text-gray-900 mb-3">Health</h3>
                <HealthMonitor :resource-id="resource.id" :url="resource.url" />
              </div>

              <!-- Tags -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Tags</h3>
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

              <!-- Share Section -->
              <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Share</h3>
                <div class="flex flex-wrap gap-3">
                  <a
                    :href="shareUrls.twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                      />
                    </svg>
                  </a>
                  <a
                    :href="shareUrls.facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                  </a>
                  <a
                    :href="shareUrls.linkedin"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 rounded-full bg-blue-800 text-white hover:bg-blue-900 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      />
                    </svg>
                  </a>
                  <a
                    :href="shareUrls.reddit"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    aria-label="Share on Reddit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"
                      />
                    </svg>
                  </a>
                  <button
                    class="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                    aria-label="Copy link to clipboard"
                    @click="copyToClipboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                      />
                      <path
                        d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Resources Section -->
      <div v-if="relatedResources && relatedResources.length > 0" class="mt-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Related Resources</h2>
          <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ResourceCard
            v-for="relatedResource in relatedResources"
            :key="relatedResource.id"
            :title="relatedResource.title"
            :description="relatedResource.description"
            :benefits="relatedResource.benefits"
            :url="relatedResource.url"
            :button-label="getButtonLabel(relatedResource.category)"
          />
        </div>
      </div>

      <!-- Alternative Suggestions Section -->
      <div class="mt-12">
        <AlternativeSuggestions v-if="resource" :resource="resource" />
      </div>

      <!-- User Comments Section -->
      <div class="mt-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Comments</h2>
          <span class="text-sm text-gray-500">3 comments</span>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <textarea
            placeholder="Share your thoughts about this resource..."
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
          ></textarea>
          <div class="mt-3 flex justify-end">
            <button
              class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              Post Comment
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Sample comments -->
          <div class="flex space-x-4">
            <div class="flex-shrink-0">
              <div
                class="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10"
              />
            </div>
            <div class="flex-1">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center">
                  <span class="font-medium text-gray-900">Jane Doe</span>
                  <span class="ml-2 text-sm text-gray-500">2 days ago</span>
                </div>
                <p class="mt-1 text-gray-700">
                  I've been using this for a few months now and it's been really
                  helpful for my development workflow.
                </p>
                <div class="mt-2 flex space-x-4">
                  <button class="text-sm text-gray-500 hover:text-gray-700">
                    Like (12)
                  </button>
                  <button class="text-sm text-gray-500 hover:text-gray-700">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex space-x-4">
            <div class="flex-shrink-0">
              <div
                class="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10"
              />
            </div>
            <div class="flex-1">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center">
                  <span class="font-medium text-gray-900">John Smith</span>
                  <span class="ml-2 text-sm text-gray-500">1 week ago</span>
                </div>
                <p class="mt-1 text-gray-700">
                  The free tier limitations are a bit restrictive, but overall
                  it's a great service.
                </p>
                <div class="mt-2 flex space-x-4">
                  <button class="text-sm text-gray-500 hover:text-gray-700">
                    Like (5)
                  </button>
                  <button class="text-sm text-gray-500 hover:text-gray-700">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations Section -->
      <div class="mt-12">
        <RecommendationsSection
          :current-resource="resource"
          :current-category="resource?.category"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResources, type Resource } from '~/composables/useResources'
import ResourceCard from '~/components/ResourceCard.vue'
import ResourceBreadcrumbs from '~/components/ResourceBreadcrumbs.vue'
import RecommendationsSection from '~/components/RecommendationsSection.vue'
import AlternativeSuggestions from '~/components/AlternativeSuggestions.vue'
import logger from '~/utils/logger'

import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig, useSeoMeta } from '#imports'
import { useNuxtApp } from '#app'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import { useResourceAnalytics } from '~/composables/useResourceAnalytics'
import { useHead } from '#imports'
import { generateResourceShareUrls } from '~/utils/shareUtils'
import { trackResourceView } from '~/utils/analytics'

const route = useRoute()
const {
  resources,
  loading: resourcesLoading,
  error: resourcesError,
} = useResources()
const loading = ref(true)
const error = ref<string | null>(null)
const resource = ref<Resource | null>(null)
const relatedResources = ref<Resource[]>([])
const analyticsData = ref<any>(null) // Resource analytics data
const resourceStats = ref({
  viewCount: 0,
  trending: false,
  lastViewed: '',
})

// Get current URL for sharing
const currentUrl = computed(() => {
  const runtimeConfig = useRuntimeConfig()
  return `${runtimeConfig.public.canonicalUrl}/resources/${route.params.id}`
})

// Format date function
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Format number with commas
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// Handle image error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/placeholder-image.jpg' // fallback image
}

// Get button label based on category
const getButtonLabel = (category: string) => {
  const categoryLabels: Record<string, string> = {
    'AI Tools': 'Try AI Tool',
    Hosting: 'Get Hosting',
    Databases: 'Connect Database',
    CDN: 'Use CDN',
    VPS: 'Get VPS',
    Analytics: 'Use Analytics',
    APIs: 'Use API',
    'Developer Tools': 'Use Tool',
    Design: 'Use Design Tool',
    Productivity: 'Boost Productivity',
  }
  return categoryLabels[category] || 'Get Resource'
}

// Enhanced related resources based on tags and category
const getEnhancedRelatedResources = (currentResource: Resource | null) => {
  if (!currentResource) return []

  // First get resources by category
  let categoryResources = resources.value.filter(
    r => r.category === currentResource.category && r.id !== currentResource.id
  )

  // If we don't have enough, get resources by tags
  if (categoryResources.length < 3) {
    const tagBasedResources = resources.value
      .filter(
        r =>
          r.id !== currentResource.id &&
          r.tags.some(tag => currentResource.tags.includes(tag))
      )
      .filter(r => !categoryResources.some(cr => cr.id === r.id)) // Avoid duplicates

    // Combine and limit to 6 total
    const combined = [...categoryResources, ...tagBasedResources].slice(0, 6)

    // Sort by relevance: category first, then tag matches
    return combined
      .sort((a, b) => {
        const aByCategory = a.category === currentResource.category ? 1 : 0
        const bByCategory = b.category === currentResource.category ? 1 : 0
        if (aByCategory !== bByCategory) return bByCategory - aByCategory

        // If same category status, sort by number of matching tags
        const aTagMatches = a.tags.filter(tag =>
          currentResource.tags.includes(tag)
        ).length
        const bTagMatches = b.tags.filter(tag =>
          currentResource.tags.includes(tag)
        ).length
        return bTagMatches - aTagMatches
      })
      .slice(0, 3)
  }

  return categoryResources.slice(0, 3)
}

// Fetch resource by ID
onMounted(async () => {
  try {
    // Wait for resources to load
    const loadResource = async () => {
      const resourceId = route.params.id as string
      resource.value = resources.value.find(r => r.id === resourceId) || null
      if (!resource.value) {
        error.value = 'Resource not found'
      } else {
        // Use the enhanced recommendation engine to find related resources
        const engine = useRecommendationEngine(resources.value)
        const recommendations = engine
          .getContentBasedRecommendations(resource.value!)
          .filter(rec => rec.resource.id !== resource.value?.id)
          .slice(0, 3) // Limit to 3 related resources

        relatedResources.value = recommendations.map(rec => rec.resource)

        // Get enhanced related resources
        relatedResources.value = getEnhancedRelatedResources(resource.value)

        // Fetch analytics data for this resource
        fetchResourceAnalytics(resourceId)

        // Fetch resource history (status and update history)
        fetchResourceHistory(resourceId)

        // Track resource view
        await trackResourceView(
          resource.value.id,
          resource.value.title,
          resource.value.category
        )

        // Set basic stats (in a real implementation, fetch from API)
        resourceStats.value = {
          viewCount: Math.floor(Math.random() * 1000) + 100, // Simulated view count
          trending: Math.random() > 0.5, // Simulated trending status
          lastViewed: new Date().toISOString(),
        }
      }
      loading.value = false
    }

    if (resourcesLoading.value) {
      // We need to wait until resources are loaded
      const checkResources = () => {
        if (!resourcesLoading.value) {
          loadResource()
        } else {
          setTimeout(checkResources, 100)
        }
      }
      checkResources()
    } else {
      loadResource()
    }
  } catch (err) {
    error.value = 'Failed to load resource'
    loading.value = false
  }
})

// Fetch resource history (status and update history)
const fetchResourceHistory = async (resourceId: string) => {
  try {
    const history = await $fetch(`/api/resources/${resourceId}/history`)
    if (history) {
      // Update resource with history data
      if (resource.value) {
        resource.value.statusHistory = history.statusHistory
        resource.value.updateHistory = history.updateHistory
      }
    }
  } catch (err) {
    logger.error('Error fetching resource history:', err)
    // If history fetch fails, continue without history data
  }
}

// Fetch analytics data for the resource
const fetchResourceAnalytics = async (resourceId: string) => {
  try {
    const response = await $fetch(`/api/analytics/resource/${resourceId}`)
    if (response && response.data) {
      analyticsData.value = response.data
    }
  } catch (err) {
    logger.error('Error fetching resource analytics:', err)
    // Set default values if analytics fetch fails
    analyticsData.value = {
      resourceId,
      viewCount: resource.value?.viewCount || 0,
      uniqueVisitors: 0,
      avgTimeOnPage: 0,
      bounceRate: 0,
      lastViewed: new Date().toISOString(),
    }
  }
}

// Copy URL to clipboard
const copyToClipboard = async () => {
  try {
    // Modern clipboard API approach
    await navigator.clipboard.writeText(currentUrl.value)
    // We could add a toast notification here in the future
  } catch (err) {
    // Fallback for older browsers that don't support Clipboard API
    try {
      // Try to use the deprecated execCommand as a last resort
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl.value
      // Avoid scrolling to the bottom
      textArea.setAttribute('readonly', '')
      textArea.style.cssText = `
         position: absolute;
         left: -9999px;
         top: -9999px;
         opacity: 0;
         pointer-events: none;
       `
      document.body.appendChild(textArea)
      textArea.select()
      textArea.setSelectionRange(0, 99999) // For mobile devices
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (!successful) {
        throw new Error('execCommand copy failed')
      }
    } catch (fallbackErr) {
      console.error('Failed to copy to clipboard:', fallbackErr)
      // Optionally show an error message to the user
    }
  }
}

// Generate share URLs with UTM parameters
const shareUrls = computed(() => {
  if (!resource.value) return {}
  return generateResourceShareUrls(
    currentUrl.value,
    resource.value.title,
    resource.value.description
  )
})

// Track resource view when the resource is loaded and update analytics data
if (resource.value) {
  // Use the analytics plugin to track the resource view
  const { $analytics } = useNuxtApp()
  if ($analytics && $analytics.trackResourceView) {
    $analytics.trackResourceView(
      resource.value.id,
      resource.value.title,
      resource.value.category
    )

    // Update the view count in the resource analytics data
    if (analyticsData.value) {
      analyticsData.value.viewCount = (analyticsData.value.viewCount || 0) + 1
    }
  }
}

// Set dynamic meta tags for the resource
const { title, description } = resource.value || {}
if (title && description) {
  useSeoMeta({
    title: `${title} - Free Resources for Developers`,
    ogTitle: `${title} - Free Resources for Developers`,
    description: `${description} - Discover this and other amazing free resources on Free Stuff on the Internet.`,
    ogDescription: `${description} - Discover this and other amazing free resources on Free Stuff on the Internet.`,
    ogUrl: currentUrl.value,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    // Enhanced SEO with structured data
    articlePublishedTime: resource.value?.dateAdded,
    articleModifiedTime: resource.value?.dateAdded,
  })

  // Add JSON-LD structured data for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication', // or 'WebSite' depending on the resource type
    name: resource.value.title,
    description: resource.value.description,
    url: resource.value.url,
    applicationCategory: resource.value.category,
    isBasedOn: resource.value.url,
    datePublished: resource.value.dateAdded,
    offers: {
      '@type': 'Offer',
      price: '0', // Free tier
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: resource.value.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: resource.value.rating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: resource.value.viewCount || 10, // Use view count as rating count if available
        }
      : undefined,
    keywords: resource.value.tags.join(', '),
    thumbnailUrl: resource.value.icon || undefined,
    operatingSystem: resource.value.platforms
      ? resource.value.platforms.join(', ')
      : undefined,
    softwareVersion: undefined, // Add version if available
  }

  // Remove undefined properties
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key]
    }
  })

  // Safely serialize JSON-LD to prevent XSS by escaping special characters
  const safeJsonLd = JSON.stringify(structuredData)
    .replace(/</g, '\\u003c') // Escape < to prevent script tags
    .replace(/>/g, '\\u003e') // Escape > to prevent script tags
    .replace(/\//g, '\\u002f') // Escape / to prevent closing script tags

  // Add the structured data to the page
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: safeJsonLd,
      },
    ],
  })
}
</script>
