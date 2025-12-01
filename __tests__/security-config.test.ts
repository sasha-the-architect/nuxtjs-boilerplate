import { describe, it, expect } from 'vitest'
import {
  getSecurityHeaders,
  generateCsp,
  securityConfig,
} from '../server/utils/security-config'

describe('Security Configuration', () => {
  describe('CSP Generation', () => {
    it('should generate CSP without nonce when no nonce is provided', () => {
      const csp = generateCsp()
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("script-src 'self' 'strict-dynamic' https:")
      expect(csp).toContain(
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
      )
      expect(csp).not.toContain('nonce-')
    })

    it('should generate CSP with nonce when nonce is provided', () => {
      const nonce = 'test-nonce-123'
      const csp = generateCsp(nonce)

      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain(
        `script-src 'nonce-${nonce}' 'self' 'strict-dynamic' https:`
      )
      expect(csp).toContain(
        `style-src 'nonce-${nonce}' 'self' 'unsafe-inline' https://fonts.googleapis.com`
      )
      expect(csp).toContain(`nonce-${nonce}`)
    })

    it('should include all required CSP directives', () => {
      const csp = generateCsp()

      expect(csp).toContain('default-src')
      expect(csp).toContain('script-src')
      expect(csp).toContain('style-src')
      expect(csp).toContain('img-src')
      expect(csp).toContain('font-src')
      expect(csp).toContain('connect-src')
      expect(csp).toContain('frame-ancestors')
      expect(csp).toContain('object-src')
      expect(csp).toContain('base-uri')
      expect(csp).toContain('form-action')
      expect(csp).toContain('upgrade-insecure-requests')
    })
  })

  describe('Security Headers', () => {
    it('should return all additional security headers without nonce', () => {
      const headers = getSecurityHeaders()

      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-XSS-Protection']).toBe('0')
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
      expect(headers['Strict-Transport-Security']).toBe(
        'max-age=31536000; includeSubDomains; preload'
      )
      expect(headers['Permissions-Policy']).toBe(
        'geolocation=(), microphone=(), camera=()'
      )
      expect(headers['Access-Control-Allow-Methods']).toBe(
        'GET, HEAD, POST, OPTIONS'
      )
      expect(headers['Access-Control-Allow-Headers']).toBe(
        'Content-Type, Authorization'
      )
      expect(headers['Content-Security-Policy']).toBeDefined()
    })

    it('should return all security headers with nonce when provided', () => {
      const nonce = 'test-nonce-456'
      const headers = getSecurityHeaders(nonce)

      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-XSS-Protection']).toBe('0')
      expect(headers['Content-Security-Policy']).toContain(`nonce-${nonce}`)
    })
  })

  describe('Security Config Structure', () => {
    it('should have the correct CSP structure', () => {
      expect(securityConfig.csp).toHaveProperty('defaultSrc')
      expect(securityConfig.csp).toHaveProperty('scriptSrc')
      expect(securityConfig.csp).toHaveProperty('styleSrc')
      expect(securityConfig.csp).toHaveProperty('imgSrc')
      expect(securityConfig.csp).toHaveProperty('fontSrc')
      expect(securityConfig.csp).toHaveProperty('connectSrc')
      expect(securityConfig.csp).toHaveProperty('frameAncestors')
      expect(securityConfig.csp).toHaveProperty('objectSrc')
      expect(securityConfig.csp).toHaveProperty('baseUri')
      expect(securityConfig.csp).toHaveProperty('formAction')
    })

    it('should have additional security headers', () => {
      expect(securityConfig.additionalHeaders).toHaveProperty(
        'X-Content-Type-Options'
      )
      expect(securityConfig.additionalHeaders).toHaveProperty('X-Frame-Options')
      expect(securityConfig.additionalHeaders).toHaveProperty(
        'X-XSS-Protection'
      )
      expect(securityConfig.additionalHeaders).toHaveProperty('Referrer-Policy')
      expect(securityConfig.additionalHeaders).toHaveProperty(
        'Strict-Transport-Security'
      )
      expect(securityConfig.additionalHeaders).toHaveProperty(
        'Permissions-Policy'
      )
      expect(securityConfig.additionalHeaders).toHaveProperty(
        'Access-Control-Allow-Methods'
      )
      expect(securityConfig.additionalHeaders).toHaveProperty(
        'Access-Control-Allow-Headers'
      )
    })
  })
})
