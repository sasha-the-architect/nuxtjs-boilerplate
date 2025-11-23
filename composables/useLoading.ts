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
    reset,
  }
}
