// Simple validation script to check that security implementation is syntactically correct
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Simple logger for Node.js scripts
const logger = {
  info: (message, data) => {
    logger.info('Validating security implementation...')
  },
  warn: (message, data) => {
    logger.info('Validating security implementation...')
  },
  error: (message, data) => {
    console.error(message, data || '')
  },
  debug: (message, data) => {
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.DEBUG === 'true'
    ) {
      console.debug(message, data || '')
    }
  },
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (
  process.env.NODE_ENV !== 'production' ||
  process.env.VALIDATION_LOGS === 'true'
) {
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
  logger.info('✓ Centralized sanitization usage found in ResourceCard.vue')
} else {
  logger.info('✗ Centralized sanitization usage NOT found in ResourceCard.vue')
}

// Check if security headers plugin exists
const securityPluginPath = path.join(
  __dirname,
  'server/plugins/security-headers.ts'
)
if (fs.existsSync(securityPluginPath)) {
  logger.info('✓ Security headers plugin exists')
  const securityPluginContent = fs.readFileSync(securityPluginPath, 'utf8')
  if (securityPluginContent.includes('getSecurityHeaders')) {
    logger.info(
      '✓ CSP header configuration found in security headers plugin (using centralized config)'
    )
  } else if (securityPluginContent.includes('Content-Security-Policy')) {
    logger.info('✓ CSP header configuration found in security headers plugin')
  } else {
    logger.info(
      '✗ CSP header configuration NOT found in security headers plugin'
    )
  }
} else {
  logger.info('✗ Security headers plugin does NOT exist')
}

// Check if security config file exists
const securityConfigPath = path.join(
  __dirname,
  'server/utils/security-config.ts'
)
if (fs.existsSync(securityConfigPath)) {
  logger.info('✓ Security configuration file exists')
  const securityConfigContent = fs.readFileSync(securityConfigPath, 'utf8')
  if (securityConfigContent.includes('Content-Security-Policy')) {
    logger.info('✓ CSP configuration found in security config file')
  } else {
    logger.info('✗ CSP configuration NOT found in security config file')
  }
} else {
  logger.info('✗ Security configuration file does NOT exist')
}

// Check if security headers are in nuxt.config.ts - specifically looking for security configuration
const nuxtConfigPath = path.join(__dirname, 'nuxt.config.ts')
const nuxtConfigContent = fs.readFileSync(nuxtConfigPath, 'utf8')

if (
  nuxtConfigContent.includes('Security Configuration') &&
  nuxtConfigContent.includes('security-headers.ts')
) {
  logger.info('✓ CSP configuration reference found in nuxt.config.ts')
} else {
  logger.info('✗ CSP configuration reference NOT found in nuxt.config.ts')
}

if (
  nuxtConfigContent.includes('Security Configuration') &&
  nuxtConfigContent.includes('server plugin')
) {
  logger.info(
    '✓ Security headers configuration reference found in nuxt.config.ts'
  )
} else {
  logger.info(
    '✗ Security headers configuration reference NOT found in nuxt.config.ts'
  )
}

if (
  process.env.NODE_ENV !== 'production' ||
  process.env.VALIDATION_LOGS === 'true'
) {
  console.log('Validating security implementation...')
}
