# Integration Patterns Guide

This guide documents the resilience patterns and integration best practices used throughout the Nuxt.js boilerplate for handling external service calls and API interactions.

## 📋 Table of Contents

- [Overview](#overview)
- [Circuit Breaker Pattern](#circuit-breaker-pattern)
- [Retry with Exponential Backoff](#retry-with-exponential-backoff)
- [Standardized Error Responses](#standardized-error-responses)
- [Integration Best Practices](#integration-best-practices)
- [Common Use Cases](#common-use-cases)

## Overview

The application implements industry-standard resilience patterns to handle external service integrations reliably:

- **Circuit Breaker**: Prevents cascading failures from failing services
- **Retry with Backoff**: Handles transient network failures gracefully
- **Standardized Errors**: Consistent error handling across all APIs
- **Health Monitoring**: Built-in observability for integration health

## Circuit Breaker Pattern

The circuit breaker pattern prevents cascading failures by stopping calls to services that are experiencing problems.

### How It Works

The circuit breaker has three states:

1. **CLOSED**: Normal operation - all requests go through
2. **OPEN**: Service is down - all requests fail fast
3. **HALF-OPEN**: Testing recovery - limited requests allowed

```
┌─────────────────────────────────────────────────────┐
│              API Endpoint / Service                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Circuit Breaker                      │
│  • Check state (closed/open/half-open)          │
│  • Track failures/successes                      │
│  • Execute or return fallback                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          External Service Call                    │
│  • HTTP request with timeout                     │
│  • Response handling                            │
└─────────────────────────────────────────────────────┘
```

### Usage Example

```typescript
import { getCircuitBreaker } from '~/server/utils/circuit-breaker'

async function fetchExternalData() {
  const breaker = getCircuitBreaker('service-name', {
    failureThreshold: 5, // Failures before opening
    successThreshold: 2, // Successes before closing
    timeoutMs: 60000, // Time before testing reset
  })

  const result = await breaker.execute(
    async () => {
      // Primary operation
      return await externalApiCall()
    },
    () => {
      // Fallback operation
      return fallbackData()
    }
  )

  return result
}
```

### Circuit Breaker Configuration

```typescript
interface CircuitBreakerConfig {
  failureThreshold?: number // Default: 5
  successThreshold?: number // Default: 2
  timeoutMs?: number // Default: 60000 (1 minute)
}
```

### Monitoring Circuit Breaker Status

```typescript
import { getAllCircuitBreakerStats } from '~/server/utils/circuit-breaker'

// Get all circuit breaker statistics
const stats = getAllCircuitBreakerStats()

// Output example:
{
  'service-name': {
    state: 'closed' | 'open' | 'half-open',
    failureCount: 2,
    successCount: 10,
    lastFailureTime: '2025-01-07T12:00:00Z',
    lastSuccessTime: '2025-01-07T12:05:00Z',
    failureRate: 0.16
  }
}
```

### When to Use Circuit Breakers

✅ **Use Circuit Breakers For:**

- External API calls to third-party services
- Database connections to remote servers
- Webhook delivery to external endpoints
- URL validation for external links
- Any operation with network dependency that can fail

❌ **Don't Use Circuit Breakers For:**

- Local file operations
- In-memory computations
- Operations with side effects that shouldn't be skipped
- Very fast, reliable operations

## Retry with Exponential Backoff

The retry mechanism handles transient failures by automatically retrying failed operations with increasing delays.

### How It Works

1. **Exponential Backoff**: Delay increases with each retry (baseDelay × 2^attempt)
2. **Jitter**: Random variation in delay to prevent thundering herd
3. **Retryable Errors**: Only retries specific error types
4. **Max Retries**: Configurable limit on retry attempts

### Usage Example

```typescript
import { retryWithBackoff } from '~/server/utils/retry'

async function fetchWithRetry() {
  const result = await retryWithBackoff(
    async () => {
      // Operation that might fail transiently
      return await externalApiCall()
    },
    {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      jitterEnabled: true,
    }
  )

  return result
}
```

### Retry Configuration

```typescript
interface RetryConfig {
  maxRetries?: number // Default: 3
  baseDelayMs?: number // Default: 1000
  maxDelayMs?: number // Default: 30000
  jitterEnabled?: boolean // Default: true
}
```

### Retry Presets

The application includes pre-configured retry strategies for common use cases:

```typescript
import { retryPresets } from '~/server/utils/retry'

// Quick retries (fast, low number)
await retryWithBackoff(operation, retryPresets.quick)

// Standard retries (balanced)
await retryWithBackoff(operation, retryPresets.standard)

// Slow retries (persistent failures)
await retryWithBackoff(operation, retryPresets.slow)

// Aggressive retries (high throughput)
await retryWithBackoff(operation, retryPresets.aggressive)
```

### Retry Preset Details

| Preset       | Base Delay | Max Delay | Max Retries | Use Case                      |
| ------------ | ---------- | --------- | ----------- | ----------------------------- |
| `quick`      | 500ms      | 5s        | 2           | Fast, non-critical operations |
| `standard`   | 1s         | 30s       | 3           | General purpose               |
| `slow`       | 2s         | 60s       | 5           | Persistent failures           |
| `aggressive` | 100ms      | 5s        | 3           | High throughput operations    |

### Retryable Errors

The retry mechanism automatically retries on:

**HTTP Status Codes:**

- `408`: Request Timeout
- `429`: Too Many Requests
- `500`: Internal Server Error
- `502`: Bad Gateway
- `503`: Service Unavailable
- `504`: Gateway Timeout

**Network Errors:**

- `ECONNRESET`: Connection reset
- `ETIMEDOUT`: Connection timeout
- `ENOTFOUND`: DNS lookup failed
- `ECONNREFUSED`: Connection refused

### Monitoring Retry Statistics

```typescript
const result = await retryWithBackoff(operation, {
  onRetry: (attempt, error, delay) => {
    console.log(`Attempt ${attempt} failed, retrying in ${delay}ms`, error)
  },
})

// Statistics available on result object
console.log(result.stats)
// {
//   attempts: 3,
//   totalDelay: 6000,
//   errors: [Error, Error, Success]
// }
```

## Standardized Error Responses

All API endpoints use a standardized error response format for consistent client error handling.

### Error Response Format

```typescript
interface ApiErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    category: ErrorCategory
    details?: string | Record<string, unknown>
    timestamp: string
    requestId?: string
    path?: string
  }
}
```

### Error Categories

| Category           | HTTP Status | Description                  |
| ------------------ | ----------- | ---------------------------- |
| `validation`       | 400         | Request validation failures  |
| `authentication`   | 401         | Authentication required      |
| `authorization`    | 403         | Access forbidden             |
| `not_found`        | 404         | Resource not found           |
| `rate_limit`       | 429         | Rate limit exceeded          |
| `external_service` | 502/503/504 | Third-party service failures |
| `internal`         | 500         | Server errors                |
| `network`          | 500         | Network-related errors       |

### Error Codes

```typescript
enum ErrorCode {
  VALIDATION_ERROR = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  RATE_LIMIT_EXCEEDED = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  // ... more codes
}
```

### Sending Error Responses

```typescript
import {
  sendApiError,
  sendBadRequestError,
  sendUnauthorizedError,
  sendNotFoundError,
  sendRateLimitError,
} from '~/server/utils/api-error'

// Generic error
export default defineEventHandler(event => {
  return sendApiError(event, {
    code: ErrorCode.VALIDATION_ERROR,
    category: 'validation',
    message: 'Invalid request parameters',
  })
})

// Specific error types
export default defineEventHandler(event => {
  return sendBadRequestError(event, 'Invalid email address')
})

export default defineEventHandler(event => {
  return sendUnauthorizedError(event, 'Please log in to continue')
})

export default defineEventHandler(event => {
  return sendNotFoundError(event, 'Resource not found')
})

export default defineEventHandler(event => {
  return sendRateLimitError(event, 60) // Retry-After: 60 seconds
})
```

### Error Response Examples

```json
// Validation Error
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Invalid request parameters",
    "category": "validation",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    },
    "timestamp": "2025-01-07T12:00:00Z",
    "requestId": "req_abc123",
    "path": "/api/auth/register"
  }
}

// Rate Limit Error
{
  "success": false,
  "error": {
    "code": 429,
    "message": "Too many requests",
    "category": "rate_limit",
    "details": "Please wait 60 seconds before making another request",
    "timestamp": "2025-01-07T12:00:00Z",
    "requestId": "req_def456"
  }
}
```

## Integration Best Practices

### DO: Best Practices

✅ **Use Circuit Breakers for All External Service Calls**

```typescript
// Good
async function fetchData() {
  const breaker = getCircuitBreaker('external-api')
  return await breaker.execute(externalApiCall, fallback)
}
```

✅ **Configure Appropriate Retry Strategies**

```typescript
// Good - use preset based on operation type
const quickResult = await retryWithBackoff(operation, retryPresets.quick)

const standardResult = await retryWithBackoff(operation, retryPresets.standard)
```

✅ **Implement Fallback Mechanisms**

```typescript
// Good - provide graceful degradation
const breaker = getCircuitBreaker('analytics-api', {
  failureThreshold: 5,
})

const data = await breaker.execute(
  async () => await fetchAnalytics(),
  () => ({ events: [], total: 0 }) // Fallback
)
```

✅ **Set Reasonable Timeouts**

```typescript
// Good - 10s timeout for webhooks
await breaker.execute(async () => await sendWebhook(url, payload), {
  timeoutMs: 10000,
})
```

✅ **Use Jitter in Retry Delays**

```typescript
// Good - prevents thundering herd
await retryWithBackoff(operation, {
  jitterEnabled: true,
})
```

✅ **Monitor Circuit Breaker States**

```typescript
// Good - proactive monitoring
const stats = getAllCircuitBreakerStats()
for (const [serviceName, breakerStats] of Object.entries(stats)) {
  if (breakerStats.state === 'open') {
    alertTeam(`Circuit breaker open for ${serviceName}`)
  }
}
```

✅ **Log All Failures with Context**

```typescript
// Good - detailed logging
await retryWithBackoff(operation, {
  onRetry: (attempt, error, delay) => {
    logger.error(`Retry attempt ${attempt}`, {
      error: error.message,
      delay,
      service: 'external-api',
    })
  },
})
```

### DON'T: Anti-Patterns

❌ **Call External Services Without Circuit Breakers**

```typescript
// Bad - no circuit breaker
async function fetchData() {
  return await externalApiCall() // Can cascade failures
}
```

❌ **Use Infinite Retries**

```typescript
// Bad - can cause resource exhaustion
async function fetchData() {
  let attempts = 0
  while (true) {
    try {
      return await externalApiCall()
    } catch (error) {
      attempts++
      // Never stops retrying
    }
  }
}
```

❌ **Retry Non-Idempotent Operations Without Idempotency Keys**

```typescript
// Bad - can cause duplicate operations
await retryWithBackoff(
  async () => await createCharge(amount), // Not idempotent!
  retryPresets.standard
)
```

❌ **Expose Internal Errors to Clients in Production**

```typescript
// Bad - leaks implementation details
export default defineEventHandler(event => {
  try {
    return await operation()
  } catch (error) {
    return sendApiError(event, {
      message: error.stack, // Exposes internal code!
    })
  }
})
```

❌ **Hardcode Timeout Values Across All Operations**

```typescript
// Bad - one size doesn't fit all
await retryWithBackoff(
  operation,
  { timeoutMs: 60000 } // Too long for quick operations
)
```

❌ **Retry Without Backoff or Jitter**

```typescript
// Bad - causes thundering herd
async function fetchData() {
  for (let i = 0; i < 3; i++) {
    try {
      return await externalApiCall()
    } catch (error) {
      // Immediate retry - no delay!
    }
  }
}
```

❌ **Ignore Circuit Breaker Open States**

```typescript
// Bad - doesn't check circuit breaker state
const breaker = getCircuitBreaker('service-name')
await breaker.execute(operation, fallback)
// Never checks if circuit is open!
```

## Common Use Cases

### Webhook Delivery with Resilience

```typescript
import { getCircuitBreaker } from '~/server/utils/circuit-breaker'
import { retryPresets } from '~/server/utils/retry'
import { sendApiError } from '~/server/utils/api-error'

export default defineEventHandler(async event => {
  const { webhookUrl, payload } = await readBody(event)

  // Circuit breaker per hostname
  const hostname = new URL(webhookUrl).hostname
  const breaker = getCircuitBreaker(`webhook-${hostname}`, {
    failureThreshold: 5,
    timeoutMs: 10000,
  })

  try {
    const result = await breaker.execute(
      async () => {
        return await retryWithBackoff(async () => {
          return await $fetch(webhookUrl, {
            method: 'POST',
            body: payload,
            timeout: 10000,
          })
        }, retryPresets.standard)
      },
      () => ({
        success: false,
        delivered: false,
        reason: 'Circuit breaker open',
      })
    )

    return { success: true, delivered: true, result }
  } catch (error) {
    return sendApiError(event, {
      code: ErrorCode.SERVICE_UNAVAILABLE,
      category: 'external_service',
      message: 'Failed to deliver webhook',
      details: error.message,
    })
  }
})
```

### URL Validation with Resilience

```typescript
import { getCircuitBreaker } from '~/server/utils/circuit-breaker'
import { retryPresets } from '~/server/utils/retry'

export default defineEventHandler(async event => {
  const { url } = await readBody(event)

  const hostname = new URL(url).hostname
  const breaker = getCircuitBreaker(`url-check-${hostname}`)

  const result = await breaker.execute(
    async () => {
      return await retryWithBackoff(
        async () => {
          return await $fetch(url, {
            method: 'HEAD',
            timeout: 5000,
          })
        },
        {
          ...retryPresets.quick,
          maxRetries: 2,
        }
      )
    },
    () => ({
      valid: false,
      status: 'unreachable',
    })
  )

  return result
})
```

### External API Integration

```typescript
import { getCircuitBreaker } from '~/server/utils/circuit-breaker'
import { retryPresets } from '~/server/utils/retry'

async function getExternalResource(id: string) {
  const breaker = getCircuitBreaker('external-resource-api', {
    failureThreshold: 5,
    successThreshold: 2,
    timeoutMs: 30000,
  })

  const resource = await breaker.execute(
    async () => {
      return await retryWithBackoff(async () => {
        return await $fetch(`https://api.example.com/resources/${id}`, {
          timeout: 10000,
        })
      }, retryPresets.standard)
    },
    () => {
      return getCachedResource(id) || null
    }
  )

  return resource
}
```

## Monitoring and Observability

### Circuit Breaker Health Endpoint

```typescript
import { getAllCircuitBreakerStats } from '~/server/utils/circuit-breaker'

