// composables/useUserPreferences.ts
// Composable for managing user preferences and profiles

import { ref, computed, readonly } from 'vue'
import logger from '~/utils/logger'
import type {
  UserPreferences,
  UserProfile,
  UserInteraction,
} from '~/types/user'

export const useUserPreferences = () => {
  // In a real implementation, this would fetch from an API or localStorage
  // For now, we'll use a mock implementation
  const userProfile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Initialize user profile
  const initProfile = async (userId?: string) => {
    try {
      loading.value = true
      error.value = null

      // Check if we have a profile in localStorage
      const storedProfile = localStorage.getItem('userProfile')
      if (storedProfile) {
        userProfile.value = JSON.parse(storedProfile)
      } else {
        // Create default profile
        userProfile.value = {
          id: userId || `user_${Date.now()}`,
          preferences: {
            categories: [],
            technologies: [],
            skillLevel: 'intermediate',
            interests: [],
            notificationSettings: {
              resourceUpdates: true,
              newContent: true,
              weeklyDigest: true,
            },
            privacySettings: {
              allowPersonalization: true,
              allowDataCollection: true,
              allowRecommendationExplanations: true,
            },
          },
          interactions: [],
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        }
        localStorage.setItem('userProfile', JSON.stringify(userProfile.value))
      }
    } catch (err) {
      error.value = 'Failed to initialize user profile'
      logger.error('Error initializing user profile:', err)
    } finally {
      loading.value = false
    }
  }

  // Update user preferences
  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!userProfile.value) return false

    try {
      userProfile.value.preferences = {
        ...userProfile.value.preferences,
        ...preferences,
      }
      userProfile.value.lastActive = new Date().toISOString()

      // Update in localStorage
      localStorage.setItem('userProfile', JSON.stringify(userProfile.value))

      return true
    } catch (err) {
      error.value = 'Failed to update preferences'
      logger.error('Error updating preferences:', err)
      return false
    }
  }

  // Track user interaction
  const trackInteraction = async (
    interaction: Omit<UserInteraction, 'timestamp'>
  ) => {
    if (!userProfile.value) return false

    try {
      const newInteraction: UserInteraction = {
        ...interaction,
        timestamp: Date.now(),
      }

      userProfile.value.interactions.push(newInteraction)
      userProfile.value.lastActive = new Date().toISOString()

      // Update in localStorage
      localStorage.setItem('userProfile', JSON.stringify(userProfile.value))

      return true
    } catch (err) {
      error.value = 'Failed to track interaction'
      logger.error('Error tracking interaction:', err)
      return false
    }
  }

  // Get user preferences
  const getUserPreferences = computed(() => {
    return userProfile.value?.preferences || null
  })

  // Get user interests for recommendation engine
  const getUserInterests = computed(() => {
    if (!userProfile.value) return []
    return [
      ...userProfile.value.preferences.categories,
      ...userProfile.value.preferences.technologies,
      ...userProfile.value.preferences.interests,
    ]
  })

  // Get user interactions
  const getUserInteractions = computed(() => {
    return userProfile.value?.interactions || []
  })

  // Get viewed resource IDs
  const getViewedResources = computed(() => {
    if (!userProfile.value) return []
    return userProfile.value.interactions
      .filter(i => i.interactionType === 'view')
      .map(i => i.resourceId)
  })

  // Get bookmarked resource IDs
  const getBookmarkedResources = computed(() => {
    if (!userProfile.value) return []
    return userProfile.value.interactions
      .filter(i => i.interactionType === 'bookmark')
      .map(i => i.resourceId)
  })

  // Get user's skill level
  const getUserSkillLevel = computed(() => {
    return userProfile.value?.preferences.skillLevel || 'intermediate'
  })

  return {
    userProfile: readonly(userProfile),
    loading: readonly(loading),
    error: readonly(error),
    initProfile,
    updatePreferences,
    trackInteraction,
    getUserPreferences,
    getUserInterests,
    getUserInteractions,
    getViewedResources,
    getBookmarkedResources,
    getUserSkillLevel,
  }
}
