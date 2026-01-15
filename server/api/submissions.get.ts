import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // For now, return an empty array since we're not persisting submissions to a real database
    // In a real implementation, this would fetch from a database
    const responseData = {
      submissions: [],
      note: 'Submissions are not currently persisted to database',
    }

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    // In production, we might want to use a proper error tracking service instead of console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching submissions:', error)
    }

    return handleApiRouteError(event, error)
  }
})
