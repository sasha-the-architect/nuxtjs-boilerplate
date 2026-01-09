import { vi, beforeEach } from 'vitest'

// Make browser APIs and timers globally available for tests
const g = global as any
g.setTimeout = global.setTimeout
g.clearTimeout = global.clearTimeout
g.setInterval = global.setInterval
g.clearInterval = global.clearInterval

vi.mock('#app', async () => {
  return {
    useNuxtApp: vi.fn(),
    useRuntimeConfig: vi.fn(),
    useState: vi.fn(),
    useRequestHeaders: vi.fn(),
    useCookie: vi.fn(),
    useAsyncData: vi.fn(),
    useFetch: vi.fn(),
    navigateTo: vi.fn(),
    definePageMeta: vi.fn(),
    useHead: vi.fn(),
    useError: vi.fn(),
    showError: vi.fn(),
    clearError: vi.fn(),
  }
})

vi.mock('#app/composables/router', () => {
  return {
    useRouter: vi.fn(),
    useRoute: vi.fn(),
  }
})

vi.mock('#app/composables/router', () => {
  return {
    useRouter: vi.fn(),
    useRoute: vi.fn(),
  }
})

vi.mock('#app/composables/router', () => {
  return {
    useRouter: vi.fn(),
    useRoute: vi.fn(),
  }
})

// Setup global localStorage and sessionStorage mocks
beforeEach(() => {
  vi.clearAllMocks()
  // Also clear the actual storage
  const g = global as any
  if (g.window?.localStorage?.clear) {
    g.window.localStorage.clear()
  }
  if (g.window?.sessionStorage?.clear) {
    g.window.sessionStorage.clear()
  }
})

// Set up mocks for browser APIs that tests expect
if (typeof global !== 'undefined') {
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        for (const key in store) {
          delete store[key]
        }
      }),
      length: 0,
      key: vi.fn(),
    }
  })()

  const sessionStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        for (const key in store) {
          delete store[key]
        }
      }),
      length: 0,
      key: vi.fn(),
    }
  })()

  // @ts-ignore - Type assertion needed for testing environment
  const g = global as any

  if (typeof g.window === 'undefined') {
    g.window = {
      document: {
        createElement: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
        getElementById: vi.fn(),
        createComment: vi.fn(),
        createTextNode: vi.fn(),
      },
      localStorage: localStorageMock,
      sessionStorage: sessionStorageMock,
      location: {
        href: 'http://localhost',
      },
      navigator: {
        userAgent: 'test-agent',
      },
    }
  } else {
    // If window exists (jsdom env), assign mocks to it
    Object.defineProperty(g.window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    Object.defineProperty(g.window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    })

    // Also make available globally for tests that reference global.localStorage
    g.localStorage = g.window.localStorage
    g.sessionStorage = g.window.sessionStorage
  }
}
