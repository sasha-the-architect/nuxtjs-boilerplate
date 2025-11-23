import { ref } from 'vue'

export interface LoadingState {
  loading: ReturnType<typeof ref<boolean>>
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
  setLoading: (value: boolean) => void
}

export const useLoading = (): LoadingState => {
  const loading = ref(false)

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    loading.value = true
    try {
      return await fn()
    } finally {
      loading.value = false
    }
  }

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  return {
    loading,
    withLoading,
    setLoading,
  }
}
