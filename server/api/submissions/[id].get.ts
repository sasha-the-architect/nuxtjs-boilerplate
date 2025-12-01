import type { Submission } from '~/types/submission'

// Mock data for demonstration - in a real application, this would come from a database
let mockSubmissions: Submission[] = []

export default defineEventHandler(async event => {
  try {
    const id = event.context.params?.id

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID is required',
      })
    }

    // Find the submission
    const submission = mockSubmissions.find(sub => sub.id === id)

    if (!submission) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }

    return {
      success: true,
      submission,
    }
  } catch (error: any) {
    console.error('Error fetching submission:', error)

    if (error.statusCode) {
      return {
        success: false,
        message: error.statusMessage,
      }
    }

    return {
      success: false,
      message: 'An error occurred while fetching the submission',
    }
  }
})
