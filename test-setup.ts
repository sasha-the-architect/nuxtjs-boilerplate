import { vi } from 'vitest'

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

vi.mock('vue', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    getCurrentInstance: vi.fn(),
  }
})

if (typeof global !== 'undefined') {
  if (typeof global.window === 'undefined') {
    global.window = {
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
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      sessionStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      location: {
        href: 'http://localhost',
      },
      navigator: {
        userAgent: 'test-agent',
      },
    }
  }
}
