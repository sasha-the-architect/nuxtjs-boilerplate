import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToast } from '~/composables/useToast'

describe('useToast', () => {
  let originalSetTimeout: typeof setTimeout
  let originalClearTimeout: typeof clearTimeout
  let mockSetTimeout: any
  let mockClearTimeout: any

  beforeEach(() => {
    // Mock setTimeout and clearTimeout to control async behavior in tests
    mockSetTimeout = vi.fn(fn => {
      fn() // Immediately execute the callback
      return 1 // Return a mock ID
    })
    mockClearTimeout = vi.fn()

    originalSetTimeout = global.setTimeout
    originalClearTimeout = global.clearTimeout
    global.setTimeout = mockSetTimeout
    global.clearTimeout = mockClearTimeout
  })

  afterEach(() => {
    // Restore original setTimeout and clearTimeout
    global.setTimeout = originalSetTimeout
    global.clearTimeout = originalClearTimeout
  })

  it('should initialize with empty toasts array', () => {
    const { toasts } = useToast()

    expect(toasts).toEqual([])
  })

  it('should show a toast with provided options', () => {
    const { toasts, show } = useToast()

    const id = show({
      title: 'Test Title',
      message: 'Test Message',
      type: 'info',
      duration: 3000,
    })

    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toEqual({
      id: expect.stringContaining('toast-'),
      title: 'Test Title',
      message: 'Test Message',
      type: 'info',
      duration: 3000,
    })
    expect(id).toBe(toasts[0].id)
  })

  it('should default to info type and 5000ms duration', () => {
    const { toasts, show } = useToast()

    show({
      title: 'Test Title',
      message: 'Test Message',
    })

    expect(toasts[0].type).toBe('info')
    expect(toasts[0].duration).toBe(5000)
  })

  it('should hide a specific toast by ID', () => {
    const { toasts, show, hide } = useToast()

    const id1 = show({ title: 'Title 1', message: 'Message 1' })
    const id2 = show({ title: 'Title 2', message: 'Message 2' })

    expect(toasts).toHaveLength(2)

    hide(id1)

    expect(toasts).toHaveLength(1)
    expect(toasts[0].id).toBe(id2)
  })

  it('should clear all toasts', () => {
    const { toasts, show, clear } = useToast()

    show({ title: 'Title 1', message: 'Message 1' })
    show({ title: 'Title 2', message: 'Message 2' })

    expect(toasts).toHaveLength(2)

    clear()

    expect(toasts).toHaveLength(0)
  })

  it('should show success toast', () => {
    const { toasts, success } = useToast()

    success('Success', 'Operation completed successfully')

    expect(toasts).toHaveLength(1)
    expect(toasts[0].type).toBe('success')
    expect(toasts[0].title).toBe('Success')
    expect(toasts[0].message).toBe('Operation completed successfully')
  })

  it('should show error toast', () => {
    const { toasts, error } = useToast()

    error('Error', 'Something went wrong')

    expect(toasts).toHaveLength(1)
    expect(toasts[0].type).toBe('error')
    expect(toasts[0].title).toBe('Error')
    expect(toasts[0].message).toBe('Something went wrong')
  })

  it('should show warning toast', () => {
    const { toasts, warning } = useToast()

    warning('Warning', 'This is a warning message')

    expect(toasts).toHaveLength(1)
    expect(toasts[0].type).toBe('warning')
    expect(toasts[0].title).toBe('Warning')
    expect(toasts[0].message).toBe('This is a warning message')
  })

  it('should show info toast', () => {
    const { toasts, info } = useToast()

    info('Info', 'This is an informational message')

    expect(toasts).toHaveLength(1)
    expect(toasts[0].type).toBe('info')
    expect(toasts[0].title).toBe('Info')
    expect(toasts[0].message).toBe('This is an informational message')
  })

  it('should return ID when showing toast', () => {
    const { show } = useToast()

    const id = show({ title: 'Test', message: 'Test' })

    expect(id).toMatch(/^toast-\d+$/)
  })

  it('should handle custom duration', () => {
    const { toasts, show } = useToast()

    show({ title: 'Test', message: 'Test', duration: 2000 })

    expect(toasts[0].duration).toBe(2000)
  })
})