export default defineEventHandler(() => {
  const stats = getAllCircuitBreakerStats()

  return {
    timestamp: new Date().toISOString(),
    circuitBreakers: stats,
    summary: {
      total: Object.keys(stats).length,
      open: Object.values(stats).filter(s => s.state === 'open').length,
      halfOpen: Object.values(stats).filter(s => s.state === 'half-open')
        .length,
      closed: Object.values(stats).filter(s => s.state === 'closed').length,
    },
  }
})
```

### Alerting on Circuit Breaker State Changes

```typescript
import { getAllCircuitBreakerStats } from '~/server/utils/circuit-breaker'

function monitorCircuitBreakers() {
  setInterval(() => {
    const stats = getAllCircuitBreakerStats()

    for (const [serviceName, breakerStats] of Object.entries(stats)) {
      if (breakerStats.state === 'open') {
        // Alert team
        sendAlert(`Circuit breaker OPEN for ${serviceName}`, {
          failureCount: breakerStats.failureCount,
          failureRate: breakerStats.failureRate,
          lastFailureTime: breakerStats.lastFailureTime,
        })
      }
    }
  }, 60000) // Check every minute
}
```

## Troubleshooting

### Circuit Breaker Always Open

**Problem**: Circuit breaker stays open even after service recovers.

**Solutions**:

1. Check `timeoutMs` configuration - might be too long
2. Verify service is actually healthy
3. Manual reset: `breaker.reset()`
4. Increase `successThreshold` to allow recovery

### Retries Not Happening

**Problem**: Operation fails immediately without retries.

**Solutions**:

1. Check if error is retryable (check error type)
2. Verify `maxRetries` configuration
3. Ensure operation is throwing correct error types
4. Check if circuit breaker is open

### High Failure Rate Despite Retries

**Problem**: Operations keep failing even with retries.

**Solutions**:

1. Check service health status
2. Verify configuration (timeouts, endpoints)
3. Review error logs for patterns
4. Consider circuit breaker to prevent retries

### Performance Impact

**Problem**: Integration patterns causing slow responses.

**Solutions**:

1. Reduce `timeoutMs` values
2. Lower `maxRetries` for non-critical operations
3. Use faster retry presets (`quick` vs `standard`)
4. Cache results of successful operations

---

## References

- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [API Documentation](./api/README.md)
- [Architecture Blueprint](./blueprint.md#integration-architecture)

---

_Last Updated: 2025-01-07_
