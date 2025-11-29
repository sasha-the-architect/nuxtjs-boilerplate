import { defineNitroPlugin } from 'nitropack/runtime'
import { randomBytes } from 'node:crypto'

// Comprehensive security headers plugin
export default defineNitroPlugin(nitroApp => {
  // Skip security headers in test environment to avoid conflicts during testing
  if (process.env.NODE_ENV === 'test') {
    return
  }

  // Apply security headers for all requests
  nitroApp.hooks.hook('afterResponse', (response, { event }) => {
    try {
      // Check if response object is available
      if (!event || !event.node || !event.node.res) {
        return
      }

      // Only apply security headers if not already set to avoid duplication
      if (
        event.node.res.hasHeader &&
        event.node.res.getHeader('Content-Security-Policy')
      ) {
        return // Headers already set in render:html hook
      }

      // Generate a unique nonce for each request
      const nonce = randomBytes(16).toString('base64')

      // Set Content Security Policy
      if (event.node.res.setHeader) {
        event.node.res.setHeader(
          'Content-Security-Policy',
          `default-src 'self'; ` +
            `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:; ` +
            `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; ` +
            `font-src 'self' https://fonts.gstatic.com; ` +
            `img-src 'self' data: blob: https:; ` +
            `connect-src 'self' https:; ` +
            `frame-ancestors 'none'; ` +
            `object-src 'none'; ` +
            `base-uri 'self'; ` +
            `form-action 'self'; ` +
            `upgrade-insecure-requests;`
        )

        // Additional security headers
        event.node.res.setHeader('X-Content-Type-Options', 'nosniff')
        event.node.res.setHeader('X-Frame-Options', 'DENY')
        event.node.res.setHeader('X-XSS-Protection', '0') // Modern CSP makes this redundant
        event.node.res.setHeader(
          'Referrer-Policy',
          'strict-origin-when-cross-origin'
        )
        // Add HSTS header for transport security
        event.node.res.setHeader(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains; preload'
        )
        event.node.res.setHeader(
          'Permissions-Policy',
          'geolocation=(), microphone=(), camera=()'
        )
        event.node.res.setHeader(
          'Access-Control-Allow-Methods',
          'GET, HEAD, POST, OPTIONS'
        )
        event.node.res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization'
        )
      }

      // Apply cache control headers based on route patterns
      const path = event.path || ''

      // For API routes, set appropriate cache control
      if (path.startsWith('/api/')) {
        if (
          event.node.res.setHeader &&
          (!event.node.res.hasHeader ||
            !event.node.res.getHeader('cache-control'))
        ) {
          event.node.res.setHeader(
            'cache-control',
            'max-age=300, public, s-maxage=300' // 5 minutes
          )
        }
      }
      // For static assets in _nuxt, set long cache control
      else if (path.includes('/_nuxt/')) {
        if (
          event.node.res.setHeader &&
          (!event.node.res.hasHeader ||
            !event.node.res.getHeader('cache-control'))
        ) {
          event.node.res.setHeader(
            'cache-control',
            'max-age=31536000, immutable' // 1 year
          )
        }
      }
      // For main routes, set moderate cache control
      else if (
        ['/', '/ai-keys', '/about', '/search', '/submit'].includes(path)
      ) {
        if (
          event.node.res.setHeader &&
          (!event.node.res.hasHeader ||
            !event.node.res.getHeader('cache-control'))
        ) {
          event.node.res.setHeader(
            'cache-control',
            'max-age=3600, s-maxage=3600, public' // 1 hour
          )
        }
      }
    } catch (error) {
      // In production, we might want to log this properly
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Failed to set security headers in afterResponse:', error)
      }
    }
  })
})
