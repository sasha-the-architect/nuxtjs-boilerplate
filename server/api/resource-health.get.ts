/**
 * GET /api/resource-health
 *
 * Retrieve the health status of all resources
 */

import {
  getAllResourceHealthStatuses,
  getResourceHealthStats,
} from '../utils/resourceHealth'
import { logger } from '~/utils/logger'

export default defineEventHandler(async () => {
  try {
    const healthStatuses = getAllResourceHealthStatuses()
    const stats = getResourceHealthStats()

    return {
      success: true,
      data: {
        resources: healthStatuses,
        stats,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    logger.error('Error fetching resource health:', error)

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
