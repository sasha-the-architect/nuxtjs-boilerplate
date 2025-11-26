import {
  getRequestIP,
  setResponseHeader,
  createError,
  getRequestHeader,
} from 'h3'
import { performanceMonitor } from '~/utils/performanceMonitor'

// Enhanced in-memory rate limiter for API endpoints with tiered limits and sliding window
// In production, you'd want to use a more robust solution like Redis

interface RateLimitEntry {
  timestamps: number[] // Store timestamps of requests for sliding window
  resetTime: number
}

interface RateLimitStore {
  [key: string]: RateLimitEntry
}

const rateLimitStore: RateLimitStore = {}

// Define different rate limit tiers based on endpoint type
const RATE_LIMIT_TIERS = {
  basic: { windowMs: 15 * 60 * 1000, max: 100 }, // 15 min, 100 requests
  moderate: { windowMs: 15 * 60 * 1000, max: 200 }, // 15 min, 200 requests
  high: { windowMs: 15 * 60 * 1000, max: 500 }, // 15 min, 500 requests
  search: { windowMs: 1 * 60 * 1000, max: 30 }, // 1 min, 30 requests (for search endpoints)
  export: { windowMs: 60 * 60 * 1000, max: 10 }, // 1 hour, 10 requests (for export endpoints)
}

// Define endpoint patterns and their corresponding rate limit tiers
const ENDPOINT_PATTERNS: { [key: string]: keyof typeof RATE_LIMIT_TIERS } = {
  '/api/v1/search': 'search',
  '/api/v1/export': 'export',
  '/api/v1/resources': 'moderate',
  '/api/v1/categories': 'basic',
  '/api/v1/rss': 'basic',
  '/api/submissions': 'basic',
  default: 'basic',
}

// Get rate limit config based on endpoint
function getRateLimitConfig(path: string): { windowMs: number; max: number } {
  for (const [pattern, tier] of Object.entries(ENDPOINT_PATTERNS)) {
    if (path.startsWith(pattern)) {
      return RATE_LIMIT_TIERS[tier]
    }
  }
  return RATE_LIMIT_TIERS.default
}

export default defineEventHandler(event => {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Get client IP for rate limiting
  const clientIP = getRequestIP(event) || 'unknown'

  // Check for authenticated user (if JWT token exists, treat as premium user)
  const authHeader = getRequestHeader(event, 'authorization')
  const isAdmin =
    authHeader &&
    authHeader.startsWith('Bearer ') &&
    process.env.ADMIN_API_KEY &&
    authHeader === `Bearer ${process.env.ADMIN_API_KEY}`

  // Determine if this is an admin user (bypass rate limits)
  if (isAdmin) {
    // Set rate limit headers for admin user
    const config = getRateLimitConfig(event.path)
    setResponseHeader(event, 'X-RateLimit-Limit', config.max.toString())
    setResponseHeader(event, 'X-RateLimit-Remaining', 'unlimited')
    setResponseHeader(event, 'X-RateLimit-Reset', '0')
    setResponseHeader(event, 'X-RateLimit-User-Type', 'admin')
    // Record performance metric for admin user (no rate limit hit)
    performanceMonitor.recordMetric(event, 0, false, 'BYPASS', 200)
    return
  }

  const config = getRateLimitConfig(event.path)
  const key = `${clientIP}:${event.path}`

  const now = Date.now()

  // Initialize or clean up the store entry for this key
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      timestamps: [],
      resetTime: now + config.windowMs,
    }
  } else {
    // Clean up old timestamps outside the window (sliding window approach)
    rateLimitStore[key].timestamps = rateLimitStore[key].timestamps.filter(
      timestamp => timestamp > now - config.windowMs
    )
  }

  // Add current request timestamp
  rateLimitStore[key].timestamps.push(now)

  const currentCount = rateLimitStore[key].timestamps.length
  const remaining = Math.max(0, config.max - currentCount)

  // Set rate limit headers
  setResponseHeader(event, 'X-RateLimit-Limit', config.max.toString())
  setResponseHeader(event, 'X-RateLimit-Remaining', remaining.toString())
  setResponseHeader(
    event,
    'X-RateLimit-Reset',
    Math.floor(rateLimitStore[key].resetTime / 1000).toString()
  )
  setResponseHeader(event, 'X-RateLimit-Window', config.windowMs.toString())

  // Check if rate limit exceeded
  if (currentCount > config.max) {
    // Remove the last request since it caused the limit to be exceeded
    rateLimitStore[key].timestamps.pop()

    // Record performance metric for rate limit hit (before throwing error)
    performanceMonitor.recordMetric(event, 0, true, 'BYPASS', 429)

    throw createError({
      statusCode: 429,
      statusMessage: `Rate limit exceeded. Maximum ${config.max} requests per ${config.windowMs / 1000 / 60} minutes allowed.`,
    })
  }

  // Record performance metric for successful request (no rate limit hit)
  performanceMonitor.recordMetric(event, 0, false, 'BYPASS', 200)
})
