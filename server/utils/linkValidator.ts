import { LinkHealth } from '~/types/resource'

interface ValidationResult {
  status: 'valid' | 'invalid' | 'unknown' | 'checking'
  statusCode?: number
  responseTime?: number
  error?: string
}

/**
 * Validates a URL by making an HTTP request to check its status
 * @param url - The URL to validate
 * @param timeout - Request timeout in milliseconds (default 10000ms)
 * @returns ValidationResult with status information
 */
export async function validateUrl(
  url: string,
  timeout: number = 10000
): Promise<ValidationResult> {
  const startTime = Date.now()

  try {
    // Basic URL validation
    const parsedUrl = new URL(url)

    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // Make HEAD request first (faster than GET)
    let response
    try {
      response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'NuxtJS-Boilerplate-Link-Validator/1.0',
        },
      })
    } catch (headError) {
      // If HEAD fails, try GET request
      try {
        response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'NuxtJS-Boilerplate-Link-Validator/1.0',
          },
        })
      } catch (getError) {
        clearTimeout(timeoutId)
        // If both HEAD and GET fail due to network error
        if (controller.signal.aborted) {
          return {
            status: 'invalid',
            error: 'Request timeout',
          }
        }
        return {
          status: 'invalid',
          error: (getError as Error).message || 'Network error',
        }
      }
    }

    clearTimeout(timeoutId)

    const responseTime = Date.now() - startTime

    // Check if response status indicates a valid link
    if (response.status >= 200 && response.status < 400) {
      return {
        status: 'valid',
        statusCode: response.status,
        responseTime,
      }
    } else if (response.status >= 400 && response.status < 500) {
      return {
        status: 'invalid',
        statusCode: response.status,
        responseTime,
        error: `Client error: ${response.status}`,
      }
    } else if (response.status >= 500) {
      return {
        status: 'invalid',
        statusCode: response.status,
        responseTime,
        error: `Server error: ${response.status}`,
      }
    } else {
      return {
        status: 'invalid',
        statusCode: response.status,
        responseTime,
        error: `Unexpected status: ${response.status}`,
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      status: 'invalid',
      responseTime,
      error: (error as Error).message || 'Unknown error during validation',
    }
  }
}

/**
 * Updates the link health status for a resource
 * @param url - The URL to validate
 * @returns LinkHealth object with validation results
 */
export async function updateLinkHealth(url: string): Promise<LinkHealth> {
  const result = await validateUrl(url)

  return {
    status: result.status,
    lastChecked: new Date().toISOString(),
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    error: result.error,
  }
}
