// server/utils/rate-limiter.ts
// Rate limiting utility using database-level aggregation

import prisma from './db'

export interface RateLimitResult {
  allowed: boolean
  remainingRequests: number
  resetTime: number
  currentCount: number
}

/**
 * Check rate limit for a specific IP address using database aggregation
 *
 * @param ip - IP address to check
 * @param maxRequests - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns Rate limit result with allowed status and metadata
 */
export async function checkRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  try {
    const now = Date.now()
    const windowStart = now - windowSeconds * 1000

    // Use database-level aggregation to count events in time window
    const eventCount = await prisma.analyticsEvent.count({
      where: {
        ip,
        timestamp: {
          gte: windowStart,
        },
      },
    })

    const remainingRequests = Math.max(0, maxRequests - eventCount)
    const allowed = eventCount < maxRequests
    const resetTime = windowStart + windowSeconds * 1000

    return {
      allowed,
      remainingRequests,
      resetTime,
      currentCount: eventCount,
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow request (fail open) to not block legitimate traffic
    return {
      allowed: true,
      remainingRequests: maxRequests,
      resetTime: Date.now() + windowSeconds * 1000,
      currentCount: 0,
    }
  }
}

/**
 * Get rate limit statistics for a specific IP
 *
 * @param ip - IP address to get stats for
 * @param windowSeconds - Time window in seconds (default: 60)
 * @returns Rate limit statistics
 */
export async function getRateLimitStats(
  ip: string,
  windowSeconds: number = 60
): Promise<{
  currentCount: number
  windowStart: number
  windowEnd: number
}> {
  try {
    const now = Date.now()
    const windowStart = now - windowSeconds * 1000

    const eventCount = await prisma.analyticsEvent.count({
      where: {
        ip,
        timestamp: {
          gte: windowStart,
        },
      },
    })

    return {
      currentCount: eventCount,
      windowStart,
      windowEnd: now,
    }
  } catch (error) {
    console.error('Rate limit stats error:', error)
    return {
      currentCount: 0,
      windowStart: Date.now() - windowSeconds * 1000,
      windowEnd: Date.now(),
    }
  }
}

/**
 * Record a rate-limited event for analytics
 * This helps track how many requests are being rate limited
 *
 * @param ip - IP address that was rate limited
 * @param endpoint - Endpoint that triggered rate limit
 */
export async function recordRateLimitedEvent(
  ip: string,
  endpoint: string
): Promise<void> {
  try {
    // This could be stored in a separate rate_limit_events table
    // For now, we'll just log it
    console.log(`Rate limit triggered: IP=${ip}, Endpoint=${endpoint}`)
  } catch (error) {
    console.error('Error recording rate limited event:', error)
  }
}
