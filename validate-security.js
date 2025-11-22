// Simple validation script to check that security implementation is syntactically correct
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('Validating security implementation...')

// Check if DOMPurify import is in ResourceCard.vue
const resourceCardPath = path.join(__dirname, 'components/ResourceCard.vue')
const resourceCardContent = fs.readFileSync(resourceCardPath, 'utf8')

if (resourceCardContent.includes("import DOMPurify from 'dompurify'")) {
  console.log('✓ DOMPurify import found in ResourceCard.vue')
} else {
  console.log('✗ DOMPurify import NOT found in ResourceCard.vue')
}

if (resourceCardContent.includes('DOMPurify.sanitize')) {
  console.log('✓ DOMPurify.sanitize usage found in ResourceCard.vue')
} else {
  console.log('✗ DOMPurify.sanitize usage NOT found in ResourceCard.vue')
}

// Check if security middleware exists
const middlewarePath = path.join(__dirname, 'server/middleware/security.ts')
if (fs.existsSync(middlewarePath)) {
  console.log('✓ Security middleware file exists')
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
  if (middlewareContent.includes('Content-Security-Policy')) {
    console.log('✓ CSP header configuration found in security middleware')
  } else {
    console.log('✗ CSP header configuration NOT found in security middleware')
  }
} else {
  console.log('✗ Security middleware file does NOT exist')
}

// Check if security headers are in nuxt.config.ts
const nuxtConfigPath = path.join(__dirname, 'nuxt.config.ts')
const nuxtConfigContent = fs.readFileSync(nuxtConfigPath, 'utf8')

if (nuxtConfigContent.includes('Content-Security-Policy')) {
  console.log('✓ CSP header configuration found in nuxt.config.ts')
} else {
  console.log('✗ CSP header configuration NOT found in nuxt.config.ts')
}

if (nuxtConfigContent.includes('X-Content-Type-Options')) {
  console.log('✓ Security headers configuration found in nuxt.config.ts')
} else {
  console.log('✗ Security headers configuration NOT found in nuxt.config.ts')
}

console.log('Validation complete.')
