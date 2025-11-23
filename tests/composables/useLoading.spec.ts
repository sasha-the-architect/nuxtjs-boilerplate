import { describe, it, expect, vi } from 'vitest'
import { useLoading } from '~/composables/useLoading'

describe('useLoading', () => {
  it('should initialize with loading and error as false/undefined', () => {
    const { loading, error } = useLoading()

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('should set loading to true when withLoading is called', async () => {
    const { loading, withLoading } = useLoading()

    const mockFunction = vi.fn().mockResolvedValue('success')

    await withLoading(mockFunction)

    expect(loading.value).toBe(false) // Should be false after completion
    expect(mockFunction).toHaveBeenCalled()
  })

  it('should handle errors properly with withLoading', async () => {
    const { loading, error, withLoading } = useLoading()

    const mockFunction = vi.fn().mockRejectedValue(new Error('Test error'))

    await expect(withLoading(mockFunction)).rejects.toThrow('Test error')

    expect(loading.value).toBe(false) // Should be false after error
    expect(error.value).not.toBeNull()
    expect(error.value?.message).toBe('Test error')
  })

  it('should allow manual setting of loading state', () => {
    const { loading, setLoading } = useLoading()

    setLoading(true)
    expect(loading.value).toBe(true)

    setLoading(false)
    expect(loading.value).toBe(false)
  })

  it('should allow manual setting of error state', () => {
    const { error, setError } = useLoading()

    setError('Test error message')
    expect(error.value).not.toBeNull()
    expect(error.value?.message).toBe('Test error message')
  })

  it('should allow clearing error state', () => {
    const { error, setError, clearError } = useLoading()

    setError('Test error message')
    expect(error.value).not.toBeNull()

    clearError()
    expect(error.value).toBeNull()
  })

  it('should reset both loading and error states', () => {
    const { loading, error, setLoading, setError, reset } = useLoading()

    setLoading(true)
    setError('Test error message')

    expect(loading.value).toBe(true)
    expect(error.value).not.toBeNull()

    reset()

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })
})
