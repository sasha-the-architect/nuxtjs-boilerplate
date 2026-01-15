import { retryWithResult, retryPresets } from '~/server/utils/retry'
import { getCircuitBreaker } from '~/server/utils/circuit-breaker'

export interface UrlValidationResult {
  url: string
  status: number | null
  statusText: string | null
  isAccessible: boolean
  responseTime: number | null
  error?: string
  timestamp: string
  attempts?: number
}

interface ValidationOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
  useCircuitBreaker?: boolean
}

/**
 * Validates a single URL by making an HTTP request with improved retry logic
 */
export async function validateUrl(
  url: string,
  options: ValidationOptions = {}
): Promise<UrlValidationResult> {
  const {
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    useCircuitBreaker = true,
  } = options

  // Basic URL format validation
  try {
    new URL(url)
  } catch {
    return {
      url,
      status: null,
      statusText: null,
      isAccessible: false,
      responseTime: null,
      error: 'Invalid URL format',
      timestamp: new Date().toISOString(),
    }
  }

  if (useCircuitBreaker) {
    const circuitBreakerKey = `url-validation:${new URL(url).hostname}`
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 60000,
    })

    const result = await retryWithResult(
      async () => {
        return circuitBreaker.execute(
          async () => {
            return fetchUrlWithTimeout(url, timeout)
          },
          () => {
            throw new Error(
              `Circuit breaker is OPEN for host: ${new URL(url).hostname}`
            )
          }
        )
      },
      {
        ...retryPresets.standard,
        maxRetries: retries,
        baseDelayMs: retryDelay,
        retryableErrors: [
          'ECONNRESET',
          'ETIMEDOUT',
          'ENOTFOUND',
          'ECONNREFUSED',
        ],
      }
    )

    if (result.success && result.data) {
      return {
        ...result.data,
        attempts: result.attempts,
      }
    }

    return {
      url,
      status: null,
      statusText: null,
      isAccessible: false,
      responseTime: null,
      error: result.error?.message || 'Validation failed',
      timestamp: new Date().toISOString(),
      attempts: result.attempts,
    }
  } else {
    const result = await retryWithResult(
      async () => fetchUrlWithTimeout(url, timeout),
      {
        ...retryPresets.standard,
        maxRetries: retries,
        baseDelayMs: retryDelay,
        retryableErrors: [
          'ECONNRESET',
          'ETIMEDOUT',
          'ENOTFOUND',
          'ECONNREFUSED',
        ],
      }
    )

    if (result.success && result.data) {
      return {
        ...result.data,
        attempts: result.attempts,
      }
    }

    return {
      url,
      status: null,
      statusText: null,
      isAccessible: false,
      responseTime: null,
      error: result.error?.message || 'Validation failed',
      timestamp: new Date().toISOString(),
      attempts: result.attempts,
    }
  }
}

/**
 * Internal function to fetch URL with timeout
 */
async function fetchUrlWithTimeout(
  url: string,
  timeout: number
): Promise<UrlValidationResult> {
  const startTime = Date.now()

  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`))
    }, timeout)
  })

  // Make a HEAD request first (more efficient), fallback to GET if HEAD is not allowed
  try {
    const response = await Promise.race([
      fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'NuxtResourceValidator/1.0',
        },
      }),
      timeoutPromise,
    ])

    const responseTime = Date.now() - startTime

    // If HEAD method is not allowed, try GET request
    if (response.status === 405) {
      const getResponse = await Promise.race([
        fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'NuxtResourceValidator/1.0',
          },
        }),
        timeoutPromise,
      ])

      const getResponseTime = Date.now() - startTime

      return {
        url,
        status: getResponse.status,
        statusText: getResponse.statusText,
        isAccessible: getResponse.status >= 200 && getResponse.status < 400,
        responseTime: getResponseTime,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      url,
      status: response.status,
      statusText: response.statusText,
      isAccessible: response.status >= 200 && response.status < 400,
      responseTime,
      timestamp: new Date().toISOString(),
    }
  } catch {
    try {
      const getResponse = await Promise.race([
        fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'NuxtResourceValidator/1.0',
          },
        }),
        timeoutPromise,
      ])

      const responseTime = Date.now() - startTime

      return {
        url,
        status: getResponse.status,
        statusText: getResponse.statusText,
        isAccessible: getResponse.status >= 200 && getResponse.status < 400,
        responseTime,
        timestamp: new Date().toISOString(),
      }
    } catch (getError) {
      return {
        url,
        status: null,
        statusText: null,
        isAccessible: false,
        responseTime: null,
        error: getError instanceof Error ? getError.message : String(getError),
        timestamp: new Date().toISOString(),
      }
    }
  }
}

/**
 * Validates multiple URLs concurrently with a limit on concurrent requests
 */
export async function validateUrls(
  urls: string[],
  options: ValidationOptions = {},
  concurrencyLimit: number = 5
): Promise<UrlValidationResult[]> {
  const results: UrlValidationResult[] = []

  // Process URLs in batches to avoid overwhelming the system
  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit)

    const batchPromises = batch.map(url => validateUrl(url, options))
    const batchResults = await Promise.all(batchPromises)

    results.push(...batchResults)
  }

  return results
}

/**
 * Determines if a URL status indicates that the resource is valid/live
 */
export function isUrlHealthy(status: number | null): boolean {
  if (status === null) return false
  // Consider 2xx and 3xx status codes as healthy
  return status >= 200 && status < 400
}
