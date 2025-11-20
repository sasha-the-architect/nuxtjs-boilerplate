// For Nuxt 3, we'll use the built-in storage system instead of file system directly
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async event => {
  try {
    // Parse the request body
    const body = await readBody(event)

    // Basic validation
    if (!body || typeof body !== 'object') {
      return {
        success: false,
        message: 'Invalid request body',
      }
    }

    // Required fields validation
    if (
      !body.title ||
      typeof body.title !== 'string' ||
      body.title.trim().length === 0
    ) {
      return {
        success: false,
        message: 'Title is required',
        errors: [{ field: 'title', message: 'Title is required' }],
      }
    }

    if (
      !body.description ||
      typeof body.description !== 'string' ||
      body.description.trim().length < 10
    ) {
      return {
        success: false,
        message: 'Description must be at least 10 characters',
        errors: [
          {
            field: 'description',
            message: 'Description must be at least 10 characters',
          },
        ],
      }
    }

    if (!body.url || typeof body.url !== 'string') {
      return {
        success: false,
        message: 'URL is required',
        errors: [{ field: 'url', message: 'URL is required' }],
      }
    }

    // Basic URL validation
    try {
      new URL(body.url)
    } catch {
      return {
        success: false,
        message: 'URL must be valid',
        errors: [{ field: 'url', message: 'URL must be valid' }],
      }
    }

    if (
      !body.category ||
      typeof body.category !== 'string' ||
      body.category.trim().length === 0
    ) {
      return {
        success: false,
        message: 'Category is required',
        errors: [{ field: 'category', message: 'Category is required' }],
      }
    }

    // Create a submission object with metadata
    const submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID
      title: body.title.trim(),
      description: body.description.trim(),
      url: body.url.trim(),
      category: body.category.trim(),
      tags: Array.isArray(body.tags) ? body.tags : [],
      status: 'pending', // Default status
      submittedAt: new Date().toISOString(),
      submittedBy: 'anonymous', // In a real app, this would be the user ID
      approvedAt: null,
      approvedBy: null,
      source: body.source || 'community',
    }

    // For now, we'll log the submission (in a real app, this would go to a database)
    console.log('New submission received:', submission)

    return {
      success: true,
      message: 'Resource submitted successfully',
      submissionId: submission.id,
    }
  } catch (error) {
    console.error('Error processing submission:', error)
    return {
      success: false,
      message: 'An error occurred while processing your submission',
    }
  }
})
