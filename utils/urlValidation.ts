/**
 * URL Validation and Health Check Service
 * Implements automated URL validation and link checking for resources
 */

interface HealthCheckResult {
  statusCode?: number
  isHealthy: boolean
  responseTime: number
  error?: string
}

/**
 * Validates a URL by making an HTTP request to check its status
 * @param url The URL to validate
 * @param timeoutMs Request timeout in milliseconds (default: 10000ms)
 * @returns Health check result with status and timing information
 */
export async function validateUrl(
  url: string,
  timeoutMs: number = 10000
): Promise<HealthCheckResult> {
  const startTime = Date.now()

  try {
    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    // Make the fetch request with timeout
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'NuxtJS-Boilerplate-Health-Checker/1.0',
      },
      redirect: 'follow', // Follow redirects to check final destination
    })

    clearTimeout(timeoutId)

    const responseTime = Date.now() - startTime

    // Check if the response status indicates a healthy link
    const isHealthy = response.status >= 200 && response.status < 400

    return {
      statusCode: response.status,
      isHealthy,
      responseTime,
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    // Determine error type and create appropriate error message
    let errorMessage = 'Unknown error'
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout'
    } else if (
      error.name === 'TypeError' &&
      error.message &&
      error.message.includes('fetch')
    ) {
      errorMessage = 'Network error or invalid URL'
    } else {
      errorMessage = error.message || 'Request failed'
    }

    return {
      isHealthy: false,
      responseTime,
      error: errorMessage,
    }
  }
}

/**
 * Validates multiple URLs with rate limiting to avoid overwhelming servers
 * @param urls Array of URLs to validate
 * @param delayMs Delay between requests in milliseconds (default: 100ms)
 * @returns Array of health check results
 */
export async function validateUrlsBatch(
  urls: string[],
  delayMs: number = 100
): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = []

  for (let i = 0; i < urls.length; i++) {
    if (i > 0) {
      // Add delay between requests to respect rate limits
      await new Promise((resolve: (value?: unknown) => void) =>
        setTimeout(resolve, delayMs)
      )
    }

    const result = await validateUrl(urls[i])
    results.push(result)
  }

  return results
}

/**
 * Validates a URL with retry logic for transient failures
 * @param url The URL to validate
 * @param maxRetries Number of retry attempts (default: 3)
 * @param retryDelayMs Delay between retries in milliseconds (default: 1000ms)
 * @returns Health check result
 */
export async function validateUrlWithRetry(
  url: string,
  maxRetries: number = 3,
  retryDelayMs: number = 1000
): Promise<HealthCheckResult> {
  let lastResult: HealthCheckResult

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    lastResult = await validateUrl(url)

    // If the URL is healthy, return immediately
    if (lastResult.isHealthy) {
      return lastResult
    }

    // If this was the last attempt, return the last result
    if (attempt === maxRetries) {
      break
    }

    // Wait before retrying
    await new Promise((resolve: (value?: unknown) => void) =>
      setTimeout(resolve, retryDelayMs)
    )
  }

  return lastResult!
}
