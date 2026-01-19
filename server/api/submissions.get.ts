import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { logger } from '~/utils/logger'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    const responseData = {
      submissions: [],
      note: 'Submissions are not currently persisted to database',
    }

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    logger.error('Error fetching submissions:', error)
    return handleApiRouteError(event, error)
  }
})
