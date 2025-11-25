// Test setup file for Vitest
import { vi, expect } from 'vitest'
import '@testing-library/jest-dom'

// Mock window.matchMedia
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

// Mock ResizeObserver if it doesn't exist
if (
  typeof window !== 'undefined' &&
  typeof window.ResizeObserver === 'undefined'
) {
  class VitestResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }

  // @ts-ignore
  window.ResizeObserver = VitestResizeObserver
}

// Mock IntersectionObserver if it doesn't exist
if (
  typeof window !== 'undefined' &&
  typeof window.IntersectionObserver === 'undefined'
) {
  class VitestIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }

  // @ts-ignore
  window.IntersectionObserver = VitestIntersectionObserver
}

// Mock DOMPurify
vi.mock('dompurify', () => {
  return {
    default: {
      sanitize: (html: string) => {
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

// Mock process for Node environment
if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'process', {
    value: {
      ...process,
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    },
    writable: true,
  })
}

// Mock console to prevent test errors from console logs
if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'console', {
    value: {
      ...console,
      error: vi.fn(),
      warn: vi.fn(),
      log: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    },
    writable: true,
  })
}

// Mock fetch API if needed
if (typeof global !== 'undefined' && !global.fetch) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      ok: true,
      status: 200,
    })
  ) as any
}

// Mock URL constructor
if (typeof vi !== 'undefined') {
  vi.stubGlobal('URL', {
    prototype: {
      href: '',
      origin: '',
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
    },
    createObjectURL: vi.fn(),
    revokeObjectURL: vi.fn(),
  })
}

// Mock localStorage if needed
if (typeof window !== 'undefined') {
  const vitestLocalStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: vitestLocalStorageMock,
  })
}
