// Test setup file for Vitest with Nuxt
import { vi } from 'vitest'

// Mock Nuxt composables and utilities
vi.mock('#app', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNuxtApp: vi.fn(() => ({
      $pinia: null,
      $router: null,
      $route: null,
      $config: {},
      isHydrating: false,
    })),
    useRuntimeConfig: vi.fn(() => ({})),
    useState: vi.fn((key, init) => {
      const states = {}
      if (!states[key]) {
        states[key] = init ? init() : null
      }
      return states[key]
    }),
    useRequestHeaders: vi.fn(() => ({})),
    useCookie: vi.fn(() => null),
    useAsyncData: vi.fn(() => ({
      data: { value: null },
      pending: { value: false },
      error: { value: null },
    })),
    useFetch: vi.fn(() => ({
      data: { value: null },
      pending: { value: false },
      error: { value: null },
    })),
    navigateTo: vi.fn(to => Promise.resolve(to)),
    definePageMeta: vi.fn(() => ({})),
    useHead: vi.fn(),
    useError: vi.fn(() => ({ value: null })),
    showError: vi.fn(),
    clearError: vi.fn(),
<<<<<<< HEAD
=======
  }
})

// Mock #app/composables specifically
vi.mock('#app/composables/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {},
    fullPath: '/',
    hash: '',
    redirectedFrom: undefined,
  })),
}))

// Mock vue composables
vi.mock('vue', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    getCurrentInstance: vi.fn(() => ({
      appContext: {
        app: {
          config: {
            globalProperties: {},
          },
        },
      },
    })),
>>>>>>> 2d2b99d (fix(pr#461): resolve build system instability by updating test configuration)
  }
})

// Mock #app/composables specifically
vi.mock('#app/composables/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {},
    fullPath: '/',
    hash: '',
    redirectedFrom: undefined,
  })),
}))

// Mock vue composables
vi.mock('vue', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    getCurrentInstance: vi.fn(() => ({
      appContext: {
        app: {
          config: {
            globalProperties: {},
          },
        },
      },
    })),
  }
})

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
          insertBefore: vi.fn(),
          querySelector: vi.fn(),
          querySelectorAll: vi.fn(() => []),
          getElementById: vi.fn(),
          createComment: vi.fn(() => ({})), // This was the missing function
          createTextNode: vi.fn(() => ({})),
          body: {
            appendChild: vi.fn(),
            removeChild: vi.fn(),
            insertBefore: vi.fn(),
          },
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
    // Create a more complete document mock with missing methods
    global.document = {
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
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      getElementById: vi.fn(),
      createComment: vi.fn(() => ({})), // This was the missing function
      createTextNode: vi.fn(() => ({})),
      createDocumentFragment: vi.fn(() => ({})),
      cookie: '',
      readyState: 'complete',
      documentElement: { style: {} },
      head: {},
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
    }
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

  if (typeof global.Element === 'undefined') {
    global.Element = class Element {}
  }
  if (typeof global.HTMLElement === 'undefined') {
    global.HTMLElement = class HTMLElement {}
  }

  if (typeof global.HTMLInputElement === 'undefined') {
    global.HTMLInputElement = class HTMLInputElement {}
  }

  if (typeof global.HTMLTextAreaElement === 'undefined') {
    global.HTMLTextAreaElement = class HTMLTextAreaElement {}
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
