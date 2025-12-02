/**
 * Structured logging utility for the application
 * Provides environment-based logging with different log levels
 */

export interface Logger {
  debug: (message: string, data?: any) => void
  info: (message: string, data?: any) => void
  warn: (message: string, data?: any) => void
  error: (message: string, error?: any) => void
}

export const logger: Logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data)
    }
  },
  info: (message: string, data?: any) => {
    // Only log info in development or when specifically enabled
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.LOG_LEVEL === 'info' ||
      process.env.LOG_LEVEL === 'debug'
    ) {
      console.info(`[INFO] ${message}`, data)
    }
  },
  warn: (message: string, data?: any) => {
    // Log warnings in all environments except production unless specifically disabled
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.LOG_WARNINGS === 'true'
    ) {
      console.warn(`[WARN] ${message}`, data)
    }
  },
  error: (message: string, error?: any) => {
    // Always log errors unless specifically disabled
    if (process.env.LOG_ERRORS !== 'false') {
      console.error(`[ERROR] ${message}`, error)
    }
  },
}

export default logger
