/**
 * URL Validation Service
 * Validates URLs by checking HTTP status codes and other metrics
 */

interface UrlValidationResult {
  url: string
  status: number | null
  statusText: string | null
  isAccessible: boolean
  responseTime: number | null
  error?: string
  timestamp: string
}

interface ValidationOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Validates a single URL by making an HTTP request
 */
export async function validateUrl(
  url: string,
  options: ValidationOptions = {}
): Promise<UrlValidationResult> {
  const { timeout = 10000, retries = 3, retryDelay = 1000 } = options

  // Basic URL format validation
  try {
    new URL(url)
  } catch (error) {
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

  let lastError: string | undefined

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const startTime = Date.now()

      // Make a HEAD request first (more efficient), fallback to GET if HEAD is not allowed
      let response: Response
      let responseTime: number

      try {
        // First try HEAD request
        const headResponse = await fetch(url, {
          method: 'HEAD',
          timeout: timeout,
          redirect: 'follow', // Follow redirects
          headers: {
            'User-Agent': 'NuxtResourceValidator/1.0',
          },
        })

        responseTime = Date.now() - startTime
        response = headResponse

        // If HEAD method is not allowed, try GET request
        if (response.status === 405) {
          const getResponse = await fetch(url, {
            method: 'GET',
            timeout: timeout,
            redirect: 'follow',
            headers: {
              'User-Agent': 'NuxtResourceValidator/1.0',
            },
          })

          responseTime = Date.now() - startTime
          response = getResponse
        }
      } catch (headError) {
        // If HEAD fails, try GET request
        try {
          const getResponse = await fetch(url, {
            method: 'GET',
            timeout: timeout,
            redirect: 'follow',
            headers: {
              'User-Agent': 'NuxtResourceValidator/1.0',
            },
          })

          responseTime = Date.now() - startTime
          response = getResponse
        } catch (getError) {
          // If both HEAD and GET fail, throw the error
          throw getError
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
    } catch (error: any) {
      lastError = error.message || 'Unknown error'

      // If this is the last attempt, return the error result
      if (attempt === retries - 1) {
        return {
          url,
          status: null,
          statusText: null,
          isAccessible: false,
          responseTime: null,
          error: lastError,
          timestamp: new Date().toISOString(),
        }
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }

  // This should not be reached due to the return in the loop, but included for type safety
  return {
    url,
    status: null,
    statusText: null,
    isAccessible: false,
    responseTime: null,
    error: lastError || 'Validation failed',
    timestamp: new Date().toISOString(),
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
