/**
 * GET /api/resource-health
 *
 * Retrieve the health status of all resources
 */

import {
  getAllResourceHealthStatuses,
  getResourceHealthStats,
} from '../utils/resourceHealth'

export default defineEventHandler(async event => {
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
  } catch (error: any) {
    console.error('Error fetching resource health:', error)

    return {
      success: false,
      message: 'An error occurred while fetching resource health data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
