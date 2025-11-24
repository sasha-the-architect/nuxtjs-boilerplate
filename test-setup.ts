import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { config } from '@vue/test-utils'
import { ref, computed, onUnmounted } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'

// Mock @unhead/vue before any components are imported
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(() => {}),
  useSeoMeta: vi.fn(),
  useHeadSafe: vi.fn(() => {}),
}))

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
  useSeoMeta: vi.fn(),
  useRuntimeConfig: vi.fn(() => ({})),
  useState: (key: string, defaultValue: any) => ref(defaultValue),
  useFetch: () => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  }),
  useAsyncData: () => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  }),
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
  }),
  definePageMeta: vi.fn(),
  defineNuxtConfig: vi.fn(),
  defineNuxtRouteMiddleware: vi.fn(),
  useHead: vi.fn(() => {}),
  useHeadSafe: vi.fn(() => {}),
}

// Mock OptimizedImage component
config.global.components = {
  ...config.global.components,
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
    render() {
      return {
        type: 'img',
        props: {
          src: this.src,
          alt: this.alt,
          width: this.width,
          height: this.height,
          class: this.imgClass,
        },
      }
    },
  },
  NuxtImg: {
    name: 'NuxtImg',
    props: [
      'src',
      'alt',
      'width',
      'height',
      'format',
      'loading',
      'sizes',
      'quality',
      'class',
      'provider',
    ],
    render() {
      return {
        type: 'img',
        props: {
          src: this.src,
          alt: this.alt,
          width: this.width,
          height: this.height,
          class: this.class,
        },
        on: {
          load: this.$emit.bind(this, 'load'),
          error: this.$emit.bind(this, 'error'),
        },
      }
    },
    emits: ['load', 'error'],
  },
}

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
