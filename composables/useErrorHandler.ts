import { ref, computed, type Ref } from 'vue'
import { logError, logWarning, logCritical } from '~/utils/errorLogger'

export interface ErrorState {
  hasError: boolean
  message: string | null
  details: string | null
  component?: string
}

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

const globalErrors = ref<ErrorState[]>([])

export const useErrorHandler = () => {
  const currentError: Ref<ErrorState> = ref({
    hasError: false,
    message: null,
    details: null,
  })

  const clearError = () => {
    currentError.value = {
      hasError: false,
      message: null,
      details: null,
    }
  }

  const handleError = (
    error: Error | string,
    options: {
      severity?: ErrorSeverity
      component?: string
      details?: string
    } = {}
  ) => {
    const { severity = 'error', component, details } = options

    const errorMessage = error instanceof Error ? error.message : error
    const errorDetails =
      details ?? (error instanceof Error ? (error.stack ?? null) : null)

    currentError.value = {
      hasError: true,
      message: errorMessage,
      details: errorDetails,
      component,
    }

    const errorEntry: ErrorState = {
      hasError: true,
      message: errorMessage,
      details: errorDetails,
      component,
    }

    globalErrors.value.push(errorEntry)

    if (globalErrors.value.length > 50) {
      globalErrors.value = globalErrors.value.slice(-50)
    }

    const errorObj = error instanceof Error ? error : new Error(errorMessage)

    switch (severity) {
      case 'critical':
        logCritical(errorMessage, errorObj, component)
        break
      case 'warning':
        logWarning(errorMessage, errorObj, component)
        break
      case 'info':
        logWarning(errorMessage, errorObj, component)
        break
      default:
        logError(errorMessage, errorObj, component)
    }

    return currentError.value
  }

  const handleAsyncError = async <T>(
    fn: () => Promise<T>,
    options: {
      severity?: ErrorSeverity
      component?: string
      fallbackValue?: T
      onError?: (error: Error) => void
    } = {}
  ): Promise<T | null> => {
    const { severity = 'error', component, fallbackValue, onError } = options

    try {
      return await fn()
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      handleError(errorObj, { severity, component })
      onError?.(errorObj)
      return fallbackValue ?? null
    }
  }

  const getGlobalErrors = computed(() => globalErrors.value.slice())

  const clearGlobalErrors = () => {
    globalErrors.value = []
  }

  const hasGlobalErrors = computed(() => globalErrors.value.length > 0)

  return {
    error: computed(() => currentError.value),
    hasError: computed(() => currentError.value.hasError),
    errorMessage: computed(() => currentError.value.message),
    errorDetails: computed(() => currentError.value.details),
    clearError,
    handleError,
    handleAsyncError,
    globalErrors: getGlobalErrors,
    clearGlobalErrors,
    hasGlobalErrors,
  }
}
