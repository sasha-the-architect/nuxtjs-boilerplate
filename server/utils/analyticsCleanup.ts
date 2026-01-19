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

  try {
    const deletedCount = await db.analyticsEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffTimestamp,
        },
      },
    })

    logger.info(`Cleaned up ${deletedCount.count} old analytics events`)
    return deletedCount.count
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
