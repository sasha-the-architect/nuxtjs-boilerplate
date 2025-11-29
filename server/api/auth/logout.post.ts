import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // In a real application, you might want to add the token to a blacklist
  // For now, we just return a success response
  return {
    success: true,
    message: 'Logged out successfully',
  }
})
