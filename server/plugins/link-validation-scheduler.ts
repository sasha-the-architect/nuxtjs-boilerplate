import { defineNitroPlugin } from 'nitropack/runtime'
import { updateLinkHealth } from '../utils/linkValidator'
import { Resource } from '~/types/resource'

// Simple in-memory scheduler for link validation
// In production, you'd want to use a more robust solution like cron jobs or task queues

// Simple in-memory scheduler for link validation
// In production, you'd want to use a more robust solution like cron jobs or task queues

let isInitialized = false
let validationInterval: any = null

// Check if validation should run based on environment
const shouldRunValidation = process.env.LINK_VALIDATION_ENABLED !== 'false'

export default defineNitroPlugin(() => {
  if (isInitialized || !shouldRunValidation) {
    return
  }

  console.log('Link validation scheduler initialized')

  // Run validation every 24 hours (or as configured)
  const validationIntervalMs = parseInt(
    process.env.LINK_VALIDATION_INTERVAL || '86400000'
  ) // 24 hours in ms

  validationInterval = setInterval(async () => {
    console.log('Starting scheduled link validation...')
    try {
      await runLinkValidation()
      console.log('Link validation completed')
    } catch (error) {
      console.error('Error during scheduled link validation:', error)
    }
  }, validationIntervalMs)

  // Also run validation once when the server starts (with a delay)
  setTimeout(async () => {
    try {
      await runLinkValidation()
      console.log('Initial link validation completed')
    } catch (error) {
      console.error('Error during initial link validation:', error)
    }
  }, 30000) // 30 seconds after startup

  isInitialized = true

  // Clean up on shutdown
  process.on('SIGINT', () => {
    if (validationInterval) {
      clearInterval(validationInterval)
    }
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    if (validationInterval) {
      clearInterval(validationInterval)
    }
    process.exit(0)
  })
})

/**
 * Runs link validation for all resources
 */
async function runLinkValidation() {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    console.log(`Validating ${resources.length} resource links...`)

    // Validate each resource URL
    for (const resource of resources) {
      try {
        // Update link health for this resource
        const linkHealth = await updateLinkHealth(resource.url)

        // Note: In a real implementation, you would save this back to a database
        // For this implementation with JSON data, we'd need to implement persistence differently
        console.log(`Validated ${resource.title}: ${linkHealth.status}`)
      } catch (error) {
        console.error(`Error validating ${resource.title}:`, error)
      }
    }
  } catch (error) {
    console.error('Error running link validation:', error)
    throw error
  }
}
