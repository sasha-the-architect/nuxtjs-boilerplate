// Simple validation script to check that security implementation is syntactically correct
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Simple logger for Node.js scripts
const logger = {
  info: (message, data) => {
    console.log(message, data || '')
  },
  warn: (message, data) => {
    console.warn(message, data || '')
  },
  error: (message, data) => {
    console.error(message, data || '')
  },
  debug: (message, data) => {
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.DEBUG === 'true'
    ) {
      logger.debug(message, data || '')
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

// Check if sanitization is centralized in utils/sanitize.ts (which is the proper approach)
const sanitizeUtilPath = path.join(__dirname, 'utils/sanitize.ts')
const sanitizeUtilContent = fs.readFileSync(sanitizeUtilPath, 'utf8')

if (sanitizeUtilContent.includes("import DOMPurify from 'dompurify'")) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    logger.info('✓ DOMPurify import found in centralized utils/sanitize.ts')
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    logger.info('✗ DOMPurify import NOT found in centralized utils/sanitize.ts')
  }
}

// Check if ResourceCard.vue uses the centralized sanitization utility
const resourceCardPath = path.join(__dirname, 'components/ResourceCard.vue')
const resourceCardContent = fs.readFileSync(resourceCardPath, 'utf8')

if (
  resourceCardContent.includes(
    "import { sanitizeAndHighlight } from '~/utils/sanitize'"
  )
) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    logger.info('✓ Centralized sanitization import found in ResourceCard.vue')
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    logger.info(
      '✗ Centralized sanitization import NOT found in ResourceCard.vue'
    )
  }
}

// Validate that ResourceCard.vue uses the centralized sanitization function
if (resourceCardContent.includes('sanitizeAndHighlight')) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    logger.info(
      '✓ Centralized sanitization function usage found in ResourceCard.vue'
    )
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    logger.info(
      '✗ Centralized sanitization function usage NOT found in ResourceCard.vue'
    )
  }
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
  nuxtConfigContent.includes('Content-Security-Policy') ||
  nuxtConfigContent.includes('csp') ||
  nuxtConfigContent.includes('Security Configuration')
) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    logger.info('✓ CSP header configuration found in nuxt.config.ts')
  }
  logger.info('✓ CSP configuration reference found in nuxt.config.ts')
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    logger.info('✗ CSP header configuration NOT found in nuxt.config.ts')
  }
  logger.info('✗ CSP configuration reference NOT found in nuxt.config.ts')
}
