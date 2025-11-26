import { setResponseStatus, readBody, getRequestHeader } from 'h3'
import { cacheManager } from '~/utils/cacheManager'
import { apiCache } from '~/utils/cache'

interface InvalidateRequest {
  pattern?: string
  type?: 'resources' | 'search' | 'all'
}

// Admin endpoint to invalidate cache
export default defineEventHandler(async event => {
  // Check for admin authentication
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    setResponseStatus(event, 401)
    return {
      success: false,
      message: 'Unauthorized: Admin access required',
    }
  }

  try {
    const body: InvalidateRequest = await readBody(event)

    let invalidatedCount = 0
    let message = ''

    if (body.pattern) {
      // Invalidate by pattern
      invalidatedCount = cacheManager.invalidateByPattern(body.pattern)
      message = `Invalidated ${invalidatedCount} cache entries matching pattern: ${body.pattern}`
    } else if (body.type) {
      // Invalidate by type
      switch (body.type) {
        case 'resources':
          cacheManager.invalidateResourceCaches()
          message = 'Invalidated all resource-related cache entries'
          break
        case 'search':
          cacheManager.invalidateSearchCaches()
          message = 'Invalidated all search-related cache entries'
          break
        case 'all':
          // Clear all cache
          apiCache.clear()
          message = 'Cleared entire cache'
          break
        default:
          setResponseStatus(event, 400)
          return {
            success: false,
            message: 'Invalid cache type. Use resources, search, or all.',
          }
      }
    } else {
      setResponseStatus(event, 400)
      return {
        success: false,
        message: 'Either pattern or type must be provided',
      }
    }

    return {
      success: true,
      message,
      invalidatedCount,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'Error invalidating cache',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
