/**
 * Resource Validation Plugin
 * Initializes and manages scheduled validation of resource URLs
 */

import { defineNitroPlugin } from 'nitropack'
import { updateAllResourceHealth } from '../utils/resourceHealth'

export default defineNitroPlugin(async nitroApp => {
  console.log('Initializing resource validation system...')

  // Function to validate all resources
  const validateAllResources = async () => {
    try {
      // Import resources from JSON
      const resourcesModule = await import('~/data/resources.json')
      const resources = resourcesModule.default || resourcesModule

      if (Array.isArray(resources) && resources.length > 0) {
        console.log(`Validating ${resources.length} resources...`)
        await updateAllResourceHealth(resources)
        console.log('Resource validation completed.')
      } else {
        console.warn('No resources found to validate.')
      }
    } catch (error) {
      console.error('Error during resource validation:', error)
    }
  }

  // Run initial validation when the plugin initializes
  await validateAllResources()

  // Set up periodic validation (every hour)
  const validationInterval = setInterval(
    async () => {
      console.log('Starting scheduled resource validation...')
      await validateAllResources()
    },
    60 * 60 * 1000
  ) // 1 hour in milliseconds

  // Also run validation on server start after a short delay
  setTimeout(async () => {
    await validateAllResources()
  }, 5000) // 5 seconds delay to allow server to fully start

  // Store the validation interval in nitroApp for potential cleanup
  nitroApp._resourceValidationInterval = validationInterval

  // Add cleanup handler to clear interval on shutdown
  process.on('SIGTERM', () => {
    console.log('Shutting down resource validation...')
    if (nitroApp._resourceValidationInterval) {
      clearInterval(nitroApp._resourceValidationInterval)
    }
  })

  process.on('SIGINT', () => {
    console.log('Shutting down resource validation...')
    if (nitroApp._resourceValidationInterval) {
      clearInterval(nitroApp._resourceValidationInterval)
    }
  })
})
