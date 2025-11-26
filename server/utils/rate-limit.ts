import type { H3Event } from 'h3'

interface TokenBucket {
  tokens: number
  lastRefill: number
}

interface SlidingWindowEntry {
  timestamp: number
  count: number
}

interface RateLimitConfig {
  windowMs: number // Window size in milliseconds
  maxRequests: number // Max requests per window
  tokensPerInterval: number // Number of tokens added per interval (for token bucket)
  intervalMs: number // Interval for token refill (in ms)
  message: string // Error message when limit exceeded
  userTier?: 'basic' | 'premium' | 'admin' // User tier for different limits
}

// In-memory store for rate limiting algorithms
const tokenBucketStore = new Map<string, TokenBucket>()
const slidingWindowStore = new Map<string, SlidingWindowEntry[]>()

class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if a request should be allowed based on token bucket algorithm
   */
  async isAllowedTokenBucket(key: string): Promise<{
    allowed: boolean
    resetTime?: number
    remaining?: number
    message?: string
  }> {
    const now = Date.now()
    let bucket = tokenBucketStore.get(key)

    // If no bucket exists, create a new one
    if (!bucket) {
      bucket = {
        tokens: this.config.tokensPerInterval,
        lastRefill: now,
      }
      tokenBucketStore.set(key, bucket)
    } else {
      // Refill tokens based on time passed
      const timePassed = now - bucket.lastRefill
      const intervalsPassed = Math.floor(timePassed / this.config.intervalMs)

      // Add tokens based on intervals passed, but don't exceed max
      bucket.tokens = Math.min(
        this.config.maxRequests,
        bucket.tokens + intervalsPassed * this.config.tokensPerInterval
      )

      bucket.lastRefill = now
    }

    // Check if we have tokens available
    if (bucket.tokens > 0) {
      bucket.tokens-- // Consume a token
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime:
          Math.floor(bucket.lastRefill + this.config.intervalMs) / 1000,
      }
    } else {
      // No tokens available, rate limit exceeded
      return {
        allowed: false,
        message: this.config.message,
        remaining: 0,
        resetTime:
          Math.floor(bucket.lastRefill + this.config.intervalMs) / 1000,
      }
    }
  }

  /**
   * Check if a request should be allowed based on sliding window algorithm
   */
  async isAllowedSlidingWindow(key: string): Promise<{
    allowed: boolean
    resetTime?: number
    remaining?: number
    message?: string
  }> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    let windowEntries = slidingWindowStore.get(key) || []

    // Filter out requests outside the current window
    windowEntries = windowEntries.filter(entry => entry.timestamp > windowStart)

    // Check if we've exceeded the limit
    if (windowEntries.length >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        message: this.config.message,
        remaining: 0,
        resetTime: Math.floor((windowStart + this.config.windowMs) / 1000),
      }
    }

    // Add current request to the window
    windowEntries.push({ timestamp: now, count: 1 })
    slidingWindowStore.set(key, windowEntries)

    const remaining = this.config.maxRequests - windowEntries.length

    return {
      allowed: true,
      remaining,
      resetTime: Math.floor((windowStart + this.config.windowMs) / 1000),
    }
  }

  /**
   * Check if a request should be allowed (using the default algorithm)
   */
  async isAllowed(key: string): Promise<{
    allowed: boolean
    resetTime?: number
    remaining?: number
    message?: string
  }> {
    // Default to sliding window algorithm
    return this.isAllowedSlidingWindow(key)
  }

  /**
   * Get current rate limit status for a key
   */
  async getStatus(
    key: string
  ): Promise<{ remaining: number; resetTime: number }> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // For sliding window, calculate the remaining requests
    let windowEntries = slidingWindowStore.get(key) || []
    windowEntries = windowEntries.filter(entry => entry.timestamp > windowStart)

    const remaining = Math.max(
      0,
      this.config.maxRequests - windowEntries.length
    )
    const resetTime = Math.floor((windowStart + this.config.windowMs) / 1000)

    return {
      remaining,
      resetTime,
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<void> {
    tokenBucketStore.delete(key)
    slidingWindowStore.delete(key)
  }
}

// Rate limit analytics store
interface RateLimitAnalytics {
  requests: number
  blocked: number
  timestamp: number
}

const rateLimitAnalytics = new Map<string, RateLimitAnalytics[]>()

