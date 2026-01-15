// server/api/analytics/events.post.ts
// API endpoint for collecting analytics events from client
import { defineEventHandler, readBody, getHeaders, getRequestIP } from 'h3'
import { insertAnalyticsEvent } from '~/server/utils/analytics-db'
import { analyticsEventSchema } from '~/server/utils/validation-schemas'
import {
  sendValidationError,
  sendRateLimitError,
  sendApiError,
} from '~/server/utils/api-response'
import {
  createApiError,
  ErrorCode,
  ErrorCategory,
} from '~/server/utils/api-error'
import {
  checkRateLimit,
  recordRateLimitedEvent,
} from '~/server/utils/rate-limiter'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const headers = getHeaders(event)
    const clientIP = getRequestIP(event) || 'unknown'

    // Rate limiting: max 10 events per IP per minute using database aggregation
    const rateLimitCheck = await checkRateLimit(clientIP, 10, 60)

    if (!rateLimitCheck.allowed) {
      // Record rate limit event for analytics
      await recordRateLimitedEvent(clientIP, '/api/analytics/events')

      // Calculate retry after time (seconds until reset)
      const retryAfter = Math.ceil(
        (rateLimitCheck.resetTime - Date.now()) / 1000
      )

      return sendRateLimitError(event, retryAfter)
    }

    // Validate request body using Zod schema
    const validationResult = analyticsEventSchema.safeParse({
      type: body.type,
      resourceId: body.resourceId,
      category: body.category,
      url: body.url,
      userAgent: headers['user-agent'],
      ip: clientIP,
      timestamp: Date.now(),
      properties: body.properties,
    })

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return sendValidationError(
        event,
        firstError.path[0] as string,
        firstError.message,
        (body as Record<string, unknown>)[firstError.path[0] as string]
      )
    }

    // Create analytics event object with validated data
    const validatedData = validationResult.data
    const analyticsEvent = {
      type: validatedData.type,
      resourceId: validatedData.resourceId,
      category: validatedData.category,
      url: validatedData.url,
      userAgent: validatedData.userAgent,
      ip: validatedData.ip || clientIP,
      timestamp: validatedData.timestamp || Date.now(),
      properties: validatedData.properties,
    }

    // Store the event in the database
    const success = await insertAnalyticsEvent(analyticsEvent)
    if (!success) {
      const error = createApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to store analytics event',
        ErrorCategory.INTERNAL
      )
      return sendApiError(event, error)
    }

    // Return response with rate limit metadata
    return {
      success: true,
      eventId: analyticsEvent.timestamp,
      rateLimit: {
        remaining: rateLimitCheck.remainingRequests - 1, // -1 for this request
        limit: 10,
        reset: new Date(rateLimitCheck.resetTime).toISOString(),
      },
    }
  } catch (error) {
    console.error('Analytics event error:', error)
    const apiError = createApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to process analytics event',
      ErrorCategory.INTERNAL,
      process.env.NODE_ENV === 'development'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined
    )
    return sendApiError(event, apiError)
  }
})
