import {
  defineEventHandler,
  getQuery,
  setResponseHeader,
  setResponseStatus,
} from 'h3'
import { exportAnalyticsToCsv } from '~/server/utils/analytics-db'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { logger } from '~/utils/logger'

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const query = getQuery(event)

    const startDate = query.startDate
      ? new Date(query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = query.endDate
      ? new Date(query.endDate as string)
      : new Date()

    const csvContent = await exportAnalyticsToCsv(startDate, endDate)

    setResponseHeader(event, 'Content-Type', 'text/csv')
    setResponseHeader(
      event,
      'Content-Disposition',
      `attachment; filename="analytics-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`
    )

    setResponseHeader(event, 'Content-Length', Buffer.byteLength(csvContent))

    setResponseStatus(event, 200)
    return csvContent
  } catch (error) {
    logger.error('Analytics CSV export error:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }
  }
})
