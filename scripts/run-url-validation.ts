/**
 * URL Validation Script
 * This script validates all URLs in the resources file and updates their health status
 */

import { validateUrlWithRetry } from '../utils/urlValidation'
// We'll import Resource type directly by defining it here to avoid module resolution issues
interface Resource {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: readonly string[]
  technology: readonly string[]
  dateAdded: string
  popularity: number
  icon?: string
  // URL health tracking fields
  lastChecked?: string
  statusCode?: number
  isHealthy?: boolean
  responseTime?: number
  healthCheckError?: string
}

async function runUrlValidation() {
  console.log('Starting URL validation process...')

  try {
    // Import resources from JSON
    const resourcesModule = await import('../data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    console.log(`Validating ${resources.length} resources...`)

    // Update each resource with health information
    const updatedResources = await Promise.all(
      resources.map(async (resource: Resource) => {
        console.log(`Validating: ${resource.title} (${resource.url})`)

        const healthResult = await validateUrlWithRetry(resource.url)

        const updatedResource = {
          ...resource,
          lastChecked: new Date().toISOString(),
          statusCode: healthResult.statusCode,
          isHealthy: healthResult.isHealthy,
          responseTime: healthResult.responseTime,
          healthCheckError: healthResult.error,
        }

        console.log(
          `  Status: ${healthResult.isHealthy ? '✅ Healthy' : '❌ Unhealthy'} (${healthResult.statusCode || 'N/A'}) - ${healthResult.responseTime}ms`
        )

        return updatedResource
      })
    )

    // Calculate summary
    const healthyCount = updatedResources.filter(r => r.isHealthy).length
    const unhealthyCount = updatedResources.filter(
      r => r.isHealthy === false
    ).length
    const unknownCount = updatedResources.filter(
      r => r.isHealthy === undefined
    ).length

    console.log('\nValidation Summary:')
    console.log(`Total: ${updatedResources.length}`)
    console.log(`Healthy: ${healthyCount}`)
    console.log(`Unhealthy: ${unhealthyCount}`)
    console.log(`Unknown: ${unknownCount}`)

    // Write the updated resources back to the data file
    // For now, we'll just log the results
    // In a real implementation, you might save this to a database or updated JSON file

    console.log('\nValidation completed successfully!')

    return {
      total: updatedResources.length,
      healthy: healthyCount,
      unhealthy: unhealthyCount,
      unknown: unknownCount,
      resources: updatedResources,
    }
  } catch (error) {
    console.error('Error during URL validation:', error)
    throw error
  }
}

// Run the validation if this script is executed directly
const isMain = import.meta.url.endsWith(
  process.argv[1]?.replace('file://', '') || ''
)
if (isMain) {
  runUrlValidation()
    .then(() => {
      console.log('URL validation script completed.')
      process.exit(0)
    })
    .catch(error => {
      console.error('URL validation script failed:', error)
      process.exit(1)
    })
}
