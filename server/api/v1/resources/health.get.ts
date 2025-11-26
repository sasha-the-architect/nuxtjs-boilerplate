import { getQuery, setResponseHeader, setResponseStatus } from 'h3'
import { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

/**
 * GET /api/v1/resources/health
 *
 * Retrieve health status for all resources
 * This endpoint provides information about URL health, response times, and status codes
 *
 * Query parameters:
 * - category: Filter by category
 * - status: Filter by health status ('healthy', 'unhealthy', 'unknown')
 * - limit: Number of resources to return (default: 50, max: 200)
 * - offset: Number of resources to skip (default: 0)
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Parse query parameters with validation
    const query = getQuery(event)

    // Validate and parse limit parameter
    let limit = 50 // default
    if (query.limit !== undefined) {
      const parsedLimit = parseInt(query.limit as string)
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 200) // max 200
      } else {
        // Invalid limit provided, return error
        setResponseStatus(event, 400)
        return {
          success: false,
          message: 'Invalid limit parameter. Must be a positive integer.',
          error: 'Bad Request',
        }
      }
    }

    // Validate and parse offset parameter
    let offset = 0 // default
    if (query.offset !== undefined) {
      const parsedOffset = parseInt(query.offset as string)
      if (!isNaN(parsedOffset) && parsedOffset >= 0) {
        offset = parsedOffset
      } else {
        // Invalid offset provided, return error
        setResponseStatus(event, 400)
        return {
          success: false,
          message: 'Invalid offset parameter. Must be a non-negative integer.',
          error: 'Bad Request',
        }
      }
    }

    // Validate and parse other parameters
    const category = query.category as string | undefined
    const status = query.status as string | undefined

    // Validate status parameter
    const validStatusOptions = ['healthy', 'unhealthy', 'unknown']
    if (status && !validStatusOptions.includes(status)) {
      setResponseStatus(event, 400)
      return {
        success: false,
        message: `Invalid status parameter. Valid options: ${validStatusOptions.join(', ')}`,
        error: 'Bad Request',
      }
    }

    // Apply filters
    if (category) {
      resources = resources.filter(
        resource => resource.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (status) {
      if (status === 'healthy') {
        resources = resources.filter(resource => resource.isHealthy === true)
      } else if (status === 'unhealthy') {
        resources = resources.filter(resource => resource.isHealthy === false)
      } else if (status === 'unknown') {
        resources = resources.filter(
          resource => resource.isHealthy === undefined
        )
      }
    }

    // Calculate health statistics
    const total = resources.length
    const healthyCount = resources.filter(r => r.isHealthy === true).length
    const unhealthyCount = resources.filter(r => r.isHealthy === false).length
    const unknownCount = resources.filter(r => r.isHealthy === undefined).length

    // Apply pagination
    const paginatedResources = resources.slice(offset, offset + limit)

    // Set success response
    setResponseStatus(event, 200)
    return {
      success: true,
      data: paginatedResources,
      summary: {
        total,
        healthy: healthyCount,
        unhealthy: unhealthyCount,
        unknown: unknownCount,
        healthyPercentage:
          total > 0 ? Math.round((healthyCount / total) * 100) : 0,
      },
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    }
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching resource health: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-resources-health',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while fetching resource health status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
