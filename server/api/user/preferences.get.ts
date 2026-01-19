import { getQuery } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { logger } from '~/utils/logger'

export default defineEventHandler(async event => {
  await rateLimit(event)
  try {
    const query = getQuery(event)
    const userId = (query.userId as string) || 'default-user'

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
    logger.error('Error getting user preferences:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to get user preferences',
    })
  }
})
