import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLoading } from '~/composables/useLoading'

describe('useLoading', () => {
  beforeEach(() => {
    // Clear any setTimeout mocks
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  it('should initialize with correct default state', () => {
    const { loadingState } = useLoading()

    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBeNull()
    expect(loadingState.success).toBe(false)
    expect(loadingState.message).toBeNull()
  })

  it('should handle async operations with withLoading', async () => {
    const { loadingState, withLoading } = useLoading()

    const mockFn = vi.fn().mockResolvedValue('success')

    const result = await withLoading(mockFn)

    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBeNull()
    expect(result).toBe('success')
  })

  it('should set loading state during async operations', async () => {
    const { loadingState, withLoading } = useLoading()
    
    const mockFn = vi.fn().mockResolvedValue('success')
    
    // Use a promise that resolves on next tick to simulate async behavior
    const promise = withLoading(async () => {
      // Simulate async operation using Promise.resolve().then()
      await new Promise(resolve => setTimeout(resolve, 1))
      return mockFn()
    })
    
    // Check that loading is true during execution
    expect(loadingState.loading).toBe(true)
    
    await promise
    
    // Check that loading is false after completion
    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBeNull()
  })
    })

    const promise = withLoading(mockFn)

    // Check that loading is true during execution
    expect(loadingState.loading).toBe(true)

    await promise

    // Check that loading is false after completion
    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBeNull()
  })

  it('should handle errors in withLoading', async () => {
    const { loadingState, withLoading } = useLoading()

    const mockFn = vi.fn().mockRejectedValue(new Error('Test error'))

    const result = await withLoading(mockFn)

    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBe('Test error')
    expect(loadingState.message).toBe('Test error')
    expect(result).toBeNull()
  })

  it('should handle custom error messages', async () => {
    const { loadingState, withLoading } = useLoading()

    const mockFn = vi.fn().mockRejectedValue(new Error('Original error'))

    const result = await withLoading(mockFn, { errorMessage: 'Custom error' })

    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBe('Custom error')
    expect(loadingState.message).toBe('Custom error')
    expect(result).toBeNull()
  })

  it('should handle success messages', async () => {
    const { loadingState, withLoading } = useLoading()

    const mockFn = vi.fn().mockResolvedValue('success')

    const result = await withLoading(mockFn, {
      successMessage: 'Operation completed',
    })

    expect(loadingState.loading).toBe(false)
    expect(loadingState.success).toBe(true)
    expect(loadingState.message).toBe('Operation completed')
    expect(result).toBe('success')
  })

  it('should start loading manually', () => {
    const { loadingState, startLoading } = useLoading()

    startLoading('Loading...')

    expect(loadingState.loading).toBe(true)
    expect(loadingState.error).toBeNull()
    expect(loadingState.success).toBe(false)
    expect(loadingState.message).toBe('Loading...')
  })

  it('should stop loading manually', () => {
    const { loadingState, startLoading, stopLoading } = useLoading()

    startLoading()
    stopLoading('Done', true)

    expect(loadingState.loading).toBe(false)
    expect(loadingState.success).toBe(true)
    expect(loadingState.message).toBe('Done')
  })

  it('should set error manually', () => {
    const { loadingState, setError } = useLoading()

    setError('Manual error')

    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBe('Manual error')
    expect(loadingState.success).toBe(false)
    expect(loadingState.message).toBe('Manual error')
  })

  it('should reset state', () => {
    const { loadingState, startLoading, setError, reset } = useLoading()

    startLoading('Loading...')
    setError('Some error')

    reset()

    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBeNull()
    expect(loadingState.success).toBe(false)
    expect(loadingState.message).toBeNull()
  })

  it('should clear success message after timeout', async () => {
    const { loadingState, withLoading } = useLoading()

    const mockFn = vi.fn().mockResolvedValue('success')

    await withLoading(mockFn, { successMessage: 'Success!' })

    expect(loadingState.success).toBe(true)
    expect(loadingState.message).toBe('Success!')

    // Advance timers by 3 seconds to trigger the timeout
    vi.advanceTimersByTime(3000)

    expect(loadingState.success).toBe(false)
    expect(loadingState.message).toBeNull()
  })
})
