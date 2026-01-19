import prisma from './db'
import { logger } from '~/utils/logger'

export interface RateLimitResult {
  allowed: boolean
  remainingRequests: number
  resetTime: number
  currentCount: number
}

export async function checkRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
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
    logger.error('Rate limit check error:', error)
    return {
      allowed: true,
      remainingRequests: maxRequests,
      resetTime: Date.now() + windowSeconds * 1000,
      currentCount: 0,
    }
  }
}

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
    logger.error('Rate limit stats error:', error)
    return {
      currentCount: 0,
      windowStart: Date.now() - windowSeconds * 1000,
      windowEnd: Date.now(),
    }
  }
}

export async function recordRateLimitedEvent(
  ip: string,
  endpoint: string
): Promise<void> {
  try {
    logger.info(`Rate limit triggered: IP=${ip}, Endpoint=${endpoint}`)
  } catch (error) {
    logger.error('Error recording rate limited event:', error)
  }
}
