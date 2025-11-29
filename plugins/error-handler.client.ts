import { defineNuxtPlugin } from '#app'
import { logError } from '~/utils/errorLogger'

export default defineNuxtPlugin(() => {
  // Global error handler for uncaught errors
  if (process.client) {
    window.addEventListener('error', event => {
      logError('Global error caught', event.error, 'GlobalErrorHandler', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      })
      // In a real application, you would send this to an error tracking service
      // For now, we'll just log it to console in development
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error details:', {
          message: event.error?.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        })
        logError('Error details', event.error, 'GlobalErrorHandler', {
          message: event.error?.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        })
      }
    })

    window.addEventListener('unhandledrejection', event => {
      logError(
        'Unhandled promise rejection',
        event.reason as Error,
        'GlobalErrorHandler',
        {
          reason: event.reason,
        }
      )
      // In a real application, you would send this to an error tracking service
      // For now, we'll just log it to console in development
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Unhandled rejection details:', event.reason)
        logError(
          'Unhandled rejection details',
          event.reason as Error,
          'GlobalErrorHandler',
          {
            reason: event.reason,
          }
        )
      }
    })
  }
})
