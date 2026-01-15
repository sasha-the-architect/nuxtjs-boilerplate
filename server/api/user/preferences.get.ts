// server/api/user/preferences.get.ts
// API endpoint to get user preferences (mock implementation)

import { getQuery } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  await rateLimit(event)
  try {
    // In a real implementation, this would fetch from a database based on authenticated user
    // For now, we'll return mock preferences or preferences from localStorage equivalent

    // Get userId from query or headers
    const query = getQuery(event)
    const userId = (query.userId as string) || 'default-user'

    // In a real app, we'd look up the user in a database
    // For this mock, we'll create default preferences
    const mockPreferences = {
      id: userId,
      categories: ['javascript', 'vue', 'nuxt', 'web-development'],
      technologies: ['typescript', 'react', 'nodejs'],
      skillLevel: 'intermediate',
      interests: ['frontend', 'backend', 'devops'],
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
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    return {
      success: true,
      preferences: mockPreferences,
    }
  } catch (error) {
    const err = error as { statusCode?: number; statusMessage?: string }
    console.error('Error getting user preferences:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to get user preferences',
    })
  }
})
