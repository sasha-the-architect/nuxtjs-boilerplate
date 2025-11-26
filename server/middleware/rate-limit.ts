import { getRequestIP, setResponseHeader, createError } from 'h3'
import { rateLimit } from '../utils/rate-limit'

// Enhanced rate limiting middleware that uses the new rate limiting system
// This middleware handles the actual rate limiting for API routes

export default defineEventHandler(async event => {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Use the enhanced rate limiting system
  await rateLimit(event)
})
