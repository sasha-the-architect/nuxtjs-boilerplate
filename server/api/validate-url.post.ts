/**
 * POST /api/validate-url
 *
 * Validate a single URL by checking its HTTP status
 */

import { validateUrl } from '~/utils/urlValidation'
import { logger } from '~/utils/logger'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)

    if (!body || !body.url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL is required in request body',
      })
    }

    const validationResult = await validateUrl(body.url, {
      timeout: body.timeout || 10000,
      retries: body.retries || 3,
      retryDelay: body.retryDelay || 1000,
    })

    return {
      success: true,
      data: validationResult,
    }
  } catch (error: any) {
    logger.error('Error validating URL:', error)

    return {
      success: false,
      message:
        error.statusMessage || 'An error occurred while validating the URL',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
