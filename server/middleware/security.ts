import { defineEventHandler } from 'h3'

export default defineEventHandler(event => {
  // Set security headers
  event.node.res.setHeader('X-Content-Type-Options', 'nosniff')
  event.node.res.setHeader('X-Frame-Options', 'DENY')
  event.node.res.setHeader('X-XSS-Protection', '1; mode=block')
  event.node.res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  event.node.res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )

  // Set Content Security Policy
  // Note: We need to allow 'unsafe-inline' for styles because Nuxt generates inline styles
  // In production, consider using a nonce-based approach for better security
  event.node.res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none'; " +
      "object-src 'none'; " +
      "base-uri 'self';"
  )
})
