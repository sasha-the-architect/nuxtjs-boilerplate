import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { config } from '@vue/test-utils'
import { ref, computed } from 'vue'

// Mock Nuxt composables
config.global.mocks = {
  $nuxt: {
    $router: {
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    },
    $route: {
      path: '/',
      query: {},
      params: {},
      hash: '',
      name: 'index',
      meta: {},
    },
  },
  useHead: vi.fn(),
  useSeoMeta: vi.fn(),
  useRuntimeConfig: vi.fn(() => ({})),
}

// Mock Nuxt composables
global.useHead = vi.fn()
global.useSeoMeta = vi.fn()
global.definePageMeta = vi.fn()
global.defineNuxtConfig = vi.fn()
global.defineNuxtRouteMiddleware = vi.fn()
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    siteUrl: 'https://example.com',
  },
}))
global.useState = vi.fn((key, defaultValue) => ref(defaultValue))
global.useFetch = vi.fn(() => ({
  data: ref(null),
  pending: ref(false),
  error: ref(null),
  refresh: vi.fn(),
}))
global.useAsyncData = vi.fn(() => ({
  data: ref(null),
  pending: ref(false),
  error: ref(null),
  refresh: vi.fn(),
}))
global.navigateTo = vi.fn()
global.$fetch = vi.fn()

// Mock window.matchMedia
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

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

beforeAll(() => {
  // Global test setup
})

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks()
})

afterAll(() => {
  // Global cleanup
})
