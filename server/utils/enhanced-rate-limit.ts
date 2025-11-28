import type { H3Event } from 'h3'
import { getQuery } from 'h3'

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

// Admin bypass keys
const adminBypassKeys = new Set<string>()
if (process.env.ADMIN_RATE_LIMIT_BYPASS_KEY) {
  adminBypassKeys.add(process.env.ADMIN_RATE_LIMIT_BYPASS_KEY)
}

class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if a request should be allowed based on token bucket algorithm
   */
  async isAllowed(
    key: string,
    bypassKey?: string
  ): Promise<{
    allowed: boolean
    resetTime?: number
    remaining?: number
    message?: string
  }> {
    // Check if this is an admin bypass request
    if (bypassKey && adminBypassKeys.has(bypassKey)) {
      return {
        allowed: true,
        remaining: this.config.maxRequests, // Always show max remaining for bypass
        resetTime: Date.now() + this.config.intervalMs,
      }
    }

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
    key: string,
    bypassKey?: string
  ): Promise<{ remaining: number; resetTime: number; limit: number }> {
    // If this is an admin bypass request, show unlimited capacity
    if (bypassKey && adminBypassKeys.has(bypassKey)) {
      return {
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.intervalMs,
        limit: this.config.maxRequests,
      }
    }

    const now = Date.now()
    let bucket = tokenBucketStore.get(key)

    if (!bucket) {
      return {
        remaining: this.config.tokensPerInterval,
        resetTime: Math.floor(now + this.config.intervalMs) / 1000,
        limit: this.config.maxRequests,
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
      limit: this.config.maxRequests,
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<void> {
    tokenBucketStore.delete(key)
  }
}

// Analytics for rate limiting
interface RateLimitAnalytics {
  totalRequests: number
  blockedRequests: number
  bypassedRequests: number
}

const analyticsStore = new Map<string, RateLimitAnalytics>()

function getAnalytics(path: string): RateLimitAnalytics {
  if (!analyticsStore.has(path)) {
    analyticsStore.set(path, {
      totalRequests: 0,
      blockedRequests: 0,
      bypassedRequests: 0,
    })
  }
  return analyticsStore.get(path)!
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
    path.includes('/api/v1/categories') ||
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
 * SECURITY: Bypass key access is restricted to headers only to prevent exposure in server logs
 */
export async function rateLimit(event: H3Event, key?: string): Promise<void> {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // SECURITY: Check for bypass key in query parameters and block if present
  // This prevents bypass keys from appearing in server logs
  const query = getQuery(event)
  if (
    query['bypass-key'] ||
    query['bypassKey'] ||
    query['admin-key'] ||
    query['adminKey']
  ) {
    const { createError } = await import('h3')
    throw createError({
      statusCode: 400,
      statusMessage:
        'Bypass keys are not allowed in query parameters for security reasons',
    })
  }

  // Check for bypass key in header only (security: prevent bypass keys in query parameters)
  const bypassKey =
    (event.node.req.headers['x-admin-bypass-key'] as string) ||
    process.env.ADMIN_RATE_LIMIT_BYPASS_KEY

  // Generate rate limit key if not provided
  const rateLimitKey =
    key ||
    `${event.node.req.headers['x-forwarded-for'] || event.node.req.connection.remoteAddress || 'unknown'}:${event.path}`

  // Get appropriate rate limiter
  const rateLimiter = getRateLimiterForPath(event.path)

  // Get analytics for this path
  const analytics = getAnalytics(event.path)

  // Increment total requests
  analytics.totalRequests++

  // Check if request is allowed
  const result = await rateLimiter.isAllowed(rateLimitKey, bypassKey)

  // Set rate limit headers
  const status = await rateLimiter.getStatus(rateLimitKey, bypassKey)

  // If this was a bypassed request, increment analytics
  if (bypassKey && adminBypassKeys.has(bypassKey)) {
    analytics.bypassedRequests++
  }

  event.node.res?.setHeader('X-RateLimit-Limit', status.limit.toString())
  event.node.res?.setHeader(
    'X-RateLimit-Remaining',
    status.remaining.toString()
  )
  event.node.res?.setHeader('X-RateLimit-Reset', status.resetTime.toString())
  event.node.res?.setHeader(
    'X-RateLimit-Window',
    Math.floor(rateLimiter['config'].windowMs / 1000).toString()
  )

  // If this was a bypassed request, let it through regardless
  if (bypassKey && adminBypassKeys.has(bypassKey)) {
    // Add bypass indicator header
    event.node.res?.setHeader('X-RateLimit-Bypassed', 'true')
    return
  }

  // If not allowed, increment blocked count and throw an error
  if (!result.allowed) {
    analytics.blockedRequests++
    const { createError } = await import('h3')
    throw createError({
      statusCode: 429,
      statusMessage: result.message || 'Rate limit exceeded',
    })
  }
}

/**
 * Get rate limiting analytics
 */
export function getRateLimitAnalytics(): Map<string, RateLimitAnalytics> {
  return new Map(analyticsStore)
}
