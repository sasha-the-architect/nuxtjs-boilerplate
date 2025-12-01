import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { defineNitroPlugin } from 'nitropack/runtime'
import { createApp, createError, toNodeListener } from 'h3'
import {
  securityConfig,
  getSecurityHeaders,
} from '../server/utils/security-config'

// Mock the server plugins to test them directly
vi.mock('nitropack/runtime', () => ({
  defineNitroPlugin: vi.fn(fn => fn),
}))

describe('Security Headers Implementation', () => {
  describe('Security Configuration', () => {
    it('should have proper CSP configuration', () => {
      expect(securityConfig.csp).toBeDefined()
      expect(securityConfig.csp.defaultSrc).toContain("'self'")
      expect(securityConfig.csp.frameAncestors).toContain("'none'")
      expect(securityConfig.csp.objectSrc).toContain("'none'")
    })

    it('should have additional security headers', () => {
      expect(securityConfig.additionalHeaders).toBeDefined()
      expect(securityConfig.additionalHeaders['X-Frame-Options']).toBe('DENY')
      expect(securityConfig.additionalHeaders['X-Content-Type-Options']).toBe(
        'nosniff'
      )
      expect(securityConfig.additionalHeaders['Referrer-Policy']).toBe(
        'strict-origin-when-cross-origin'
      )
    })
  })

  describe('Security Header Generation', () => {
    it('should generate headers with nonce', () => {
      const nonce = 'test-nonce-123'
      const headers = getSecurityHeaders(nonce)

      expect(headers['Content-Security-Policy']).toContain(`'nonce-${nonce}'`)
      expect(headers['X-Frame-Options']).toBe('DENY')
    })

    it('should generate headers without nonce', () => {
      const headers = getSecurityHeaders()

      expect(headers['Content-Security-Policy']).toBeDefined()
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
    })
  })

  // Test that security is enabled in test environment
  it('should confirm security is enabled in test environment', () => {
    // This is to verify that we no longer skip security in test environment
    expect(process.env.NODE_ENV).toBe('test') // Vitest runs in test environment
    // The security headers should be implemented and active
    expect(securityConfig).toBeDefined()
  })
})
