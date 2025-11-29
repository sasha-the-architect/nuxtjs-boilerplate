// Test setup file for Vitest with Nuxt
import { vi } from 'vitest'

// Mock the nuxt-vitest-app-entry that causes the original error
vi.mock('#app/nuxt-vitest-app-entry', () => ({}))

// Define missing DOM APIs that Vue/Nuxt might expect
if (typeof window !== 'undefined') {
  // Mock Intersection Observer if not present
  if (typeof window.IntersectionObserver === 'undefined') {
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    })
  }

  // Mock ResizeObserver if not present
  if (typeof window.ResizeObserver === 'undefined') {
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      value: vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    })
  }
}

// Mock DOM APIs that may be needed by components
if (typeof global !== 'undefined') {
  if (typeof global.window === 'undefined') {
    global.window = global.window || {}
  }

  if (typeof global.document === 'undefined') {
    global.document = {
      createElement: vi.fn(() => ({
        style: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getContext: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
        body: {},
      })),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      getElementById: vi.fn(),
      cookie: '',
      readyState: 'complete',
    }
  }

  if (typeof global.navigator === 'undefined') {
    global.navigator = {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
      userAgent: 'test-agent',
      platform: 'test-platform',
    }
  }

  if (typeof global.HTMLElement === 'undefined') {
    global.HTMLElement = class HTMLElement {}
  }

  if (typeof global.SVGElement === 'undefined') {
    global.SVGElement = class SVGElement {}
  }

  if (typeof global.requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = vi.fn(callback => {
      return setTimeout(callback, 0)
    })
    global.cancelAnimationFrame = vi.fn(clearTimeout)
  }

  if (typeof global.matchMedia === 'undefined') {
    global.matchMedia = vi.fn(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
  }

  if (typeof global.localStorage === 'undefined') {
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    }
  }

  if (typeof global.sessionStorage === 'undefined') {
    global.sessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    }
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

// Set test environment
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_ENV = 'test'
}
