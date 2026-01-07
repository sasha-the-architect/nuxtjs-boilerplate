import { defineNitroPlugin } from 'nitropack/runtime'
import type { H3Event } from 'h3'

interface RateLimitStore {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitStore>()

const RATE_LIMIT_WINDOW = 60000 // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 100 // Max requests per window

const ADMIN_BYPASS_KEY = process.env.ADMIN_RATE_LIMIT_BYPASS_KEY

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('request', async (event: H3Event) => {
    try {
      // Skip rate limiting for non-API routes
      if (!event.path.startsWith('/api/')) {
        return
      }

      // Skip rate limiting in test environment
      if (process.env.NODE_ENV === 'test') {
        return
      }

      // Check for admin bypass key in headers
      const bypassKey = event.node.req.headers['x-rate-limit-bypass'] as string
      if (ADMIN_BYPASS_KEY && bypassKey === ADMIN_BYPASS_KEY) {
        return
      }

      const now = Date.now()
      const clientIp = getClientIp(event)
      const key = `ratelimit:${clientIp}`

      const record = rateLimitStore.get(key)

      if (!record) {
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW,
        })
        return
      }

      if (now > record.resetTime) {
        record.count = 1
        record.resetTime = now + RATE_LIMIT_WINDOW
        return
      }

      if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000)

        event.node.res.setHeader('Content-Type', 'application/json')
        event.node.res.setHeader('Retry-After', String(retryAfter))
        event.node.res.statusCode = 429

        event.node.res.end(
          JSON.stringify({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please try again later.',
              category: 'rate_limit',
              timestamp: new Date().toISOString(),
              details: {
                retryAfter,
              },
            },
          })
        )
        return
      }

      record.count++
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Rate limiting error:', error)
      }
    }
  })
})

function getClientIp(event: H3Event): string {
  const forwarded = event.node.req.headers['x-forwarded-for'] as string
  const realIp = event.node.req.headers['x-real-ip'] as string

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return event.node.req.socket.remoteAddress || 'unknown'
}
