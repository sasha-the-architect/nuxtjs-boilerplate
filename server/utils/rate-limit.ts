import type { H3Event } from 'h3'

interface TokenBucket {
  tokens: number
  lastRefill: number
}

interface RateLimitConfig {
  windowMs: number // Window size in milliseconds
  maxRequests: number // Max requests per window
  tokensPerInterval: number // Number of tokens added per interval
  intervalMs: number // Interval for token refill (in ms)
  message: string // Error message when limit exceeded
}

// In-memory store for token buckets
const tokenBucketStore = new Map<string, TokenBucket>()

class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if a request should be allowed based on token bucket algorithm
   */
  async isAllowed(key: string): Promise<{
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
   * Get current rate limit status for a key
   */
  async getStatus(
    key: string
  ): Promise<{ remaining: number; resetTime: number }> {
    const now = Date.now()
    let bucket = tokenBucketStore.get(key)

    if (!bucket) {
      return {
        remaining: this.config.tokensPerInterval,
        resetTime: Math.floor(now + this.config.intervalMs) / 1000,
      }
    }

    // Calculate refilled tokens
    const timePassed = now - bucket.lastRefill
    const intervalsPassed = Math.floor(timePassed / this.config.intervalMs)

    const refilledTokens = Math.min(
      this.config.maxRequests,
      bucket.tokens + intervalsPassed * this.config.tokensPerInterval
    )

    return {
      remaining: Math.floor(refilledTokens),
      resetTime: Math.floor(bucket.lastRefill + this.config.intervalMs) / 1000,
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<void> {
    tokenBucketStore.delete(key)
  }
}

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

/**
 * Get appropriate rate limiter based on the request path
 */
export function getRateLimiterForPath(path: string): RateLimiter {
  if (path.includes('/api/v1/search') || path.includes('/search')) {
    return rateLimitConfigs.search
  } else if (path.includes('/api/v1/export') || path.includes('/export')) {
    return rateLimitConfigs.export
  } else if (
    path.includes('/api/v1/resources') ||
    path.includes('/api/categories') ||
    path.includes('/api/submissions')
  ) {
    return rateLimitConfigs.heavy
  } else if (path.includes('/api/')) {
    return rateLimitConfigs.api
  } else {
    return rateLimitConfigs.general
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

  // Generate rate limit key if not provided
  const rateLimitKey =
    key ||
    `${event.node.req.headers['x-forwarded-for'] || event.node.req.connection.remoteAddress || 'unknown'}:${event.path}`

  // Get appropriate rate limiter
  const rateLimiter = getRateLimiterForPath(event.path)

  // Check if request is allowed
  const result = await rateLimiter.isAllowed(rateLimitKey)

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

  // If not allowed, throw an error
  if (!result.allowed) {
    const { createError } = await import('h3')
    throw createError({
      statusCode: 429,
      statusMessage: result.message || 'Rate limit exceeded',
    })
  }
}
