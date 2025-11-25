<<<<<<< HEAD
import { ref, readonly } from 'vue'

export interface LoadingState {
  loading: boolean
  error: string | null
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
  reset: () => void
}

export const useLoading = (): LoadingState => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const result = await fn()
      return result
    } catch (err: any) {
      error.value = err?.message || 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    withLoading,
=======
import { ref, reactive, readonly } from 'vue'

// Define loading state interface
export interface LoadingState {
  loading: boolean
  error: string | null
  success: boolean
  message: string | null
}

// Loading composable for consistent loading state management
export const useLoading = () => {
  const loadingState = reactive<LoadingState>({
    loading: false,
    error: null,
    success: false,
    message: null,
  })

  // Wrapper function to execute async operations with loading states
  const withLoading = async <T>(
    fn: () => Promise<T>,
    options?: {
      successMessage?: string
      errorMessage?: string
    }
  ): Promise<T | null> => {
    try {
      loadingState.loading = true
      loadingState.error = null
      loadingState.success = false
      loadingState.message = null

      const result = await fn()

      if (options?.successMessage) {
        loadingState.success = true
        loadingState.message = options.successMessage
      }

      return result
    } catch (err) {
      const errorMessage =
        options?.errorMessage ||
        (err instanceof Error ? err.message : 'An error occurred')
      loadingState.error = errorMessage
      loadingState.message = errorMessage

      return null
    } finally {
      loadingState.loading = false
      // Clear success message after a delay to allow user to see it
      if (loadingState.success) {
        setTimeout(() => {
          if (loadingState.success) {
            loadingState.success = false
            loadingState.message = null
          }
        }, 3000)
      }
    }
  }

  // Manual loading state control
  const startLoading = (message?: string) => {
    loadingState.loading = true
    loadingState.error = null
    loadingState.success = false
    loadingState.message = message || null
  }

  const stopLoading = (message?: string, isSuccess: boolean = false) => {
    loadingState.loading = false
    loadingState.success = isSuccess
    loadingState.message = message || null
  }

  const setError = (error: string) => {
    loadingState.error = error
    loadingState.loading = false
    loadingState.success = false
    loadingState.message = error
  }

  const reset = () => {
    loadingState.loading = false
    loadingState.error = null
    loadingState.success = false
    loadingState.message = null
  }

  return {
    loadingState: readonly(loadingState),
    withLoading,
    startLoading,
    stopLoading,
    setError,
>>>>>>> origin/main
    reset,
  }
}
