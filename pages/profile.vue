<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Your Profile
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Manage your preferences and personalize your experience
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <UserPreferenceManager />
      </div>

      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Your Activity
          </h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Resources viewed
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ userPrefs.getViewedResources.value?.length || 0 }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Resources bookmarked
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ userPrefs.getBookmarkedResources.value?.length || 0 }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Categories followed
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ userPrefs.getUserInterests.value?.length || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recommendation Settings
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">Personalized recommendations</span>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowPersonalization
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                "
              >
                {{
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowPersonalization
                    ? 'On'
                    : 'Off'
                }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">Data collection</span>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowDataCollection
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                "
              >
                {{
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowDataCollection
                    ? 'On'
                    : 'Off'
                }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">Recommendation explanations</span>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowRecommendationExplanations
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                "
              >
                {{
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowRecommendationExplanations
                    ? 'On'
                    : 'Off'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserPreferences } from '~/composables/useUserPreferences'

// Set page metadata
useHead({
  title: 'Your Profile - Personalize Your Experience',
  meta: [
    {
      name: 'description',
      content:
        'Manage your preferences and personalize your resource recommendations',
    },
  ],
})

const userPrefs = useUserPreferences()

// Initialize user preferences
onMounted(async () => {
  await userPrefs.initProfile()
})
</script>