// Default rate limit configurations for different endpoint types
export const rateLimitConfigs = {
  general: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    tokensPerInterval: 10, // 10 tokens every interval
    intervalMs: 60 * 1000, // refill every minute
    message: 'Too many requests, please try again later.',
  }),
  search: new RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
    tokensPerInterval: 5, // 5 tokens every interval
    intervalMs: 30 * 1000, // refill every 30 seconds
    message: 'Too many search requests, please slow down.',
  }),
  heavy: new RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 10,
    tokensPerInterval: 2, // 2 tokens every interval
    intervalMs: 60 * 1000, // refill every minute
    message: 'Too many heavy computation requests, please slow down.',
  }),
  export: new RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 5,
    tokensPerInterval: 1, // 1 token every interval
    intervalMs: 60 * 1000, // refill every minute
    message: 'Too many export requests, please slow down.',
  }),
  api: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50,
    tokensPerInterval: 5, // 5 tokens every interval
    intervalMs: 60 * 1000, // refill every minute
    message: 'API rate limit exceeded. Please try again later.',
  }),
}

// Tiered configurations for different user types
export const tieredRateLimitConfigs = {
  basic: {
    general: new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      tokensPerInterval: 10,
      intervalMs: 60 * 1000,
      message: 'Too many requests, please try again later.',
      userTier: 'basic',
    }),
    search: new RateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 30,
      tokensPerInterval: 5,
      intervalMs: 30 * 1000,
      message: 'Too many search requests, please slow down.',
      userTier: 'basic',
    }),
    heavy: new RateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 10,
      tokensPerInterval: 2,
      intervalMs: 60 * 1000,
      message: 'Too many heavy computation requests, please slow down.',
      userTier: 'basic',
    }),
    export: new RateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 5,
      tokensPerInterval: 1,
      intervalMs: 60 * 1000,
      message: 'Too many export requests, please slow down.',
      userTier: 'basic',
    }),
    api: new RateLimiter({
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 50,
      tokensPerInterval: 5,
      intervalMs: 60 * 1000,
      message: 'API rate limit exceeded. Please try again later.',
      userTier: 'basic',
    }),
  },
  premium: {
    general: new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 200, // Higher limit for premium users
      tokensPerInterval: 20,
      intervalMs: 60 * 1000,
      message: 'Too many requests, please try again later.',
      userTier: 'premium',
    }),
    search: new RateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 60, // Higher limit for premium users
      tokensPerInterval: 10,
      intervalMs: 30 * 1000,
      message: 'Too many search requests, please slow down.',
      userTier: 'premium',
    }),
    heavy: new RateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 20, // Higher limit for premium users
      tokensPerInterval: 4,
      intervalMs: 60 * 1000,
      message: 'Too many heavy computation requests, please slow down.',
      userTier: 'premium',
    }),
    export: new RateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 10, // Higher limit for premium users
      tokensPerInterval: 2,
      intervalMs: 60 * 1000,
      message: 'Too many export requests, please slow down.',
      userTier: 'premium',
    }),
    api: new RateLimiter({
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 100, // Higher limit for premium users
      tokensPerInterval: 10,
      intervalMs: 60 * 1000,
      message: 'API rate limit exceeded. Please try again later.',
      userTier: 'premium',
    }),
  },
  admin: {
    general: new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000, // Much higher limit for admin users
      tokensPerInterval: 100,
      intervalMs: 60 * 1000,
      message: 'Too many requests, please try again later.',
      userTier: 'admin',
    }),
    search: new RateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 300, // Much higher limit for admin users
      tokensPerInterval: 50,
      intervalMs: 30 * 1000,
      message: 'Too many search requests, please slow down.',
      userTier: 'admin',
    }),
    heavy: new RateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 100, // Much higher limit for admin users
      tokensPerInterval: 20,
      intervalMs: 60 * 1000,
      message: 'Too many heavy computation requests, please slow down.',
      userTier: 'admin',
    }),
    export: new RateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 50, // Much higher limit for admin users
      tokensPerInterval: 10,
      intervalMs: 60 * 1000,
      message: 'Too many export requests, please slow down.',
      userTier: 'admin',
    }),
    api: new RateLimiter({
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 500, // Much higher limit for admin users
      tokensPerInterval: 50,
      intervalMs: 60 * 1000,
      message: 'API rate limit exceeded. Please try again later.',
      userTier: 'admin',
    }),
  },
}

/**
 * Get user tier from request (from headers, session, or other auth mechanism)
 */
function getUserTier(event: H3Event): 'basic' | 'premium' | 'admin' {
  // In a real app, you'd get this from authentication headers, session, etc.
  // For now, we'll check for a custom header as a placeholder
  const userTier = event.node.req.headers['x-user-tier'] as string | undefined

  if (userTier === 'premium') return 'premium'
  if (userTier === 'admin') return 'admin'
  return 'basic' // default to basic tier
}

/**
 * Get appropriate rate limiter based on the request path and user tier
 */
