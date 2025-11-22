import { defineNitroPlugin, setResponseHeader } from 'nitropack/runtime'

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Set Content Security Policy
    setResponseHeader(
      event,
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
    )

    // Additional security headers
    setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
    setResponseHeader(event, 'X-Frame-Options', 'DENY')
    setResponseHeader(event, 'X-XSS-Protection', '1; mode=block')
    setResponseHeader(
      event,
      'Referrer-Policy',
      'strict-origin-when-cross-origin'
    )
    setResponseHeader(
      event,
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    )
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
    setResponseHeader(
      event,
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    setResponseHeader(
      event,
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )
  })
})
