import { getRequestIP, setResponseHeader, createError } from 'h3'

// Simple in-memory rate limiter for API endpoints
// In production, you'd want to use a more robust solution like Redis

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const rateLimitStore: RateLimitStore = {}

const WINDOW_SIZE = 15 * 60 * 1000 // 15 minutes in milliseconds
const MAX_REQUESTS = 100 // Max requests per window

export default defineEventHandler(event => {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Get client IP for rate limiting
  const clientIP = getRequestIP(event) || 'unknown'
  const key = `${clientIP}:${event.path}`

  const now = Date.now()
  const windowStart = now - WINDOW_SIZE

  // Clean up old entries
  Object.keys(rateLimitStore).forEach(k => {
    if (rateLimitStore[k].resetTime < windowStart) {
      delete rateLimitStore[k]
    }
  })

  // Check if this is a new request or existing
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < windowStart) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + WINDOW_SIZE,
    }
  } else {
    rateLimitStore[key].count++
  }

  const remaining = MAX_REQUESTS - rateLimitStore[key].count
  const resetTime = rateLimitStore[key].resetTime

  // Set rate limit headers
  setResponseHeader(event, 'X-RateLimit-Limit', MAX_REQUESTS.toString())
  setResponseHeader(
    event,
    'X-RateLimit-Remaining',
    Math.max(0, remaining).toString()
  )
  setResponseHeader(
    event,
    'X-RateLimit-Reset',
    Math.floor(resetTime / 1000).toString()
  )

  // Check if rate limit exceeded
  if (rateLimitStore[key].count > MAX_REQUESTS) {
    throw createError({
      statusCode: 429,
      statusMessage: `Rate limit exceeded. Please try again later.`,
    })
  }
})
