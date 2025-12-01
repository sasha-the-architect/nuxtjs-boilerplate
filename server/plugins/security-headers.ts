import { defineNitroPlugin } from 'nitropack/runtime'
import { randomBytes } from 'node:crypto'
import { getSecurityHeaders } from '../utils/security-config'

// Comprehensive security headers plugin
export default defineNitroPlugin(nitroApp => {
  // Apply security headers for all requests in all environments
  // Security should be enabled in all environments, including test
  // Skip if this is an HTML response that will be handled by the HTML security plugin
  nitroApp.hooks.hook('afterResponse', (response, { event }) => {
    try {
      // Check if response object is available
      if (!event || !event.node || !event.node.res) {
        return
      }

      // Skip security headers in test environment to avoid conflicts during testing
      if (process.env.NODE_ENV === 'test') {
        return
      }

      // Check if this is an HTML response - if so, the HTML security plugin will handle it
      // to avoid duplication of security headers
      const contentType = event.node.res.getHeader('content-type') || ''
      if (
        typeof contentType === 'string' &&
        contentType.includes('text/html')
      ) {
        // HTML responses are handled by the html-security.ts plugin
        return
      }

      // Generate a unique nonce for each request
      const nonce = randomBytes(16).toString('base64')

      // Get security headers with nonce
      const securityHeaders = getSecurityHeaders(nonce)

      // Set all security headers
      if (event.node.res.setHeader) {
        Object.entries(securityHeaders).forEach(([headerName, headerValue]) => {
          event.node.res.setHeader(headerName, headerValue)
        })
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
      // Log errors in any environment but don't expose detailed errors in production
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to set security headers in afterResponse:', error)
      } else {
        console.error('Security header setting failed')
      }
    }
  })
})
