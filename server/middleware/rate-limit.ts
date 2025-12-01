import { getRequestIP, setResponseHeader, createError } from 'h3'

// Advanced in-memory rate limiter with different limits for different endpoints
// In production, you'd want to use a more robust solution like Redis

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Define rate limit tiers for different API endpoints
interface RateLimitConfig {
  windowMs: number // Window size in milliseconds
  maxRequests: number // Max requests per window
  message: string // Error message when limit exceeded
}

// Configuration for different endpoint types
const RATE_LIMIT_CONFIG: { [key: string]: RateLimitConfig } = {
  // General API endpoints
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later.',
  },
  // Search endpoints (more restrictive)
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many search requests, please slow down.',
  },
  // Heavy computation endpoints (most restrictive)
  heavy: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many heavy computation requests, please slow down.',
  },
  // Export endpoints (restrictive)
  export: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many export requests, please slow down.',
  },
}

// Map endpoint patterns to rate limit tiers
function getRateLimitTier(path: string): RateLimitConfig {
  if (path.includes('/api/v1/search') || path.includes('/api/v1/search')) {
    return RATE_LIMIT_CONFIG.search
  } else if (path.includes('/api/v1/export')) {
    return RATE_LIMIT_CONFIG.export
  } else if (path.includes('/api/v1/webhooks')) {
    // Webhook endpoints have specific rate limits
    return {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 20,
      message: 'Too many webhook requests, please slow down.',
    }
  } else if (path.includes('/api/v1/auth/api-keys')) {
    // API key management endpoints have specific rate limits
    return {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10,
      message: 'Too many API key management requests.',
    }
  } else if (
    path.includes('/api/v1/resources') ||
    path.includes('/api/categories')
  ) {
    return RATE_LIMIT_CONFIG.heavy
  } else {
    return RATE_LIMIT_CONFIG.general
  }
}

const rateLimitStore: RateLimitStore = {}

export default defineEventHandler(event => {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Get rate limit configuration for this endpoint
  const rateLimitConfig = getRateLimitTier(event.path)

  // Get client IP for rate limiting
  const clientIP = getRequestIP(event) || 'unknown'
  const key = `${clientIP}:${event.path}`

  const now = Date.now()
  const windowStart = now - rateLimitConfig.windowMs

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
      resetTime: now + rateLimitConfig.windowMs,
    }
  } else {
    rateLimitStore[key].count++
  }

  const remaining = rateLimitConfig.maxRequests - rateLimitStore[key].count
  const resetTime = rateLimitStore[key].resetTime

  // Set rate limit headers
  setResponseHeader(
    event,
    'X-RateLimit-Limit',
    rateLimitConfig.maxRequests.toString()
  )
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
  setResponseHeader(
    event,
    'X-RateLimit-Window',
    Math.floor(rateLimitConfig.windowMs / 1000).toString()
  )

  // Check if rate limit exceeded
  if (rateLimitStore[key].count > rateLimitConfig.maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: rateLimitConfig.message,
    })
  }
})
