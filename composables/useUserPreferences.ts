import { ref, computed, readonly } from 'vue'
import logger from '~/utils/logger'
import type {
  UserPreferences,
  UserProfile,
  UserInteraction,
} from '~/types/user'
import { createStorage } from '~/utils/storage'

export const useUserPreferences = () => {
  const USER_PROFILE_KEY = 'userProfile'
  const storage = createStorage<UserProfile | null>(USER_PROFILE_KEY, null)

  const userProfile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const initProfile = async (userId?: string) => {
    try {
      loading.value = true
      error.value = null

      const storedProfile = storage.get()
      if (storedProfile) {
        userProfile.value = storedProfile
      } else {
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
        storage.set(userProfile.value)
      }
    } catch (err) {
      error.value = 'Failed to initialize user profile'
      logger.error('Error initializing user profile:', err)
    } finally {
      loading.value = false
    }
  }

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!userProfile.value) return false

    try {
      userProfile.value.preferences = {
        ...userProfile.value.preferences,
        ...preferences,
      }
      userProfile.value.lastActive = new Date().toISOString()

      storage.set(userProfile.value)

      return true
    } catch (err) {
      error.value = 'Failed to update preferences'
      logger.error('Error updating preferences:', err)
      return false
    }
  }

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

      storage.set(userProfile.value)

      return true
    } catch (err) {
      error.value = 'Failed to track interaction'
      logger.error('Error tracking interaction:', err)
      return false
    }
  }

  const getUserPreferences = computed(() => {
    return userProfile.value?.preferences || null
  })

  const getUserInterests = computed(() => {
    if (!userProfile.value) return []
    return [
      ...userProfile.value.preferences.categories,
      ...userProfile.value.preferences.technologies,
      ...userProfile.value.preferences.interests,
    ]
  })

  const getUserInteractions = computed(() => {
    return userProfile.value?.interactions || []
  })

  const getViewedResources = computed(() => {
    if (!userProfile.value) return []
    return userProfile.value.interactions
      .filter(i => i.interactionType === 'view')
      .map(i => i.resourceId)
  })

  const getBookmarkedResources = computed(() => {
    if (!userProfile.value) return []
    return userProfile.value.interactions
      .filter(i => i.interactionType === 'bookmark')
      .map(i => i.resourceId)
  })

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
