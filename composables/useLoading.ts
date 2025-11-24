import { ref, computed } from 'vue'

// Define a loading state management composable
export const useLoading = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const message = ref<string | null>(null)

  // Function to wrap async operations with loading state
  const withLoading = async <T>(
    fn: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T> => {
    loading.value = true
    error.value = null
    message.value = loadingMessage || null

    try {
      const result = await fn()
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Function to set loading state manually
  const setLoading = (state: boolean) => {
    loading.value = state
    if (!state) {
      error.value = null
      message.value = null
    }
  }

  // Function to set error state
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
    if (errorMessage) {
      loading.value = false
    }
  }

  // Function to reset loading and error states
  const reset = () => {
    loading.value = false
    error.value = null
    message.value = null
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    message: computed(() => message.value),
    withLoading,
    setLoading,
    setError,
    reset,
  }
}

// Define a global loading state composable for the entire application
export const useGlobalLoading = () => {
  const globalLoading = ref(false)
  const globalLoadingCount = ref(0)

  const startGlobalLoading = () => {
    globalLoadingCount.value++
    globalLoading.value = true
  }

  const stopGlobalLoading = () => {
    if (globalLoadingCount.value > 0) {
      globalLoadingCount.value--
    }
    if (globalLoadingCount.value === 0) {
      globalLoading.value = false
    }
  }

  const resetGlobalLoading = () => {
    globalLoadingCount.value = 0
    globalLoading.value = false
  }

  return {
    globalLoading: computed(() => globalLoading.value),
    startGlobalLoading,
    stopGlobalLoading,
    resetGlobalLoading,
  }
}
