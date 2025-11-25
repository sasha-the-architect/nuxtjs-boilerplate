// Minimal test setup file for Vitest
import { vi, expect } from 'vitest'

// Mock DOMPurify
vi.mock('dompurify', () => {
  return {
    default: {
      sanitize: (html: string) => {
        // Basic sanitization for testing
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
      },
    },
  }
})

// Mock process for Node environment
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

// Mock fetch API if needed
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
  })
) as any

// Mock localStorage if needed
Object.defineProperty(window || global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
})
