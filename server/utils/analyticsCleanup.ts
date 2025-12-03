// server/utils/analyticsCleanup.ts
import db from './db'

/**
 * Clean up old analytics events based on retention policy
 * @param daysToKeep Number of days to keep analytics data (default: 90 days)
 */
export async function cleanupOldAnalyticsEvents(daysToKeep: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  try {
    const deletedCount = await db.analyticsEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })

    console.log(`Cleaned up ${deletedCount.count} old analytics events`)
    return deletedCount.count
  } catch (error) {
    console.error('Error cleaning up old analytics events:', error)
    throw error
  }
}

/**
 * Run analytics cleanup based on retention policy
 */
export async function runAnalyticsCleanup() {
  // Default retention is 90 days, but could be configured via environment variable
  const retentionDays = parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90')

  if (retentionDays > 0) {
    await cleanupOldAnalyticsEvents(retentionDays)
  }
}
