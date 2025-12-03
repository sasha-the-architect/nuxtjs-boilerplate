<template>
  <div
    class="user-preference-manager p-6 bg-white dark:bg-gray-800 rounded-lg shadow"
  >
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
      Personalize Your Experience
    </h2>

    <div class="space-y-6">
      <!-- Interests and Categories -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Your Interests
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Select categories and technologies you're interested in
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in availableCategories"
            :key="category"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              selectedCategories.includes(category)
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-600 dark:text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
            ]"
            @click="toggleCategory(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <!-- Skill Level -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Skill Level
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Tell us your experience level to get appropriate recommendations
        </p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            v-for="level in skillLevels"
            :key="level.value"
            :class="[
              'py-2 px-4 rounded-md text-center text-sm font-medium',
              selectedSkillLevel === level.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
            ]"
            @click="selectedSkillLevel = level.value"
          >
            {{ level.label }}
          </button>
        </div>
      </div>

      <!-- Notification Settings -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Notifications
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Choose what updates you'd like to receive
        </p>

        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="notificationSettings.resourceUpdates"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Updates to resources you've bookmarked
            </span>
          </label>

          <label class="flex items-center">
            <input
              v-model="notificationSettings.newContent"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              New content in your areas of interest
            </span>
          </label>

          <label class="flex items-center">
            <input
              v-model="notificationSettings.weeklyDigest"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Weekly digest of popular resources
            </span>
          </label>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Privacy Controls
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Control how your data is used to personalize recommendations
        </p>

        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="privacySettings.allowPersonalization"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Allow personalized recommendations
            </span>
          </label>

          <label class="flex items-center">
            <input
              v-model="privacySettings.allowDataCollection"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Allow usage data collection for improvements
            </span>
          </label>

          <label class="flex items-center">
            <input
              v-model="privacySettings.allowRecommendationExplanations"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Show explanations for why resources are recommended
            </span>
          </label>
        </div>
      </div>

      <!-- Save Button -->
      <div class="pt-4">
        <button
          :disabled="saving"
          class="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          @click="savePreferences"
        >
          {{ saving ? 'Saving...' : 'Save Preferences' }}
        </button>

        <div
          v-if="saveSuccess"
          class="mt-3 text-green-600 dark:text-green-400 text-sm"
        >
          Preferences saved successfully!
        </div>
        <div v-if="error" class="mt-3 text-red-600 dark:text-red-400 text-sm">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import logger from '~/utils/logger'
import { useUserPreferences } from '~/composables/useUserPreferences'

interface SkillLevel {
  value: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  label: string
}

const userPrefs = useUserPreferences()

// Available categories from the resource data
const availableCategories = ref<string[]>([
  'javascript',
  'typescript',
  'vue',
  'react',
  'angular',
  'svelte',
  'nuxt',
  'next',
  'nodejs',
  'python',
  'java',
  'csharp',
  'php',
  'mobile',
  'web-development',
  'backend',
  'frontend',
  'devops',
  'database',
  'testing',
  'design',
  'ai',
  'security',
])

// Selected categories
const selectedCategories = ref<string[]>([])

// Skill levels
const skillLevels: SkillLevel[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
]

// Selected skill level
const selectedSkillLevel = ref<SkillLevel['value']>('intermediate')

// Notification settings
const notificationSettings = ref({
  resourceUpdates: true,
  newContent: true,
  weeklyDigest: true,
})

// Privacy settings
const privacySettings = ref({
  allowPersonalization: true,
  allowDataCollection: true,
  allowRecommendationExplanations: true,
})

// UI state
const saving = ref(false)
const saveSuccess = ref(false)
const error = ref<string | null>(null)

// Initialize with existing preferences
onMounted(async () => {
  await userPrefs.initProfile()

  if (userPrefs.userProfile.value) {
    const prefs = userPrefs.userProfile.value.preferences
    selectedCategories.value = prefs.categories
    selectedSkillLevel.value = prefs.skillLevel
    notificationSettings.value = prefs.notificationSettings
    privacySettings.value = prefs.privacySettings
  }
})

// Toggle category selection
const toggleCategory = (category: string) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
}

// Save preferences
const savePreferences = async () => {
  saving.value = true
  error.value = null
  saveSuccess.value = false

  try {
    const success = await userPrefs.updatePreferences({
      categories: selectedCategories.value,
      technologies: selectedCategories.value, // For now, use categories as technologies too
      skillLevel: selectedSkillLevel.value,
      interests: selectedCategories.value, // For now, use categories as interests too
      notificationSettings: notificationSettings.value,
      privacySettings: privacySettings.value,
    })

    if (success) {
      saveSuccess.value = true
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      error.value = 'Failed to save preferences'
    }
  } catch (err) {
    error.value = 'An error occurred while saving preferences'
    logger.error('Error saving preferences:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
