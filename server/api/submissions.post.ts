// For Nuxt 3, we'll use the built-in storage system instead of file system directly
import { defineEventHandler, readBody } from 'h3'
import { logger } from '~/utils/logger'
import type { Submission } from '~/types/submission'
import {
  sendSuccessResponse,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    // Parse the request body
    const body = await readBody(event)

    // Basic validation
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body',
      })
    }

    // Required fields validation
    if (
      !body.title ||
      typeof body.title !== 'string' ||
      body.title.trim().length === 0
    ) {
      return sendBadRequestError(event, 'Title is required', {
        errors: [{ field: 'title', message: 'Title is required' }],
      })
    }

    if (
      !body.description ||
      typeof body.description !== 'string' ||
      body.description.trim().length < 10
    ) {
      return sendBadRequestError(
        event,
        'Description must be at least 10 characters',
        {
          errors: [
            {
              field: 'description',
              message: 'Description must be at least 10 characters',
            },
          ],
        }
      )
    }

    if (!body.url || typeof body.url !== 'string') {
      return sendBadRequestError(event, 'URL is required', {
        errors: [{ field: 'url', message: 'URL is required' }],
      })
    }

    // Basic URL validation
    try {
      new URL(body.url)
    } catch {
      return sendBadRequestError(event, 'URL must be valid', {
        errors: [{ field: 'url', message: 'URL must be valid' }],
      })
    }

    if (
      !body.category ||
      typeof body.category !== 'string' ||
      body.category.trim().length === 0
    ) {
      return sendBadRequestError(event, 'Category is required', {
        errors: [{ field: 'category', message: 'Category is required' }],
      })
    }

    // Create a submission object with metadata
    const submission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID
      resourceData: {
        title: body.title.trim(),
        description: body.description.trim(),
        url: body.url.trim(),
        category: body.category.trim(),
        tags: Array.isArray(body.tags) ? body.tags : [],
        pricingModel: body.pricingModel || 'Free',
        difficulty: body.difficulty || 'Beginner',
        technology: Array.isArray(body.technology) ? body.technology : [],
        benefits: Array.isArray(body.benefits) ? body.benefits : [],
      },
      status: 'pending', // Default status
      submittedAt: new Date().toISOString(),
      submittedBy: 'anonymous', // In a real app, this would be the user ID
    }

    // For now, we'll log the submission (in a real app, this would go to a database)

    return sendSuccessResponse(event, {
      message: 'Resource submitted successfully',
      submissionId: submission.id,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
