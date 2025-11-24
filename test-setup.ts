import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { config } from '@vue/test-utils'
import { ref, computed, onUnmounted } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'

// Create a mock router for testing
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'index', component: { template: '<div />' } },
    { path: '/search', name: 'search', component: { template: '<div />' } },
    { path: '/about', name: 'about', component: { template: '<div />' } },
    { path: '/submit', name: 'submit', component: { template: '<div />' } },
  ],
})

// Mock vue-router composables specifically for Nuxt
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => ({
      path: '/',
      query: {},
      params: {},
      hash: '',
      name: 'index',
      meta: {},
    }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      currentRoute: ref({
        path: '/',
        query: {},
        params: {},
        hash: '',
        name: 'index',
        meta: {},
      }),
    }),
  }
})

// Mock the unhead/vue module specifically for useHead
vi.mock('@unhead/vue', async () => {
  const actual = await vi.importActual('@unhead/vue')
  return {
    ...actual,
    useHead: vi.fn(),
    useSeoMeta: vi.fn(),
  }
})

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
  useHead: vi.fn(() => ({})),
  useSeoMeta: vi.fn(() => ({})),
  useRuntimeConfig: vi.fn(() => ({})),
}

// Mock Nuxt composables with proper context
const mockHead = {
  push: vi.fn(),
  addHeadObjs: vi.fn(),
  removeHeadObjs: vi.fn(),
  updateDOM: vi.fn(),
}

global.useHead = vi.fn(() => ({}))
global.useSeoMeta = vi.fn(() => ({}))
global.definePageMeta = vi.fn()
global.defineNuxtConfig = vi.fn()
global.defineNuxtRouteMiddleware = vi.fn()
global.useRuntimeConfig = vi.fn(() => ({}))
global.useState = vi.fn((key, defaultValue) => ref(defaultValue))

// Provide usehead injection
global.provide = vi.fn((key: string, value: any) => {
  if (key === 'usehead') {
    return mockHead
  }
})
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

// Mock OptimizedImage and NuxtImg components
config.global.components = {
  ...config.global.components,
  OptimizedImage: {
    name: 'OptimizedImage',
    props: {
      src: { type: String, required: true },
      alt: { type: String, required: true },
      width: { type: [Number, String] },
      height: { type: [Number, String] },
      format: String,
      loading: String,
      sizes: String,
      quality: [Number, String],
      imgClass: String,
      provider: String,
    },
    template:
      '<img :src="src" :alt="alt" :width="width" :height="height" :class="imgClass" />',
  },
  NuxtImg: {
    name: 'NuxtImg',
    props: {
      src: { type: String, required: true },
      alt: { type: String, required: true },
      width: { type: [Number, String] },
      height: { type: [Number, String] },
      format: String,
      loading: String,
      sizes: String,
      quality: [Number, String],
      class: String,
      provider: String,
    },
    template:
      '<img :src="src" :alt="alt" :width="width" :height="height" :class="class" />',
  },
  OptimizedImage: {
    name: 'OptimizedImage',
    props: [
      'src',
      'alt',
      'width',
      'height',
      'format',
      'loading',
      'sizes',
      'quality',
      'imgClass',
      'provider',
    ],
    template:
      '<img :src="src" :alt="alt" :width="width" :height="height" :class="imgClass" />',
    emits: ['load', 'error'],
  },
  NuxtLink: {
    name: 'NuxtLink',
    props: ['to', 'href', 'rel', 'target'],
    template: '<a :href="to || href" :rel="rel" :target="target"><slot /></a>',
  },
}

global.useRoute = () => ({
  path: '/',
  query: {},
  params: {},
  hash: '',
  name: 'index',
  meta: {},
})
global.useRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
})

// Mock Nuxt components
config.global.stubs = {
  ...config.global.stubs,
}

// Make Vue Composition API functions globally available
global.Ref = ref
global.ComputedRef = computed
global.ComputedGetters = {}
global.ComputedSetters = {}

// Mock navigator.onLine for offline detection
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  configurable: true,
  value: true, // Default to online, tests can change this as needed
})

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
  // Set test environment
  process.env.NODE_ENV = 'test'
})

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks()
})

afterAll(() => {
  // Global cleanup
})
