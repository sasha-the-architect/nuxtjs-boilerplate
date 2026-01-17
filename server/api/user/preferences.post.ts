// server/api/user/preferences.post.ts
// API endpoint to update user preferences (mock implementation)

import { readBody, getQuery } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { updateUserPreferencesSchema } from '~/server/utils/validation-schemas'
import { sendBadRequestError } from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const body = await readBody(event)
    const query = getQuery(event)
    const userId = (query.userId as string) || 'default-user'

    const validationResult = updateUserPreferencesSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map(e => e.message)
        .join(', ')
      return sendBadRequestError(event, errorMessages)
    }

    const validatedBody = validationResult.data

    const updatedPreferences = {
      id: userId,
      categories: validatedBody.categories || [],
      technologies: validatedBody.technologies || [],
      skillLevel: validatedBody.skillLevel || 'intermediate',
      interests: validatedBody.interests || [],
      notificationSettings: {
        resourceUpdates:
          validatedBody.notificationSettings?.resourceUpdates ?? true,
        newContent: validatedBody.notificationSettings?.newContent ?? true,
        weeklyDigest: validatedBody.notificationSettings?.weeklyDigest ?? true,
      },
      privacySettings: {
        allowPersonalization:
          validatedBody.privacySettings?.allowPersonalization ?? true,
        allowDataCollection:
          validatedBody.privacySettings?.allowDataCollection ?? true,
        allowRecommendationExplanations:
          validatedBody.privacySettings?.allowRecommendationExplanations ??
          true,
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    return {
      success: true,
      preferences: updatedPreferences,
    }
  } catch (error) {
    const err = error as { statusCode?: number; statusMessage?: string }
    console.error('Error updating user preferences:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update user preferences',
    })
  }
})
