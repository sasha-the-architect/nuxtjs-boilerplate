// Minimal test setup file for Vitest - avoids interfering with Nuxt environment
import { vi } from 'vitest'

// Mock DOMPurify
vi.mock('dompurify', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: {
      sanitize: html => {
        // Basic sanitization for testing - just return the input for now
        // In real tests you'd want proper sanitization
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
      },
    },
  }
})

// Only set process.env.NODE_ENV if it's not already set by Nuxt
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test'
}
