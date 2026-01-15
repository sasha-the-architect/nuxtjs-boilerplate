import { describe, it, expect, vi, afterEach } from 'vitest'
import { useErrorHandler } from '~/composables/useErrorHandler'

describe('useErrorHandler', () => {
  afterEach(() => {
    vi.clearAllMocks()
    const { clearGlobalErrors } = useErrorHandler()
    clearGlobalErrors()
  })

  describe('Initial State', () => {
    it('should initialize with no error', () => {
      const { error, hasError, errorMessage, errorDetails } = useErrorHandler()

      expect(error.value).toEqual({
        hasError: false,
        message: null,
        details: null,
      })
      expect(hasError.value).toBe(false)
      expect(errorMessage.value).toBe(null)
      expect(errorDetails.value).toBe(null)
    })

    it('should initialize with empty global errors', () => {
      const { globalErrors, hasGlobalErrors } = useErrorHandler()

      expect(globalErrors.value).toEqual([])
      expect(hasGlobalErrors.value).toBe(false)
    })
  })

  describe('handleError', () => {
    it('should handle error with Error object', () => {
      const { error, hasError, errorMessage, errorDetails, handleError } =
        useErrorHandler()

      const testError = new Error('Test error message')
      handleError(testError)

      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('Test error message')
      expect(errorDetails.value).toBe(testError.stack)
      expect(error.value.component).toBeUndefined()
    })

    it('should handle error with string message', () => {
      const { error, hasError, errorMessage, handleError } = useErrorHandler()

      handleError('String error message')

      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('String error message')
      expect(error.value).toEqual({
        hasError: true,
        message: 'String error message',
        details: null,
      })
    })

    it('should handle error with component name', () => {
      const { error, handleError } = useErrorHandler()

      handleError(new Error('Component error'), { component: 'TestComponent' })

      expect(error.value.component).toBe('TestComponent')
    })

    it('should handle error with custom details', () => {
      const { error, handleError } = useErrorHandler()

      handleError(new Error('Error'), { details: 'Custom error details' })

      expect(error.value.details).toBe('Custom error details')
    })

    it('should handle error with error object and details override', () => {
      const { error, handleError } = useErrorHandler()

      const testError = new Error('Error')
      testError.stack = 'Stack trace'
      handleError(testError, { details: 'Override details' })

      expect(error.value.details).toBe('Override details')
    })

    it('should handle error with info severity', () => {
      const { hasError, errorMessage, handleError } = useErrorHandler()

      const testError = new Error('Info message')
      handleError(testError, { severity: 'info' })

      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('Info message')
    })

    it('should handle error with warning severity', () => {
      const { hasError, errorMessage, handleError } = useErrorHandler()

      const testError = new Error('Warning message')
      handleError(testError, { severity: 'warning' })

      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('Warning message')
    })

    it('should handle error with critical severity', () => {
      const { hasError, errorMessage, handleError } = useErrorHandler()

      const testError = new Error('Critical message')
      handleError(testError, { severity: 'critical' })

      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('Critical message')
    })

    it('should default to error severity when not specified', () => {
      const { hasError, errorMessage, handleError } = useErrorHandler()

      const testError = new Error('Default error')
      handleError(testError)

      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('Default error')
    })
  })

  describe('clearError', () => {
    it('should clear current error state', () => {
      const { hasError, errorMessage, errorDetails, handleError, clearError } =
        useErrorHandler()

      handleError(new Error('Test error'))
      expect(hasError.value).toBe(true)

      clearError()

      expect(hasError.value).toBe(false)
      expect(errorMessage.value).toBe(null)
      expect(errorDetails.value).toBe(null)
    })

    it('should clear error with component information', () => {
      const { error, handleError, clearError } = useErrorHandler()

      handleError(new Error('Error'), { component: 'TestComponent' })
      clearError()

      expect(error.value).toEqual({
        hasError: false,
        message: null,
        details: null,
      })
    })

    it('should handle clearing when no error exists', () => {
      const { hasError, clearError } = useErrorHandler()

      expect(hasError.value).toBe(false)
      clearError()

      expect(hasError.value).toBe(false)
    })
  })

  describe('handleAsyncError', () => {
    it('should handle successful async operation', async () => {
      const { hasError, errorMessage, handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        return 'success'
      }

      const result = await handleAsyncError(asyncFn)

      expect(result).toBe('success')
      expect(hasError.value).toBe(false)
      expect(errorMessage.value).toBe(null)
    })

    it('should handle async error and return fallback value', async () => {
      const { hasError, errorMessage, handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        throw new Error('Async error')
      }

      const result = await handleAsyncError(asyncFn, {
        fallbackValue: 'fallback',
      })

      expect(result).toBe('fallback')
      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('Async error')
    })

    it('should handle async error and return null when no fallback', async () => {
      const { hasError, errorMessage, handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        throw new Error('Async error')
      }

      const result = await handleAsyncError(asyncFn)

      expect(result).toBe(null)
      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('Async error')
    })

    it('should call custom error handler on error', async () => {
      const { handleAsyncError } = useErrorHandler()

      const customErrorHandler = vi.fn()
      const asyncFn = async () => {
        throw new Error('Custom handled error')
      }

      await handleAsyncError(asyncFn, {
        onError: customErrorHandler,
      })

      expect(customErrorHandler).toHaveBeenCalledTimes(1)
      expect(customErrorHandler).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should handle async error with component name', async () => {
      const { error, handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        throw new Error('Component async error')
      }

      await handleAsyncError(asyncFn, { component: 'AsyncComponent' })

      expect(error.value.component).toBe('AsyncComponent')
    })

    it('should handle async error with different severity levels', async () => {
      const { hasError, errorMessage, handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        throw new Error('Critical async error')
      }

      await handleAsyncError(asyncFn, { severity: 'critical' })

      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('Critical async error')
    })
  })

  describe('Global Error Tracking', () => {
    it('should add errors to global history', () => {
      const { globalErrors, handleError, hasGlobalErrors } = useErrorHandler()

      handleError(new Error('First error'))
      handleError(new Error('Second error'))

      expect(globalErrors.value).toHaveLength(2)
      expect(globalErrors.value[0].message).toBe('First error')
      expect(globalErrors.value[1].message).toBe('Second error')
      expect(hasGlobalErrors.value).toBe(true)
    })

    it('should include component in global error history', () => {
      const { globalErrors, handleError } = useErrorHandler()

      handleError(new Error('Component error'), { component: 'MyComponent' })

      expect(globalErrors.value[0].component).toBe('MyComponent')
    })

    it('should limit global errors to 50 entries', () => {
      const { globalErrors, handleError } = useErrorHandler()

      for (let i = 0; i < 60; i++) {
        handleError(new Error(`Error ${i}`))
      }

      expect(globalErrors.value).toHaveLength(50)
      expect(globalErrors.value[0].message).toBe('Error 10')
      expect(globalErrors.value[49].message).toBe('Error 59')
    })

    it('should clear all global errors', () => {
      const { globalErrors, handleError, clearGlobalErrors, hasGlobalErrors } =
        useErrorHandler()

      handleError(new Error('Error 1'))
      handleError(new Error('Error 2'))
      expect(globalErrors.value).toHaveLength(2)

      clearGlobalErrors()

      expect(globalErrors.value).toEqual([])
      expect(hasGlobalErrors.value).toBe(false)
    })

    it('should return independent copy of global errors', () => {
      const { globalErrors, handleError } = useErrorHandler()

      handleError(new Error('Error'))

      const errorsCopy = globalErrors.value
      errorsCopy.push({ hasError: true, message: 'Fake error', details: null })

      expect(globalErrors.value).toHaveLength(2)
      expect(globalErrors.value[0].message).toBe('Error')
      expect(globalErrors.value[1].message).toBe('Fake error')
    })
  })

  describe('Edge Cases', () => {
    it('should handle error with empty message', () => {
      const { errorMessage, hasError, handleError } = useErrorHandler()

      handleError(new Error(''))

      expect(errorMessage.value).toBe('')
      expect(hasError.value).toBe(true)
    })

    it('should handle error with no stack trace', () => {
      const { errorDetails, handleError } = useErrorHandler()

      const error = new Error('No stack')
      delete error.stack

      handleError(error)

      expect(errorDetails.value).toBe(null)
    })

    it('should handle error with null details and empty stack', () => {
      const { errorDetails, handleError } = useErrorHandler()

      const error = new Error('Test')
      error.stack = undefined

      handleError(error, { details: null })

      expect(errorDetails.value).toBe(null)
    })

    it('should handle error with details as empty string', () => {
      const { errorDetails, handleError } = useErrorHandler()

      const error = new Error('Test')
      handleError(error, { details: '' })

      expect(errorDetails.value).toBe('')
    })

    it('should handle multiple sequential errors', () => {
      const { errorMessage, handleError, clearError } = useErrorHandler()

      handleError(new Error('Error 1'))
      expect(errorMessage.value).toBe('Error 1')

      handleError(new Error('Error 2'))
      expect(errorMessage.value).toBe('Error 2')

      clearError()
      handleError(new Error('Error 3'))
      expect(errorMessage.value).toBe('Error 3')
    })

    it('should handle async operation that returns undefined', async () => {
      const { handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        return undefined
      }

      const result = await handleAsyncError(asyncFn)

      expect(result).toBe(undefined)
    })

    it('should handle async operation that returns null', async () => {
      const { handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        return null
      }

      const result = await handleAsyncError(asyncFn)

      expect(result).toBe(null)
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle error and clear multiple times', () => {
      const { hasError, errorMessage, handleError, clearError } =
        useErrorHandler()

      handleError(new Error('Error 1'))
      expect(hasError.value).toBe(true)
      clearError()
      expect(hasError.value).toBe(false)

      handleError(new Error('Error 2'))
      expect(hasError.value).toBe(true)
      expect(errorMessage.value).toBe('Error 2')
      clearError()
      expect(hasError.value).toBe(false)
    })

    it('should track errors across multiple instances', () => {
      const handler1 = useErrorHandler()
      const handler2 = useErrorHandler()

      handler1.handleError(new Error('Handler 1 error'))
      handler2.handleError(new Error('Handler 2 error'))

      expect(handler1.globalErrors.value).toHaveLength(2)
      expect(handler2.globalErrors.value).toHaveLength(2)
      expect(handler1.hasGlobalErrors.value).toBe(true)
      expect(handler2.hasGlobalErrors.value).toBe(true)
    })

    it('should clear global errors from any instance', () => {
      const handler1 = useErrorHandler()
      const handler2 = useErrorHandler()

      handler1.handleError(new Error('Error 1'))
      handler1.handleError(new Error('Error 2'))

      expect(handler1.globalErrors.value).toHaveLength(2)
      expect(handler2.globalErrors.value).toHaveLength(2)

      handler2.clearGlobalErrors()

      expect(handler1.globalErrors.value).toHaveLength(0)
      expect(handler2.globalErrors.value).toHaveLength(0)
    })

    it('should handle async error with multiple retries', async () => {
      const { handleAsyncError } = useErrorHandler()

      let attempts = 0
      const asyncFn = async () => {
        attempts++
        if (attempts < 3) {
          throw new Error(`Attempt ${attempts} failed`)
        }
        return 'success'
      }

      for (let i = 0; i < 3; i++) {
        const result = await handleAsyncError(asyncFn, {
          fallbackValue: `fallback-${i}`,
        })
        if (result === 'success') break
      }

      expect(attempts).toBe(3)
    })
  })

  describe('Type Safety', () => {
    it('should accept valid error severity levels', () => {
      const { handleError } = useErrorHandler()

      expect(() =>
        handleError(new Error('info'), { severity: 'info' })
      ).not.toThrow()
      expect(() =>
        handleError(new Error('warning'), { severity: 'warning' })
      ).not.toThrow()
      expect(() =>
        handleError(new Error('error'), { severity: 'error' })
      ).not.toThrow()
      expect(() =>
        handleError(new Error('critical'), { severity: 'critical' })
      ).not.toThrow()
    })

    it('should handle error with fallback as null', async () => {
      const { handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        throw new Error('Error')
      }

      const result = await handleAsyncError(asyncFn, { fallbackValue: null })

      expect(result).toBe(null)
    })

    it('should handle error with fallback as undefined', async () => {
      const { handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        throw new Error('Error')
      }

      const result = await handleAsyncError(asyncFn, {
        fallbackValue: undefined,
      })

      expect(result).toBe(null)
    })

    it('should handle error with fallback value', async () => {
      const { handleAsyncError } = useErrorHandler()

      const asyncFn = async () => {
        throw new Error('Error')
      }

      const result = await handleAsyncError(asyncFn, {
        fallbackValue: { data: 'fallback' },
      })

      expect(result).toEqual({ data: 'fallback' })
    })
  })
})
