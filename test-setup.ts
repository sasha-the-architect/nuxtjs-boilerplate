// Test setup file for Vitest with Nuxt
import { vi } from 'vitest'

// Mock localStorage and sessionStorage if they don't exist
if (typeof window !== 'undefined') {
  if (typeof window.localStorage === 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      writable: true,
    })
  }

  if (typeof window.sessionStorage === 'undefined') {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      writable: true,
    })
  }

  if (typeof window.matchMedia === 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }
}

// Mock DOMPurify
vi.mock('dompurify', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: {
      sanitize: html => {
        // Basic sanitization for testing
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
      },
    },
  }
})

// Mock fetch if not available
if (typeof global !== 'undefined' && typeof global.fetch === 'undefined') {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      ok: true,
      status: 200,
    })
  )
}

// Set test environment
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_ENV = 'test'
}
