import { defineEventHandler, readBody } from 'h3'
import type { Submission } from '~/types/submission'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendNotFoundError,
  handleApiRouteError,
} from '~/server/utils/api-response'

// Mock data for demonstration - in a real application, this would come from a database
const mockSubmissions: Submission[] = []

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.submissionId) {
      return sendBadRequestError(event, 'Submission ID is required')
    }

    if (!body.reviewedBy) {
      return sendBadRequestError(event, 'Reviewer ID is required')
    }

    // Validate rejection reason
    if (
      !body.rejectionReason ||
      typeof body.rejectionReason !== 'string' ||
      body.rejectionReason.trim().length === 0
    ) {
      return sendBadRequestError(event, 'Rejection reason is required')
    }

    // Find submission
    const submissionIndex = mockSubmissions.findIndex(
      sub => sub.id === body.submissionId
    )

    if (submissionIndex === -1) {
      return sendNotFoundError(event, 'Submission', body.submissionId)
    }

    // Update submission status
    const submission = mockSubmissions[submissionIndex]
    submission.status = 'rejected'
    submission.reviewedBy = body.reviewedBy
    submission.reviewedAt = new Date().toISOString()
    submission.rejectionReason = body.rejectionReason
    submission.notes = body.notes || ''

    // In a real application, we would notify the submitter about rejection
    // For now, we'll just log it
    console.info(
      `Notification: Submission ${submission.id} rejected for user ${submission.submittedBy}`
    )

    return sendSuccessResponse(event, {
      message: 'Submission rejected successfully',
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
