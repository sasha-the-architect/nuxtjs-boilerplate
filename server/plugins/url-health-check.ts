import { defineNitroPlugin } from 'nitropack/runtime'
import { validateUrlWithRetry } from '~/utils/urlValidation'
import { Resource } from '~/types/resource'

// Track the last validation time to avoid running too frequently
let lastValidationRun: Date | null = null

export default defineNitroPlugin((nitroApp: any) => {
  console.log('URL Health Check plugin initialized')
  
  // Function to validate all resources periodically
  const validateAllResources = async () => {
    try {
      console.log('Starting URL health validation...')
      const startTime = Date.now()
      
      // Import resources from JSON
      const resourcesModule = await import('~/data/resources.json')
      let resources: Resource[] = resourcesModule.default || resourcesModule
      
      console.log(`Validating ${resources.length} resources...`)
      
      // Update each resource with health information
      const updatedResources = await Promise.all(
        resources.map(async (resource: Resource) => {
          const healthResult = await validateUrlWithRetry(resource.url)
          
          return {
            ...resource,
            lastChecked: new Date().toISOString(),
            statusCode: healthResult.statusCode,
            isHealthy: healthResult.isHealthy,
            responseTime: healthResult.responseTime,
            healthCheckError: healthResult.error,
          }
        })
      )
      
      // For now, we'll just log the results
      // In a real implementation, you might save this to a database or file
      const healthyCount = updatedResources.filter((r: Resource) => r.isHealthy).length
      const unhealthyCount = updatedResources.length - healthyCount
      
      console.log(`Health check completed in ${Date.now() - startTime}ms`)
      console.log(`Healthy: ${healthyCount}, Unhealthy: ${unhealthyCount}`)
      
      // Update the last validation run time
      lastValidationRun = new Date()
      
      return {
        total: updatedResources.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount,
        lastRun: lastValidationRun,
      }
    } catch (error) {
      console.error('Error during URL health validation:', error)
      return null
    }
  }
  
  // Schedule validation to run periodically
  // For now, we'll run it once at startup and then every hour
  setTimeout(async () => {
    await validateAllResources()
  }, 5000) // Run 5 seconds after server starts
  
  // Run every hour (3600000 ms)
  setInterval(async () => {
    await validateAllResources()
  }, 3600000)
  
  // Also expose the validation function for manual triggering via API
  nitroApp.$validateAllResources = validateAllResources
})
      )

      // For now, we'll just log the results
      // In a real implementation, you might save this to a database or file
      const healthyCount = updatedResources.filter(r => r.isHealthy).length
      const unhealthyCount = updatedResources.length - healthyCount

      console.log(`Health check completed in ${Date.now() - startTime}ms`)
      console.log(`Healthy: ${healthyCount}, Unhealthy: ${unhealthyCount}`)

      // Update the last validation run time
      lastValidationRun = new Date()

      return {
        total: updatedResources.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount,
        lastRun: lastValidationRun,
      }
    } catch (error) {
      console.error('Error during URL health validation:', error)
      return null
    }
  }

  // Schedule validation to run periodically
  // For now, we'll run it once at startup and then every hour
  setTimeout(async () => {
    await validateAllResources()
  }, 5000) // Run 5 seconds after server starts

  // Run every hour (3600000 ms)
  setInterval(async () => {
    await validateAllResources()
  }, 3600000)

  // Also expose the validation function for manual triggering via API
  nitroApp.$validateAllResources = validateAllResources
})
