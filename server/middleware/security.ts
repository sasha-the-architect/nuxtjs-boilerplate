import { defineEventHandler } from 'h3'
import { randomBytes } from 'node:crypto'

export default defineEventHandler(event => {
  // Generate a unique nonce for each request to allow inline scripts/styles when needed
  const nonce = randomBytes(16).toString('base64')

  // Set security headers
  event.node.res.setHeader('X-Content-Type-Options', 'nosniff')
  event.node.res.setHeader('X-Frame-Options', 'DENY')
  event.node.res.setHeader('X-XSS-Protection', '0') // Modern CSP makes this redundant
  event.node.res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  event.node.res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )

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
})
