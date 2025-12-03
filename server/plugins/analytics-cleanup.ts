// server/plugins/analytics-cleanup.ts
import { defineNitroPlugin } from 'nitropack/runtime'
import { runAnalyticsCleanup } from '../utils/analyticsCleanup'

export default defineNitroPlugin(() => {
  console.log('Analytics cleanup plugin initialized')

  // Run cleanup once when the server starts
  runAnalyticsCleanup().catch(error => {
    console.error('Error during initial analytics cleanup:', error)
  })

  // Set up periodic cleanup (every 24 hours)
  const cleanupInterval = setInterval(
    () => {
      console.log('Running scheduled analytics cleanup...')
      runAnalyticsCleanup().catch(error => {
        console.error('Error during scheduled analytics cleanup:', error)
      })
    },
    24 * 60 * 60 * 1000
  ) // 24 hours

  // Clean up interval when Nitro shuts down
  process.on('SIGINT', () => {
    clearInterval(cleanupInterval)
    console.log('Analytics cleanup interval cleared')
  })
})
