/**
 * POST /api/validate-url
 *
 * Validate a single URL by checking its HTTP status
 */

import { validateUrl } from '~/utils/urlValidation'
import { logger } from '~/utils/logger'
import {
  sendBadRequestError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export {}

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)

    if (!body || !body.url) {
      sendBadRequestError(event, 'URL is required in request body')
      return
    }

    const validationResult = await validateUrl(body.url, {
      timeout: body.timeout || 10000,
      retries: body.retries || 3,
      retryDelay: body.retryDelay || 1000,
      useCircuitBreaker: body.useCircuitBreaker !== false,
    })

    sendSuccessResponse(event, { validationResult })
  } catch (error) {
    logger.error('Error validating URL:', error)
    handleApiRouteError(event, error)
  }
})
