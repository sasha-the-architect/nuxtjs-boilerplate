// Error logging service for consistent error tracking
export interface ErrorLog {
  id: string
  timestamp: Date
  message: string
  stack?: string
  url?: string
  userAgent?: string
  component?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100 // Keep only the last 100 logs

  // Log an error with different severity levels
  log(
    message: string,
    severity: ErrorLog['severity'] = 'error',
    error?: Error,
    component?: string
  ): void {
    const log: ErrorLog = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date(),
      message,
      stack: error?.stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof window !== 'undefined' ? navigator.userAgent : undefined,
      component,
      severity,
    }

    this.logs.push(log)

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console[
        severity === 'error' || severity === 'critical'
          ? 'error'
          : severity === 'warning'
            ? 'warn'
            : 'log'
      ](`[${severity.toUpperCase()}]`, message, error)
    }

    // Here we could also send logs to an external service
    // For example: sendToExternalService(log)
  }

  // Get all logs
  getLogs(): ErrorLog[] {
    return [...this.logs] // Return a copy to prevent external mutation
  }

  // Get logs by severity
  getLogsBySeverity(severity: ErrorLog['severity']): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity)
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = []
  }

  // Get error count
  getErrorCount(): number {
    return this.logs.filter(
      log => log.severity === 'error' || log.severity === 'critical'
    ).length
  }

  // Send logs to external service (placeholder)
  private async sendToExternalService(log: ErrorLog): Promise<void> {
    // This is a placeholder for sending logs to an external service like Sentry, LogRocket, etc.
    // In a real implementation, you would send the log to your preferred error tracking service
    try {
      // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(log) })
    } catch (err) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to send log to external service:', err)
      }
    }
  }
}

// Create a singleton instance
export const errorLogger = new ErrorLogger()

// Convenience functions for different severity levels
export const logError = (
  message: string,
  error?: Error,
  component?: string
) => {
  errorLogger.log(message, 'error', error, component)
}

export const logWarning = (
  message: string,
  error?: Error,
  component?: string
) => {
  errorLogger.log(message, 'warning', error, component)
}

export const logInfo = (message: string, error?: Error, component?: string) => {
  errorLogger.log(message, 'info', error, component)
}

export const logCritical = (
  message: string,
  error?: Error,
  component?: string
) => {
  errorLogger.log(message, 'critical', error, component)
}
