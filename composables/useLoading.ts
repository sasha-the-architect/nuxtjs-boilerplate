import { ref, readonly } from 'vue'

// Loading state management composable
export const useLoading = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Execute a function with loading state management
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const result = await fn()
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Set loading state manually
  const setLoading = (state: boolean) => {
    loading.value = state
    if (!state) {
      error.value = null
    }
  }

  // Set error state manually
  const setError = (message: string | null) => {
    error.value = message
  }

  // Clear error state
  const clearError = () => {
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    withLoading,
    setLoading,
    setError,
    clearError,
  }
}
