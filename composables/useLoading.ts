import { ref, readonly } from 'vue'

export interface ErrorInfo {
  message: string
  timestamp: Date
  stack?: string
}

export const useLoading = () => {
  const loading = ref(false)
  const error = ref<ErrorInfo | null>(null)

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    loading.value = true
    error.value = null
    try {
      const result = await fn()
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      error.value = {
        message: errorMessage,
        timestamp: new Date(),
        stack: err instanceof Error ? err.stack : undefined,
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string, stack?: string) => {
    error.value = {
      message,
      timestamp: new Date(),
      stack,
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    withLoading,
    setLoading,
    setError,
    reset,
    clearError,
  }
}
