// Test setup file for Vitest with Nuxt
import { vi } from 'vitest'

// Mock the nuxt-vitest-app-entry that causes the original error
vi.mock('#app/nuxt-vitest-app-entry', () => ({}))

// Create a basic DOM environment for Vue components
// This is needed because Vue components expect certain browser APIs
if (typeof global !== 'undefined') {
  // Mock jsdom-like functionality for basic DOM operations
  if (typeof global.window === 'undefined') {
    global.window = {
      document: {
        createElement: tag => ({
          tagName: tag.toUpperCase(),
          style: {},
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          setAttribute: vi.fn(),
          getAttribute: vi.fn(),
          appendChild: vi.fn(),
          removeChild: vi.fn(),
          querySelector: vi.fn(),
          querySelectorAll: vi.fn(() => []),
          getElementById: vi.fn(),
          createComment: vi.fn(() => ({})), // This was the missing function
          createTextNode: vi.fn(() => ({})),
          body: { appendChild: vi.fn(), removeChild: vi.fn() },
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
        getElementById: vi.fn(),
        createComment: vi.fn(() => ({})), // This was the missing function
        createTextNode: vi.fn(() => ({})),
        cookie: '',
        readyState: 'complete',
      },
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      sessionStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      location: {
        href: 'http://localhost',
        origin: 'http://localhost',
        pathname: '/',
        search: '',
        hash: '',
      },
      navigator: {
        userAgent: 'test-agent',
        platform: 'test-platform',
        clipboard: {
          writeText: vi.fn(() => Promise.resolve()),
        },
      },
      IntersectionObserver: vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
      ResizeObserver: vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
      matchMedia: vi.fn(() => ({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
      requestAnimationFrame: vi.fn(callback => setTimeout(callback, 0)),
      cancelAnimationFrame: vi.fn(clearTimeout),
      dispatchEvent: vi.fn(),
    }
  }

  if (typeof global.document === 'undefined') {
    global.document = global.window.document
  }

  if (typeof global.localStorage === 'undefined') {
    global.localStorage = global.window.localStorage
  }

  if (typeof global.sessionStorage === 'undefined') {
    global.sessionStorage = global.window.sessionStorage
  }

  if (typeof global.navigator === 'undefined') {
    global.navigator = global.window.navigator
  }

  if (typeof global.HTMLElement === 'undefined') {
    global.HTMLElement = class HTMLElement {}
  }

  if (typeof global.HTMLInputElement === 'undefined') {
    global.HTMLInputElement = class HTMLInputElement extends (
      global.HTMLElement
    ) {}
  }

  if (typeof global.HTMLTextAreaElement === 'undefined') {
    global.HTMLTextAreaElement = class HTMLTextAreaElement extends (
      global.HTMLElement
    ) {}
  }

  if (typeof global.SVGElement === 'undefined') {
    global.SVGElement = class SVGElement {}
  }

  if (typeof global.CustomEvent === 'undefined') {
    global.CustomEvent = class CustomEvent {
      constructor(event, params) {
        this.event = event
        this.params = params
      }
    }
  }

  if (typeof global.Event === 'undefined') {
    global.Event = class Event {
      constructor(event, params) {
        this.event = event
        this.params = params
      }
    }
  }

  if (typeof global.location === 'undefined') {
    global.location = global.window.location
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
if (typeof global.fetch === 'undefined') {
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
