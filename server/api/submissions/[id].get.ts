import type { Submission } from '~/types/submission'

// Mock data for demonstration - in a real application, this would come from a database
const mockSubmissions: Submission[] = []

import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const id = event.context.params?.id as string

    if (!id) {
      sendBadRequestError(event, 'Submission ID is required')
      return
    }

    // Find the submission
    const submission = mockSubmissions.find(sub => sub.id === id)

    if (!submission) {
      sendNotFoundError(event, 'Submission', id)
      return
    }

    sendSuccessResponse(event, submission)
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
