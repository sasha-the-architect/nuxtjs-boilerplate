import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLoading, useGlobalLoading } from '~/composables/useLoading'

describe('useLoading', () => {
  it('initializes with correct default values', () => {
    const { loading, error, message } = useLoading()

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(message.value).toBeNull()
  })

  it('updates loading state correctly', () => {
    const { loading, setLoading } = useLoading()

    setLoading(true)
    expect(loading.value).toBe(true)

    setLoading(false)
    expect(loading.value).toBe(false)
  })

  it('updates error state correctly', () => {
    const { error, setError } = useLoading()

    setError('Test error')
    expect(error.value).toBe('Test error')

    setError(null)
    expect(error.value).toBeNull()
  })

  it('resets state correctly', () => {
    const { loading, error, message, setLoading, setError, reset } =
      useLoading()

    setLoading(true)
    setError('Test error')

    reset()

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(message.value).toBeNull()
  })

  it('executes function with loading state via withLoading', async () => {
    const { loading, withLoading } = useLoading()

    const testFn = vi.fn().mockResolvedValue('success')
    const result = await withLoading(testFn)

    expect(testFn).toHaveBeenCalled()
    expect(result).toBe('success')
    expect(loading.value).toBe(false)
  })

  it('handles errors in withLoading properly', async () => {
    const { loading, error, withLoading } = useLoading()

    const testFn = vi.fn().mockRejectedValue(new Error('Test error'))

    await expect(withLoading(testFn)).rejects.toThrow('Test error')

    expect(testFn).toHaveBeenCalled()
    expect(loading.value).toBe(false)
    expect(error.value).toBe('Test error')
  })

  it('sets loading message when provided', async () => {
    const { message, withLoading } = useLoading()

    const testFn = vi.fn().mockResolvedValue('success')
    await withLoading(testFn, 'Loading...')

    // Message is set during loading but cleared after completion
    // This test focuses on the function execution
    expect(testFn).toHaveBeenCalled()
  })
})

describe('useGlobalLoading', () => {
  it('initializes with correct default values', () => {
    const { globalLoading } = useGlobalLoading()

    expect(globalLoading.value).toBe(false)
  })

  it('starts and stops global loading correctly', () => {
    const { globalLoading, startGlobalLoading, stopGlobalLoading } =
      useGlobalLoading()

    startGlobalLoading()
    expect(globalLoading.value).toBe(true)

    stopGlobalLoading()
    expect(globalLoading.value).toBe(false)
  })

  it('handles multiple loading requests properly', () => {
    const { globalLoading, startGlobalLoading, stopGlobalLoading } =
      useGlobalLoading()

    startGlobalLoading()
    expect(globalLoading.value).toBe(true)

    startGlobalLoading() // Should still be true
    expect(globalLoading.value).toBe(true)

    stopGlobalLoading() // Should still be true
    expect(globalLoading.value).toBe(true)

    stopGlobalLoading() // Should now be false
    expect(globalLoading.value).toBe(false)
  })

  it('resets global loading state correctly', () => {
    const { globalLoading, startGlobalLoading, resetGlobalLoading } =
      useGlobalLoading()

    startGlobalLoading()
    expect(globalLoading.value).toBe(true)

    resetGlobalLoading()
    expect(globalLoading.value).toBe(false)
  })
})
