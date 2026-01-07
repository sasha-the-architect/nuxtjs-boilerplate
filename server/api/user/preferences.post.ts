// server/api/user/preferences.post.ts
// API endpoint to update user preferences (mock implementation)

import { readBody, getQuery } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

interface UpdatePreferencesBody {
  categories?: string[]
  technologies?: string[]
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  interests?: string[]
  notificationSettings?: {
    resourceUpdates?: boolean
    newContent?: boolean
    weeklyDigest?: boolean
  }
  privacySettings?: {
    allowPersonalization?: boolean
    allowDataCollection?: boolean
    allowRecommendationExplanations?: boolean
  }
}

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const body = await readBody<UpdatePreferencesBody>(event)
    const query = getQuery(event)
    const userId = (query.userId as string) || 'default-user'

    // Validate the request body
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request body is required',
      })
    }

    // In a real implementation, we would update the user's preferences in a database
    // For this mock, we'll just return the updated preferences

    const updatedPreferences = {
      id: userId,
      categories: body.categories || [],
      technologies: body.technologies || [],
      skillLevel: body.skillLevel || 'intermediate',
      interests: body.interests || [],
      notificationSettings: {
        resourceUpdates: body.notificationSettings?.resourceUpdates ?? true,
        newContent: body.notificationSettings?.newContent ?? true,
        weeklyDigest: body.notificationSettings?.weeklyDigest ?? true,
      },
      privacySettings: {
        allowPersonalization:
          body.privacySettings?.allowPersonalization ?? true,
        allowDataCollection: body.privacySettings?.allowDataCollection ?? true,
        allowRecommendationExplanations:
          body.privacySettings?.allowRecommendationExplanations ?? true,
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    return {
      success: true,
      preferences: updatedPreferences,
    }
  } catch (error: any) {
    console.error('Error updating user preferences:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update user preferences',
    })
  }
})
