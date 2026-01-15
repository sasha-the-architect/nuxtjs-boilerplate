// API endpoint for approving submissions
import type { Submission } from '~/types/submission'
import { readBody } from 'h3'
import {
  runQualityChecks,
  calculateQualityScore,
} from '~/server/utils/quality-checks'
import { logError, logInfo } from '~/utils/errorLogger'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendNotFoundError,
} from '~/server/utils/api-response'

const mockSubmissions: Submission[] = []
const mockResources: unknown[] = []

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const body = await readBody(event)

    if (!body.reviewedBy) {
      return sendBadRequestError(event, 'Reviewer ID is required')
    }

    const submissionIndex = mockSubmissions.findIndex(
      sub => sub.id === body.submissionId
    )

    if (submissionIndex === -1) {
      return sendNotFoundError(event, 'Submission', body.submissionId)
    }

    const submission = mockSubmissions[submissionIndex]
    if (!submission) {
      return sendNotFoundError(event, 'Submission', body.submissionId)
    }

    submission.status = 'approved'
    submission.reviewedBy = body.reviewedBy
    submission.reviewedAt = new Date().toISOString()
    submission.notes = body.notes || ''

    const qualityChecks = runQualityChecks(submission.resourceData)
    const qualityScore = calculateQualityScore(qualityChecks)

    const newResource = {
      ...submission.resourceData,
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      status: 'approved',
      submittedBy: submission.submittedBy,
      reviewedBy: submission.reviewedBy,
      reviewedAt: submission.reviewedAt,
      qualityScore,
      flags: [],
      dateAdded: new Date().toISOString(),
      popularity: 0,
      viewCount: 0,
    } as Record<string, unknown>

    ;(mockResources as unknown[]).push(newResource)

    logInfo(
      `Notification: Submission ${submission.id} approved for user ${submission.submittedBy}`,
      undefined,
      'moderation/approve.post'
    )

    return sendSuccessResponse(event, {
      message: 'Submission approved successfully',
      resource: newResource,
      qualityChecks,
      qualityScore,
    })
  } catch (error) {
    logError(
      'Error approving submission:',
      error instanceof Error ? error : undefined,
      'moderation/approve.post'
    )
  }
})
