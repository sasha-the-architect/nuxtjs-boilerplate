import type { Submission } from '~/types/submission'
import { readBody } from 'h3'
import { runQualityChecks, calculateQualityScore } from '~/server/utils/quality-checks'

// Mock data for demonstration - in a real application, this would come from a database
let mockSubmissions: Submission[] = []
let mockResources: any[] = []

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
    submission.status = 'approved'
    submission.reviewedBy = body.reviewedBy
    submission.reviewedAt = new Date().toISOString()
    submission.notes = body.notes || ''
    
    // Run quality checks and calculate score
    const qualityChecks = runQualityChecks(submission.resourceData)
    const qualityScore = calculateQualityScore(qualityChecks)
    
    // Create the resource from the submission data
    const newResource = {
      ...submission.resourceData,
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'approved',
      submittedBy: submission.submittedBy,
      reviewedBy: submission.reviewedBy,
      reviewedAt: submission.reviewedAt,
      qualityScore,
      flags: [], // Initialize empty flags array
      dateAdded: new Date().toISOString(),
      popularity: 0, // New resources start with 0 popularity
      viewCount: 0,
    }
    
    // Add to resources (in a real app, this would be stored in a database)
    mockResources.push(newResource)
    
    // In a real application, we would notify the submitter about approval
    // For now, we'll just log it
    console.log(`Notification: Submission ${submission.id} approved for user ${submission.submittedBy}`)
    
    return {
      success: true,
      message: 'Submission approved successfully',
      resource: newResource,
      qualityChecks,
      qualityScore,
    }
  } catch (error: any) {
    console.error('Error approving submission:', error)
    
    if (error.statusCode) {
      return {
        success: false,
        message: error.statusMessage,
      }
    }
    
    return {
      success: false,
      message: 'An error occurred while approving the submission',
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
    submission.status = 'approved'
    submission.reviewedBy = body.reviewedBy
    submission.reviewedAt = new Date().toISOString()
    submission.notes = body.notes || ''

    // Create the resource from the submission data
    const newResource = {
      ...submission.resourceData,
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'approved',
      submittedBy: submission.submittedBy,
      reviewedBy: submission.reviewedBy,
      reviewedAt: submission.reviewedAt,
      dateAdded: new Date().toISOString(),
      popularity: 0, // New resources start with 0 popularity
      viewCount: 0,
    }

    // Add to resources (in a real app, this would be stored in a database)
    mockResources.push(newResource)

    return {
      success: true,
      message: 'Submission approved successfully',
      resource: newResource,
    }
  } catch (error: any) {
    console.error('Error approving submission:', error)

    if (error.statusCode) {
      return {
        success: false,
        message: error.statusMessage,
      }
    }

    return {
      success: false,
      message: 'An error occurred while approving the submission',
    }
  }
})
