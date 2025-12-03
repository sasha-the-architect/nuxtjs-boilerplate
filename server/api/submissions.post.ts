// For Nuxt 3, we'll use the built-in storage system instead of file system directly
import { defineEventHandler, readBody } from 'h3'
import { logger } from '~/utils/logger'
import type { Submission } from '~/types/submission'

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
      throw createError({
        statusCode: 400,
        statusMessage: 'Title is required',
        data: {
          errors: [{ field: 'title', message: 'Title is required' }],
        },
      })
    }

    if (
      !body.description ||
      typeof body.description !== 'string' ||
      body.description.trim().length < 10
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Description must be at least 10 characters',
        data: [
          {
            field: 'description',
            message: 'Description must be at least 10 characters',
          },
        ],
      })
    }

    if (!body.url || typeof body.url !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL is required',
        data: { errors: [{ field: 'url', message: 'URL is required' }] },
      })
    }

    // Basic URL validation
    try {
      new URL(body.url)
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL must be valid',
        data: { errors: [{ field: 'url', message: 'URL must be valid' }] },
      })
    }

    if (
      !body.category ||
      typeof body.category !== 'string' ||
      body.category.trim().length === 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category is required',
        data: {
          errors: [{ field: 'category', message: 'Category is required' }],
        },
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

    return {
      success: true,
      message: 'Resource submitted successfully',
      submissionId: submission.id,
    }
  } catch (error: any) {
    logger.error('Error processing submission:', error)

    // Return proper error response
    if (error.statusCode) {
      return {
        success: false,
        message: error.statusMessage,
        errors: error.data,
      }
    }

    return {
      success: false,
      message: 'An error occurred while processing your submission',
    }
  }
})
