import { readBody } from 'h3'
import type { Submission } from '~/types/submission'

// Mock data for demonstration - in a real application, this would come from a database
let mockSubmissions: Submission[] = []

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.submissionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID is required',
      })
    }
    
    if (!body.reviewedBy) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reviewer ID is required',
      })
    }
    
    // Validate rejection reason
    if (!body.rejectionReason || typeof body.rejectionReason !== 'string' || body.rejectionReason.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Rejection reason is required',
      })
    }
    
    // Find the submission
    const submissionIndex = mockSubmissions.findIndex(sub => sub.id === body.submissionId)
    
    if (submissionIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }
    
    // Update the submission status
    const submission = mockSubmissions[submissionIndex]
    submission.status = 'rejected'
    submission.reviewedBy = body.reviewedBy
    submission.reviewedAt = new Date().toISOString()
    submission.rejectionReason = body.rejectionReason
    submission.notes = body.notes || ''
    
    // In a real application, we would notify the submitter about rejection
    // For now, we'll just log it
    console.log(`Notification: Submission ${submission.id} rejected for user ${submission.submittedBy}`)
    
    return {
      success: true,
      message: 'Submission rejected successfully',
    }
  } catch (error: any) {
    console.error('Error rejecting submission:', error)
    
    if (error.statusCode) {
      return {
        success: false,
        message: error.statusMessage,
      }
    }
    
    return {
      success: false,
      message: 'An error occurred while rejecting the submission',
    }
  }
})
    }

    if (!body.reviewedBy) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reviewer ID is required',
      })
    }

    // Validate rejection reason
    if (
      !body.rejectionReason ||
      typeof body.rejectionReason !== 'string' ||
      body.rejectionReason.trim().length === 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Rejection reason is required',
      })
    }

    // Find the submission
    const submissionIndex = mockSubmissions.findIndex(
      sub => sub.id === body.submissionId
    )

    if (submissionIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }

    // Update the submission status
    const submission = mockSubmissions[submissionIndex]
    submission.status = 'rejected'
    submission.reviewedBy = body.reviewedBy
    submission.reviewedAt = new Date().toISOString()
    submission.rejectionReason = body.rejectionReason
    submission.notes = body.notes || ''

    return {
      success: true,
      message: 'Submission rejected successfully',
    }
  } catch (error: any) {
    console.error('Error rejecting submission:', error)

    if (error.statusCode) {
      return {
        success: false,
        message: error.statusMessage,
      }
    }

    return {
      success: false,
      message: 'An error occurred while rejecting the submission',
    }
  }
})
