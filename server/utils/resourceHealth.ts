/**
 * Resource Health Tracking System
 * Tracks the health status of resources over time
 */

import { Resource } from '~/types/resource'
import {
  validateUrl,
  validateUrls,
  UrlValidationResult,
} from '~/utils/urlValidation'

interface ResourceHealthStatus {
  id: string
  url: string
  isHealthy: boolean
  lastChecked: string
  lastStatus: number | null
  lastStatusText: string | null
  responseTime: number | null
  error?: string
  validationHistory: UrlValidationResult[]
}

// In-memory storage for validation results (in production, this would be a database)
const resourceHealthMap = new Map<string, ResourceHealthStatus>()

/**
 * Updates the health status of a single resource
 */
export async function updateResourceHealth(
  resource: Resource
): Promise<ResourceHealthStatus> {
  const validationResult = await validateUrl(resource.url)

  // Get existing health status or create new one
  const existingHealth = resourceHealthMap.get(resource.id)
  const validationHistory = existingHealth?.validationHistory || []

  // Add the new validation result to history (keep last 10 results)
  validationHistory.push(validationResult)
  if (validationHistory.length > 10) {
    validationHistory.shift() // Remove oldest result
  }

  const healthStatus: ResourceHealthStatus = {
    id: resource.id,
    url: resource.url,
    isHealthy: validationResult.isAccessible,
    lastChecked: validationResult.timestamp,
    lastStatus: validationResult.status,
    lastStatusText: validationResult.statusText,
    responseTime: validationResult.responseTime,
    error: validationResult.error,
    validationHistory,
  }

  resourceHealthMap.set(resource.id, healthStatus)

  return healthStatus
}

/**
 * Updates health status for all resources
 */
export async function updateAllResourceHealth(
  resources: Resource[]
): Promise<ResourceHealthStatus[]> {
  const results = await validateUrls(
    resources.map(r => r.url),
    {},
    5
  )

  const healthStatuses = resources.map((resource, index) => {
    const validationResult = results[index]

    // Get existing health status or create new one
    const existingHealth = resourceHealthMap.get(resource.id)
    const validationHistory = existingHealth?.validationHistory || []

    // Add the new validation result to history (keep last 10 results)
    validationHistory.push(validationResult)
    if (validationHistory.length > 10) {
      validationHistory.shift() // Remove oldest result
    }

    const healthStatus: ResourceHealthStatus = {
      id: resource.id,
      url: resource.url,
      isHealthy: validationResult.isAccessible,
      lastChecked: validationResult.timestamp,
      lastStatus: validationResult.status,
      lastStatusText: validationResult.statusText,
      responseTime: validationResult.responseTime,
      error: validationResult.error,
      validationHistory,
    }

    resourceHealthMap.set(resource.id, healthStatus)
    return healthStatus
  })

  return healthStatuses
}

/**
 * Gets the health status of a resource by ID
 */
export function getResourceHealthStatus(
  id: string
): ResourceHealthStatus | undefined {
  return resourceHealthMap.get(id)
}

/**
 * Gets health statuses for all tracked resources
 */
export function getAllResourceHealthStatuses(): ResourceHealthStatus[] {
  return Array.from(resourceHealthMap.values())
}

/**
 * Gets stats about resource health across the entire system
 */
export function getResourceHealthStats(): {
  total: number
  healthy: number
  unhealthy: number
  unknown: number
  healthyPercentage: number
} {
  const allStatuses = getAllResourceHealthStatuses()

  const healthy = allStatuses.filter(s => s.isHealthy).length
  const unhealthy = allStatuses.filter(s => s.isHealthy === false).length
  const unknown = allStatuses.length - healthy - unhealthy

  return {
    total: allStatuses.length,
    healthy,
    unhealthy,
    unknown,
    healthyPercentage:
      allStatuses.length > 0
        ? Math.round((healthy / allStatuses.length) * 100)
        : 0,
  }
}

/**
 * Clears the health status for a specific resource
 */
export function clearResourceHealth(id: string): void {
  resourceHealthMap.delete(id)
}

/**
 * Clears all health statuses
 */
export function clearAllResourceHealth(): void {
  resourceHealthMap.clear()
}
