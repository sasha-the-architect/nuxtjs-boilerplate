import { defineNitroPlugin } from 'nitropack/runtime'
import { randomBytes } from 'node:crypto'
import { getSecurityHeaders } from '../utils/security-config'

// HTML Security Plugin - handles security headers for HTML responses
// This plugin coordinates with the API response security to prevent duplication
export default defineNitroPlugin(nitroApp => {
  // Hook into the HTML rendering process to add security headers for HTML responses
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    try {
      // Check if response object is available
      if (!event || !event.node || !event.node.res) {
        return
      }

      // Generate a unique nonce for this request
      const nonce = randomBytes(16).toString('base64')

      // Get security headers with nonce
      const securityHeaders = getSecurityHeaders(nonce)

      // Set security headers for this response
      if (event.node.res.setHeader) {
        Object.entries(securityHeaders).forEach(([headerName, headerValue]) => {
          event.node.res.setHeader(headerName, headerValue)
        })
      }

      // Add nonce to script and style tags in the HTML if needed
      // This is handled by Nuxt's built-in nonce support when configured properly
    } catch (error) {
      // Log errors but don't expose detailed errors in production
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to set security headers in render:html:', error)
      } else {
        console.error('HTML security header setting failed')
      }
    }
  })
})
