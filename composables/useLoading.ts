import { ref, reactive } from 'vue'

interface LoadingState {
  loading: boolean
  error: Error | null
  message: string | null
}

export interface LoadingComposable {
  loading: boolean
  error: Error | null
  message: string | null
  withLoading: <T>(
    fn: () => Promise<T>,
    options?: { errorMessage?: string }
  ) => Promise<T>
  setLoading: (loading: boolean) => void
  setError: (error: Error | null, message?: string) => void
  reset: () => void
}

/**
 * Composable for managing loading states consistently across the application
 * @param initialState - Optional initial state for the loading composable
 * @returns LoadingComposable with reactive loading, error, and helper methods
 */
export const useLoading = (
  initialState?: Partial<LoadingState>
): LoadingComposable => {
  const state = reactive<LoadingState>({
    loading: false,
    error: null,
    message: null,
    ...initialState,
  })

  const setLoading = (loading: boolean) => {
    state.loading = loading
    if (!loading) {
      state.error = null
      state.message = null
    }
  }

  const setError = (error: Error | null, message?: string) => {
    state.error = error
    state.message = message || error?.message || null
    state.loading = false
  }

  const withLoading = async <T>(
    fn: () => Promise<T>,
    options: { errorMessage?: string } = {}
  ): Promise<T> => {
    try {
      setLoading(true)
      const result = await fn()
      setError(null)
      return result
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('An unexpected error occurred')
      setError(error, options.errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    state.loading = false
    state.error = null
    state.message = null
  }

  return {
    loading: state.loading,
    error: state.error,
    message: state.message,
    withLoading,
    setLoading,
    setError,
    reset,
  }
}
