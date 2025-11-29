// Simple validation script to check that security implementation is syntactically correct
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (
  process.env.NODE_ENV !== 'production' ||
  process.env.VALIDATION_LOGS === 'true'
) {
  // eslint-disable-next-line no-console
  console.log('Validating security implementation...')
}

// Check if centralized sanitization import is in ResourceCard.vue (import from utils/sanitize)
const resourceCardPath = path.join(__dirname, 'components/ResourceCard.vue')
const resourceCardContent = fs.readFileSync(resourceCardPath, 'utf8')

// For centralized sanitization approach, we don't need direct DOMPurify import in ResourceCard.vue
// Instead, check that the centralized sanitization utility is being used
if (
  resourceCardContent.includes(
    "import { sanitizeAndHighlight } from '~/utils/sanitize'"
  ) ||
  resourceCardContent.includes('sanitizeAndHighlight')
) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✓ Centralized sanitization usage found in ResourceCard.vue')
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log(
      '✗ Centralized sanitization usage NOT found in ResourceCard.vue'
    )
  }
}

// Check if security headers plugin exists
const securityPluginPath = path.join(
  __dirname,
  'server/plugins/security-headers.ts'
)
if (fs.existsSync(securityPluginPath)) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✓ Security headers plugin exists')
  }
  const securityPluginContent = fs.readFileSync(securityPluginPath, 'utf8')
  if (securityPluginContent.includes('Content-Security-Policy')) {
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.VALIDATION_LOGS === 'true'
    ) {
      // eslint-disable-next-line no-console
      console.log('✓ CSP header configuration found in security headers plugin')
    }
  } else {
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.VALIDATION_LOGS === 'true'
    ) {
      // eslint-disable-next-line no-console
      console.log(
        '✗ CSP header configuration NOT found in security headers plugin'
      )
    }
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✗ Security headers plugin does NOT exist')
  }
}

// Check if security headers are in nuxt.config.ts
const nuxtConfigPath = path.join(__dirname, 'nuxt.config.ts')
const nuxtConfigContent = fs.readFileSync(nuxtConfigPath, 'utf8')

if (nuxtConfigContent.includes('Content-Security-Policy')) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✓ CSP header configuration found in nuxt.config.ts')
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✗ CSP header configuration NOT found in nuxt.config.ts')
  }
}

if (nuxtConfigContent.includes('X-Content-Type-Options')) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✓ Security headers configuration found in nuxt.config.ts')
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✗ Security headers configuration NOT found in nuxt.config.ts')
  }
}

if (
  process.env.NODE_ENV !== 'production' ||
  process.env.VALIDATION_LOGS === 'true'
) {
  // eslint-disable-next-line no-console
  console.log('Validating security implementation...')
}
