import { defineNitroPlugin } from 'nitropack/runtime'
import { randomBytes } from 'node:crypto'

// Security headers plugin to enhance XSS protection and add HSTS

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Generate a unique nonce for each request to allow inline scripts/styles when needed
    const nonce = randomBytes(16).toString('base64')

    // Set Content Security Policy - more restrictive without 'unsafe-inline' and 'unsafe-eval'
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
    event.node.res.setHeader('X-XSS-Protection', '0') // Modern CSP makes this redundant, and legacy X-XSS-Protection can cause issues
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
    // Remove wildcard CORS to prevent security issues
    // event.node.res.setHeader('Access-Control-Allow-Origin', '*')
    event.node.res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, HEAD, POST, OPTIONS'
    )
    event.node.res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )

    // Add nonce to HTML if it's available
    if (html.body && nonce) {
      // Add the nonce to any inline scripts in the HTML
      // This is handled by Nuxt's built-in nonce support
    }
  })
})
