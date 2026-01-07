import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  await rateLimit(event)
  try {
    // For now, return an empty array since we're not persisting submissions to a real database
    // In a real implementation, this would fetch from a database
    const config = useRuntimeConfig()

    return {
      success: true,
      submissions: [],
    }
  } catch (error: any) {
    // In production, we might want to use a proper error tracking service instead of console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching submissions:', error)
    }

    // Return proper error response
    return {
      success: false,
      message: 'An error occurred while fetching submissions',
      submissions: [],
    }
  }
})
