// Centralized security configuration
// This file contains the unified security settings for the application

interface SecurityConfig {
  csp: {
    defaultSrc: string[]
    scriptSrc: string[]
    styleSrc: string[]
    imgSrc: string[]
    fontSrc: string[]
    connectSrc: string[]
    frameAncestors: string[]
    objectSrc: string[]
    baseUri: string[]
    formAction: string[]
  }
  additionalHeaders: {
    [key: string]: string
  }
}

// Define the security configuration
export const securityConfig: SecurityConfig = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'strict-dynamic'", 'https:'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    imgSrc: [
      "'self'",
      'data:', // Data URLs for images
      'blob:', // Blob URLs
      'https:', // External images
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com', // External fonts
    ],
    connectSrc: [
      "'self'",
      'https:', // API calls to HTTPS endpoints
    ],
    frameAncestors: ["'none'"], // Prevent embedding in iframes
    objectSrc: ["'none'"], // Prevent plugins like Flash
    baseUri: ["'self'"],
    formAction: ["'self'"],
  },
  additionalHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '0', // Modern CSP makes this redundant
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
}

// Function to generate CSP string with nonce
export function generateCsp(nonce?: string): string {
  let cspString = ''

  // Build CSP directives
  Object.entries(securityConfig.csp).forEach(([directive, sources]) => {
    if (sources.length > 0) {
      let sourceString = sources.join(' ')

      // Add nonce to script-src and style-src if provided
      if (nonce && (directive === 'scriptSrc' || directive === 'styleSrc')) {
        sourceString = `'nonce-${nonce}' ${sourceString}`
      }

      cspString += `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sourceString}; `
    }
  })

  // Add upgrade-insecure-requests directive
  cspString += 'upgrade-insecure-requests; '

  return cspString.trim()
}

// Function to get all security headers with optional nonce
export function getSecurityHeaders(nonce?: string): { [key: string]: string } {
  const headers: { [key: string]: string } = {
    ...securityConfig.additionalHeaders,
  }

  // Add CSP with nonce if provided
  if (nonce) {
    headers['Content-Security-Policy'] = generateCsp(nonce)
  } else {
    // Generate CSP without nonce
    headers['Content-Security-Policy'] = generateCsp()
  }

  return headers
}
