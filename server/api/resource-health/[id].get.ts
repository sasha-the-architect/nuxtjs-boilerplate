/**
 * GET /api/resource-health/[id]
 *
 * Retrieve the health status of a specific resource by ID
 */

import { getRouterParam } from 'h3'
import { getResourceHealthStatus } from '../../utils/resourceHealth'

export default defineEventHandler(async event => {
  try {
    // Get the resource ID from the URL parameter
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
  } catch (error: any) {
    // Handle specific error types
    if (error.statusCode) {
      return {
        success: false,
        message: error.statusMessage,
        error:
          error.statusCode >= 500 && process.env.NODE_ENV === 'production'
            ? undefined
            : error.message,
      }
    }

    // Log error for debugging (in production, use proper error tracking)
    console.error('Error fetching resource health by ID:', error)

    return {
      success: false,
      message: 'An error occurred while fetching resource health data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
