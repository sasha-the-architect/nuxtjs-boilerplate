import db from './db'
import { logger } from '~/utils/logger'

export async function cleanupOldAnalyticsEvents(daysToKeep: number = 90) {
  if (!db || !db.analyticsEvent) {
    logger.warn('Database not available - skipping analytics cleanup')
    return 0
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  const cutoffTimestamp = cutoffDate.getTime()
  const deletedAt = Date.now()

  try {
    const result = await db.analyticsEvent.updateMany({
      where: {
        timestamp: {
          lt: cutoffTimestamp,
        },
        deletedAt: null,
      },
      data: {
        deletedAt,
      },
    })

    logger.info(`Soft-deleted ${result.count} old analytics events`)
    return result.count
  } catch (error) {
    logger.error('Error cleaning up old analytics events:', error)
    throw error
  }
}

export async function runAnalyticsCleanup() {
  const retentionDays = parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90')

  if (retentionDays > 0) {
    await cleanupOldAnalyticsEvents(retentionDays)
  }
}
