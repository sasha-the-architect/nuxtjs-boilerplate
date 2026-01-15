interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableErrors: Array<number | Error | string>
  jitterEnabled: boolean
  jitterFactor: number
}

interface RetryResult<T> {
  success: boolean
  data: T | null
  error: Error | null
  attempts: number
  totalDelayMs: number
}

interface RetryAttempt {
  attemptNumber: number
  delayMs: number
  error: Error
  timestamp: string
}

export class RetryError extends Error {
  public readonly attempts: number
  public readonly errors: RetryAttempt[]

  constructor(message: string, attempts: number, errors: RetryAttempt[]) {
    super(message)
    this.name = 'RetryError'
    this.attempts = attempts
    this.errors = errors
  }
}

export function isRetryableError(
  error: unknown,
  retryableErrors: Array<number | Error | string>
): boolean {
  if (retryableErrors.length === 0) {
    return true
  }

  const errorString = String(error)

  return retryableErrors.some(retryable => {
    if (typeof retryable === 'number') {
      return errorString.includes(retryable.toString())
    } else if (retryable instanceof Error) {
      return (
        error instanceof Error &&
        error.name === retryable.name &&
        error.message === retryable.message
      )
    } else {
      return errorString.includes(retryable)
    }
  })
}

export function calculateBackoff(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000,
  jitterEnabled: boolean = true,
  jitterFactor: number = 0.1
): number {
  let delay = baseDelayMs * Math.pow(2, attempt)

  delay = Math.min(delay, maxDelayMs)

  if (jitterEnabled) {
    const jitterRange = delay * jitterFactor
    const jitter = (Math.random() - 0.5) * jitterRange
    delay += jitter
  }

  return Math.max(0, Math.floor(delay))
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  let delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt)

  delay = Math.min(delay, config.maxDelayMs)

  if (config.jitterEnabled) {
    const jitterRange = delay * config.jitterFactor
    const jitter = (Math.random() - 0.5) * jitterRange
    delay += jitter
  }

  return Math.max(0, Math.floor(delay))
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableErrors: [],
    jitterEnabled: true,
    jitterFactor: 0.1,
  }

  const finalConfig: RetryConfig = {
    ...defaultConfig,
    ...config,
    retryableErrors: config.retryableErrors || defaultConfig.retryableErrors,
  }

  const errors: RetryAttempt[] = []

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      const timestamp = new Date().toISOString()

      errors.push({
        attemptNumber: attempt + 1,
        delayMs: 0,
        error: errorObj,
        timestamp,
      })

      const isLastAttempt = attempt === finalConfig.maxRetries
      const shouldRetry =
        !isLastAttempt && isRetryableError(error, finalConfig.retryableErrors)

      if (!shouldRetry) {
        throw error
      }

      const delay = calculateDelay(attempt, finalConfig)
      errors[errors.length - 1].delayMs = delay

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new RetryError(
    `All ${finalConfig.maxRetries + 1} retry attempts failed`,
    finalConfig.maxRetries + 1,
    errors
  )
}

export async function retryWithResult<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableErrors: [],
    jitterEnabled: true,
    jitterFactor: 0.1,
  }

  const finalConfig: RetryConfig = {
    ...defaultConfig,
    ...config,
    retryableErrors: config.retryableErrors || defaultConfig.retryableErrors,
  }

  const errors: RetryAttempt[] = []
  let totalDelayMs = 0

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const result = await fn()

      return {
        success: true,
        data: result,
        error: null,
        attempts: attempt + 1,
        totalDelayMs,
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      const timestamp = new Date().toISOString()

      errors.push({
        attemptNumber: attempt + 1,
        delayMs: 0,
        error: errorObj,
        timestamp,
      })

      const isLastAttempt = attempt === finalConfig.maxRetries
      const shouldRetry =
        !isLastAttempt && isRetryableError(error, finalConfig.retryableErrors)

      if (!shouldRetry) {
        return {
          success: false,
          data: null,
          error: errorObj,
          attempts: attempt + 1,
          totalDelayMs,
        }
      }

      const delay = calculateDelay(attempt, finalConfig)
      totalDelayMs += delay
      errors[errors.length - 1].delayMs = delay

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return {
    success: false,
    data: null,
    error: new RetryError(
      `All ${finalConfig.maxRetries + 1} retry attempts failed`,
      finalConfig.maxRetries + 1,
      errors
    ),
    attempts: finalConfig.maxRetries + 1,
    totalDelayMs,
  }
}

export function getRetryableHttpCodes(): number[] {
  return [408, 429, 500, 502, 503, 504]
}

export function isRetryableHttpCode(statusCode: number): boolean {
  return getRetryableHttpCodes().includes(statusCode)
}

export const retryPresets = {
  quick: {
    maxRetries: 2,
    baseDelayMs: 500,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterEnabled: true,
    jitterFactor: 0.1,
  },
  standard: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterEnabled: true,
    jitterFactor: 0.1,
  },
  slow: {
    maxRetries: 5,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
    jitterEnabled: true,
    jitterFactor: 0.15,
  },
  aggressive: {
    maxRetries: 3,
    baseDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 1.5,
    jitterEnabled: true,
    jitterFactor: 0.2,
  },
  httpRetry: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableErrors: getRetryableHttpCodes(),
    jitterEnabled: true,
    jitterFactor: 0.1,
  },
}
