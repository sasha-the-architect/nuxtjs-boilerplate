import { ref, readonly, computed } from 'vue'

export interface ErrorHandlingState {
  error: string | null
  hasError: boolean
  setError: (error: string | null) => void
  clearError: () => void
  handleError: (error: any, fallbackMessage?: string) => void
}

export const useErrorHandling = (): ErrorHandlingState => {
  const error = ref<string | null>(null)

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const handleError = (err: any, fallbackMessage = 'An error occurred') => {
    if (err && typeof err === 'object' && err.message) {
      error.value = err.message
    } else if (typeof err === 'string') {
      error.value = err
    } else {
      error.value = fallbackMessage
    }
  }

  return {
    error: readonly(error),
    hasError: computed(() => error.value !== null),
    setError,
    clearError,
    handleError,
  }
}
