import { getRequestIP, setResponseHeader, createError, getHeader } from 'h3'

// Enhanced rate limiter for API endpoints with different tiers and user types
// In production, you'd want to use a more robust solution like Redis

interface RateLimitStore {
  [key: string]: {
    tokens: number
    lastRefill: number
  }
}

interface RateLimitConfig {
  windowSize: number // milliseconds
  maxRequests: number
  refillRate: number // tokens per second
  burstSize: number // max tokens in bucket
}

const rateLimitStore: RateLimitStore = {}

// Different rate limit configurations per endpoint type
const RATE_LIMIT_CONFIGS: { [path: string]: RateLimitConfig } = {
  // Default config for general API endpoints
  default: {
    windowSize: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per window
    refillRate: 1, // 1 token per second
    burstSize: 10, // Allow bursts of 10 requests
  },
  // Resources endpoint - more generous limits
  resources: {
    windowSize: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200, // 200 requests per window
    refillRate: 2, // 2 tokens per second
    burstSize: 20, // Allow bursts of 20 requests
  },
  // Search endpoint - moderate limits (expensive operation)
  search: {
    windowSize: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 requests per window
    refillRate: 0.5, // 0.5 tokens per second
    burstSize: 5, // Allow bursts of 5 requests
  },
  // Submission endpoint - strict limits
  submissions: {
    windowSize: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour
    refillRate: 0.1, // 0.1 tokens per second
    burstSize: 2, // Allow bursts of 2 requests
  },
}

// Get rate limit config based on endpoint
function getRateLimitConfig(path: string): RateLimitConfig {
  if (path.includes('/api/v1/resources')) {
    return RATE_LIMIT_CONFIGS.resources
  } else if (path.includes('/api/v1/search') || path.includes('/search')) {
    return RATE_LIMIT_CONFIGS.search
  } else if (path.includes('/submissions')) {
    return RATE_LIMIT_CONFIGS.submissions
  }
  return RATE_LIMIT_CONFIGS.default
}

// Token bucket algorithm implementation
function getTokenBucket(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; tokens: number; resetTime: number } {
  const now = Date.now()
  const lastRefill = rateLimitStore[key]?.lastRefill || 0
  let tokens = rateLimitStore[key]?.tokens || config.burstSize

  // Calculate time passed since last refill
  const timePassed = (now - lastRefill) / 1000 // in seconds

  // Add tokens based on refill rate
  if (lastRefill > 0) {
    const newTokens = Math.min(
      config.burstSize,
      tokens + timePassed * config.refillRate
    )
    tokens = Math.floor(newTokens)
  } else {
    // First request for this key
    tokens = config.burstSize
  }

  // Check if we have tokens to consume
  const allowed = tokens > 0
  if (allowed) {
    tokens-- // Consume a token
  }

  // Calculate when the next token will be available
  const tokensNeededForReset = config.burstSize - tokens
  const timeToNextToken = tokensNeededForReset / config.refillRate
  const resetTime = now + timeToNextToken * 1000

  // Update store
  rateLimitStore[key] = {
    tokens,
    lastRefill: now,
  }

  return { allowed, tokens, resetTime }
}

export default defineEventHandler(event => {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Check for admin/premium user bypass (via header)
  const authHeader =
    getHeader(event, 'authorization') || getHeader(event, 'x-api-key')
  const isAdmin =
    authHeader &&
    (authHeader === `Bearer ${process.env.ADMIN_API_KEY}` ||
      authHeader === process.env.ADMIN_API_KEY)

  if (isAdmin) {
    // Admin users bypass rate limiting
    setResponseHeader(event, 'X-RateLimit-Limit', 'unlimited')
    setResponseHeader(event, 'X-RateLimit-Remaining', 'unlimited')
    setResponseHeader(event, 'X-RateLimit-Reset', '0')
    return
  }

  // Get client IP for rate limiting
  const clientIP = getRequestIP(event) || 'unknown'
  const config = getRateLimitConfig(event.path || '')

  // Create key based on IP and endpoint
  const key = `${clientIP}:${event.path}`

  // Apply token bucket algorithm
  const { allowed, tokens, resetTime } = getTokenBucket(key, config)

  // Set rate limit headers
  setResponseHeader(event, 'X-RateLimit-Limit', config.burstSize.toString())
  setResponseHeader(
    event,
    'X-RateLimit-Remaining',
    Math.max(0, tokens).toString()
  )
  setResponseHeader(
    event,
    'X-RateLimit-Reset',
    Math.floor(resetTime / 1000).toString()
  )

  // Check if rate limit exceeded
  if (!allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: `Rate limit exceeded. Please try again later.`,
    })
  }
})
