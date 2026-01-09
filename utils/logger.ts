/**
 * Structured logging utility for application
 * Provides environment-based logging with different log levels
 */

export interface Logger {
  debug: (_message: string, ..._data: unknown[]) => void
  info: (_message: string, ..._data: unknown[]) => void
  warn: (_message: string, ..._data: unknown[]) => void
  error: (_message: string, ..._data: unknown[]) => void
}

export const logger: Logger = {
  debug: (_message: string, ..._data: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${_message}`, ..._data)
    }
  },
  info: (_message: string, ..._data: unknown[]) => {
    // Only log info in development or when specifically enabled
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.LOG_LEVEL === 'info' ||
      process.env.LOG_LEVEL === 'debug'
    ) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${_message}`, ..._data)
    }
  },
  warn: (_message: string, ..._data: unknown[]) => {
    // Log warnings in all environments except production unless specifically disabled
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.LOG_WARNINGS === 'true'
    ) {
      console.warn(`[WARN] ${_message}`, ..._data)
    }
  },
  error: (_message: string, ..._data: unknown[]) => {
    // Always log errors unless specifically disabled
    if (process.env.LOG_ERRORS !== 'false') {
      console.error(`[ERROR] ${_message}`, ..._data)
    }
  },
}

export default logger
