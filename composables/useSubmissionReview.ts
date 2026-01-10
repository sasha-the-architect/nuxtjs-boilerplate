/**
 * Composable for submission review management
 * Handles submission approval, rejection, and state management
 *
 * Architecture:
 * - Business logic layer: Manages submission moderation operations
 * - Data access layer: Communicates with API endpoints
 * - Separation of concerns: Components handle presentation only
 */
import { ref } from 'vue'
import { logError } from '~/utils/errorLogger'
import type { Submission } from '~/types/submission'

export interface SubmissionReviewOptions {
  submissionId: string
  reviewedBy?: string
}

export const useSubmissionReview = (options: SubmissionReviewOptions) => {
  const { submissionId, reviewedBy = 'moderator_123' } = options

  const loading = ref(true)
  const error = ref('')
  const submission = ref<Submission | null>(null)
  const rejectionReason = ref('')

  const fetchSubmission = async () => {
    try {
      loading.value = true
      error.value = ''

      const response = await $fetch(`/api/submissions/${submissionId}`)

      if (response.success) {
        submission.value = response.submission
      } else {
        error.value = response.message || 'Failed to load submission'
      }
    } catch (err) {
      error.value = 'An error occurred while fetching submission'
      logError(
        'Error fetching submission in useSubmissionReview:',
        err as Error,
        'useSubmissionReview'
      )
    } finally {
      loading.value = false
    }
  }

  const approveSubmission = async () => {
    if (!submission.value) return false

    try {
      const response = await $fetch('/api/moderation/approve', {
        method: 'POST',
        body: {
          submissionId,
          reviewedBy,
          notes: 'Approved via moderation interface',
        },
      })

      if (response.success) {
        submission.value.status = 'approved'
        submission.value.reviewedBy = reviewedBy
        submission.value.reviewedAt = new Date().toISOString()
        return true
      } else {
        error.value = response.message || 'Failed to approve submission'
        return false
      }
    } catch (err) {
      logError(
        'Error approving submission:',
        err as Error,
        'useSubmissionReview'
      )
      error.value = 'An error occurred while approving submission'
      return false
    }
  }

  const rejectSubmission = async (reason: string) => {
    if (!submission.value) return false

    if (!reason.trim()) {
      error.value = 'Please provide a reason for rejection'
      return false
    }

    try {
      const response = await $fetch('/api/moderation/reject', {
        method: 'POST',
        body: {
          submissionId,
          reviewedBy,
          rejectionReason: reason,
          notes: 'Rejected via moderation interface',
        },
      })

      if (response.success) {
        submission.value.status = 'rejected'
        submission.value.reviewedBy = reviewedBy
        submission.value.reviewedAt = new Date().toISOString()
        submission.value.rejectionReason = reason
        return true
      } else {
        error.value = response.message || 'Failed to reject submission'
        return false
      }
    } catch (err) {
      logError(
        'Error rejecting submission:',
        err as Error,
        'useSubmissionReview'
      )
      error.value = 'An error occurred while rejecting submission'
      return false
    }
  }

  return {
    loading,
    error,
    submission,
    rejectionReason,
    fetchSubmission,
    approveSubmission,
    rejectSubmission,
  }
}
