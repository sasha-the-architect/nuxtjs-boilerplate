import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLoading } from '~/composables/useLoading'
import { nextTick } from 'vue'

describe('useLoading', () => {
  beforeEach(() => {
    // Reset any global state before each test
  })

  it('should initialize with default values', () => {
    const composable = useLoading()

    expect(composable.loading).toBe(false)
    expect(composable.error).toBeNull()
    expect(composable.message).toBeNull()
  })

  it('should accept initial state', () => {
    const composable = useLoading({
      loading: true,
      error: new Error('test error'),
      message: 'test message',
    })

    expect(composable.loading).toBe(true)
    expect(composable.error).toEqual(new Error('test error'))
    expect(composable.message).toBe('test message')
  })

  it('should set loading state', async () => {
    const composable = useLoading()

    composable.setLoading(true)
    await nextTick()
    expect(composable.loading).toBe(true)

    composable.setLoading(false)
    await nextTick()
    expect(composable.loading).toBe(false)

    composable.reset()
    await nextTick()
    expect(composable.loading).toBe(false)
  })

  it('should set error state', async () => {
    const composable = useLoading()
    const testError = new Error('test error')

    composable.setError(testError, 'custom message')
    await nextTick()

    expect(composable.error).toEqual(testError)
    expect(composable.message).toBe('custom message')
  })

  it('should reset state', async () => {
    const composable = useLoading()

    // Set some state
    composable.setLoading(true)
    composable.setError(new Error('test error'), 'test message')
    await nextTick()

    // Verify state is set
    expect(composable.loading).toBe(true)
    expect(composable.error).not.toBeNull()
    expect(composable.message).not.toBeNull()

    // Reset
    composable.reset()
    await nextTick()

    // Verify state is reset
    expect(composable.loading).toBe(false)
    expect(composable.error).toBeNull()
    expect(composable.message).toBeNull()
  })

  it('should execute async function with loading state', async () => {
    const composable = useLoading()

    const asyncFn = vi.fn().mockResolvedValue('success')

    const result = await composable.withLoading(asyncFn)

    expect(asyncFn).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(composable.loading).toBe(false)
    expect(composable.error).toBeNull()
    expect(result).toBe('success')
  })

  it('should handle async function error', async () => {
    const composable = useLoading()
    const testError = new Error('async error')
    const asyncFn = vi.fn().mockRejectedValue(testError)

    await expect(composable.withLoading(asyncFn)).rejects.toThrow('async error')

    expect(asyncFn).toHaveBeenCalledTimes(1)
    // Since withLoading sets loading to false in finally block, we need to wait
    await nextTick()
    expect(composable.loading).toBe(false)
    expect(composable.error).toEqual(testError)
    expect(composable.message).toBe('async error')
  })

  it('should use custom error message in withLoading', async () => {
    const composable = useLoading()
    const testError = new Error('original error')
    const asyncFn = vi.fn().mockRejectedValue(testError)

    await expect(
      composable.withLoading(asyncFn, { errorMessage: 'custom error' })
    ).rejects.toThrow('original error')

    await nextTick()
    expect(composable.message).toBe('custom error')
  })
})
