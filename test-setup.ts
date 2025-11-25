// Comprehensive test setup file for Vitest
import { vi } from 'vitest'

// Set test environment early
process.env.NODE_ENV = 'test'
process.env.VITEST = 'true'

// Mock DOMPurify
vi.mock('dompurify', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: {
      sanitize: html => {
        // Basic sanitization for testing - just return the input for now
        // In real tests you'd want proper sanitization
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
      },
    },
  }
})

// Mock window and document if they don't exist
if (typeof window === 'undefined') {
  global.window = {} as any
}
if (typeof document === 'undefined') {
  global.document = {} as any
}

// Mock window properties if they don't exist
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock navigator if it doesn't exist
if (typeof navigator === 'undefined') {
  global.navigator = {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  } as any
} else {
  // If navigator exists but clipboard doesn't, add it
  if (!navigator.clipboard) {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  }
}

// Mock IntersectionObserver if needed
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  })
}
