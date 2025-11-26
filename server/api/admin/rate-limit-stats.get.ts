import { setResponseStatus, getRequestHeader } from 'h3'
import { performanceMonitor } from '~/utils/performanceMonitor'
import { apiCache } from '~/utils/cache'

// Admin endpoint to get rate limit and performance statistics
export default defineEventHandler(event => {
  // Check for admin authentication
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    setResponseStatus(event, 401)
    return {
      success: false,
      message: 'Unauthorized: Admin access required',
    }
  }

  // Get performance statistics
  const stats = performanceMonitor.getStats()
  const cacheStats = performanceMonitor.getCacheStats()
  const cacheInfo = apiCache.getStats()

  return {
    success: true,
    data: {
      performance: stats,
      cache: {
        ...cacheStats,
        cacheInfo,
      },
      timestamp: new Date().toISOString(),
    },
  }
})
