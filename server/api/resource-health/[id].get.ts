import { getRouterParam } from 'h3'
import { getResourceHealthStatus } from '../../utils/resourceHealth'
import { logger } from '~/utils/logger'

export default defineEventHandler(async event => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Resource ID is required',
      })
    }

    const healthStatus = getResourceHealthStatus(id)

    if (!healthStatus) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Resource health status not found',
      })
    }

    return {
      success: true,
      data: healthStatus,
    }
  } catch (error) {
    const err = error as {
      statusCode?: number
      statusMessage?: string
      message?: string
    }
    if (err.statusCode) {
      return {
        success: false,
        message: err.statusMessage,
        error:
          err.statusCode >= 500 && process.env.NODE_ENV === 'production'
            ? undefined
            : err.message,
      }
    }

    logger.error('Error fetching resource health by ID:', error)

    return {
      success: false,
      message: 'An error occurred while fetching resource health data',
      error:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : undefined,
    }
  }
})
