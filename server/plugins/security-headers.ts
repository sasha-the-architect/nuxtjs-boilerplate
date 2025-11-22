import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Set Content Security Policy
    event.node.res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
    )

    // Additional security headers
    event.node.res.setHeader('X-Content-Type-Options', 'nosniff')
    event.node.res.setHeader('X-Frame-Options', 'DENY')
    event.node.res.setHeader('X-XSS-Protection', '1; mode=block')
    event.node.res.setHeader(
      'Referrer-Policy',
      'strict-origin-when-cross-origin'
    )
    event.node.res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    )
    event.node.res.setHeader('Access-Control-Allow-Origin', '*')
    event.node.res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    event.node.res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )
  })
})