export function getRateLimiterForPath(
  path: string,
  userTier: 'basic' | 'premium' | 'admin' = 'basic'
): RateLimiter {
  // Admin users have no rate limits (in a real app, you might still want some limits)
  if (userTier === 'admin') {
    // Return a limiter with very high limits for admin users
    return new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10000, // Very high limit
      tokensPerInterval: 1000,
      intervalMs: 60 * 1000,
      message: 'API rate limit exceeded. Please try again later.',
    })
  }

  if (path.includes('/api/v1/search') || path.includes('/search')) {
    return userTier === 'premium'
      ? tieredRateLimitConfigs.premium.search
      : tieredRateLimitConfigs[userTier].search
  } else if (path.includes('/api/v1/export') || path.includes('/export')) {
    return userTier === 'premium'
      ? tieredRateLimitConfigs.premium.export
      : tieredRateLimitConfigs[userTier].export
  } else if (
    path.includes('/api/v1/resources') ||
    path.includes('/api/categories') ||
    path.includes('/api/submissions')
  ) {
    return userTier === 'premium'
      ? tieredRateLimitConfigs.premium.heavy
      : tieredRateLimitConfigs[userTier].heavy
  } else if (path.includes('/api/')) {
    return userTier === 'premium'
      ? tieredRateLimitConfigs.premium.api
      : tieredRateLimitConfigs[userTier].api
  } else {
    return userTier === 'premium'
      ? tieredRateLimitConfigs.premium.general
      : tieredRateLimitConfigs[userTier].general
  }
}

/**
 * Track rate limit analytics
 */
function trackRateLimitAnalytics(key: string, isAllowed: boolean) {
  const now = Date.now()
  const analytics = rateLimitAnalytics.get(key) || []

  // Clean up old analytics (older than 1 hour)
  const oneHourAgo = now - 60 * 60 * 1000
  const recentAnalytics = analytics.filter(item => item.timestamp > oneHourAgo)

  recentAnalytics.push({
    requests: 1,
    blocked: isAllowed ? 0 : 1,
    timestamp: now,
  })

  rateLimitAnalytics.set(key, recentAnalytics)
}

/**
 * Get rate limit analytics for a specific key
 */
export function getRateLimitAnalytics(key: string): {
  totalRequests: number
  totalBlocked: number
  recentRate: number // Requests per minute in the last 5 minutes
} {
  const now = Date.now()
  const fiveMinutesAgo = now - 5 * 60 * 1000
  const analytics = rateLimitAnalytics.get(key) || []

  const recent = analytics.filter(item => item.timestamp > fiveMinutesAgo)

  const totalRequests = analytics.reduce((sum, item) => sum + item.requests, 0)
  const totalBlocked = analytics.reduce((sum, item) => sum + item.blocked, 0)

  // Calculate requests per minute in last 5 minutes
  const recentRate =
    recent.length > 0
      ? recent.reduce((sum, item) => sum + item.requests, 0) / 5
      : 0

  return {
    totalRequests,
    totalBlocked,
    recentRate,
  }
}

/**
 * Rate limit middleware function for API endpoints
 */
export async function rateLimit(event: H3Event, key?: string): Promise<void> {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Get user tier
  const userTier = getUserTier(event)

  // Generate rate limit key if not provided
  const rateLimitKey =
    key ||
    `${event.node.req.headers['x-forwarded-for'] || event.node.req.connection.remoteAddress || 'unknown'}:${userTier}:${event.path}`

  // Get appropriate rate limiter based on path and user tier
  const rateLimiter = getRateLimiterForPath(event.path, userTier)

  // Check if request is allowed
  const result = await rateLimiter.isAllowed(rateLimitKey)

  // Track analytics
  trackRateLimitAnalytics(rateLimitKey, result.allowed)

  // Set rate limit headers
  const status = await rateLimiter.getStatus(rateLimitKey)

  event.node.res?.setHeader(
    'X-RateLimit-Limit',
    rateLimiter['config'].maxRequests.toString()
  )
  event.node.res?.setHeader(
    'X-RateLimit-Remaining',
    status.remaining.toString()
  )
  event.node.res?.setHeader('X-RateLimit-Reset', status.resetTime.toString())
  event.node.res?.setHeader(
    'X-RateLimit-Window',
    Math.floor(rateLimiter['config'].windowMs / 1000).toString()
  )
  event.node.res?.setHeader('X-User-Tier', userTier) // Include user tier in response

  // If not allowed, throw an error
  if (!result.allowed) {
    const { createError } = await import('h3')
    throw createError({
      statusCode: 429,
      statusMessage: result.message || 'Rate limit exceeded',
    })
  }
}
