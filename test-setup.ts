// Test setup file for Nuxt application
// This file is used to configure global settings for testing

import { vi, type Mock } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Nuxt's composables and utilities
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useRuntimeConfig: vi.fn(() => ({
      public: {
        canonicalUrl: 'https://example.com',
      },
    })),
    useHead: vi.fn(),
    useSeoMeta: vi.fn(),
    useFetch: vi.fn(() => ({
      data: vi.ref(null),
      pending: vi.ref(false),
      error: vi.ref(null),
      refresh: vi.fn(),
    })),
    useAsyncData: vi.fn(() => ({
      data: vi.ref(null),
      pending: vi.ref(false),
      error: vi.ref(null),
      refresh: vi.fn(),
    })),
  }
})

// Mock window object properties
Object.defineProperty(window, 'matchMedia', {
  writable: true,
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

// Mock navigator object properties
Object.defineProperty(navigator, 'connection', {
  value: {
    effectiveType: '4g',
    rtt: 50,
    saveData: false,
  },
  writable: true,
})

// Configure Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key, // Mock i18n translation
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  },
  writable: true,
})

// Mock IntersectionObserver
class IntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserver,
})

// Mock ResizeObserver
class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserver,
})

// Mock fetch API
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: vi.fn(() => Promise.resolve({})),
    text: vi.fn(() => Promise.resolve('')),
    ok: true,
    status: 200,
  })
) as Mock

// Mock DOMPurify
vi.mock('dompurify', async () => {
  const actual = await vi.importActual('isomorphic-dompurify')
  return {
    ...actual,
    default: {
      sanitize: (str: string) => str,
    },
  }
})

// Mock XSS library
vi.mock('xss', () => ({
  default: (str: string) => str,
}))

// Mock process environment
vi.stubEnv('CANONICAL_URL', 'https://example.com')
