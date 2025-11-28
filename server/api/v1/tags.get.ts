import { getQuery, setResponseStatus } from 'h3'
import { logError } from '~/utils/errorLogger'
import { getAllHierarchicalTags } from '~/utils/tags'
import type { Resource } from '~/types/resource'

/**
 * GET /api/v1/tags
 *
 * Retrieve hierarchical tags with optional filtering
 *
 * Query parameters:
 * - includeChildren: Include child tags in the response (default: true)
 * - includeParents: Include parent tags in the response (default: true)
 * - rootOnly: Return only root level tags (default: false)
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON to get actual tag data
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Parse query parameters
    const query = getQuery(event)
    const includeChildren = query.includeChildren !== 'false' // Default to true
    const includeParents = query.includeParents !== 'false' // Default to true
    const rootOnly = query.rootOnly === 'true' // Default to false

    // Get all hierarchical tags from resources
    const allTags = getAllHierarchicalTags(resources)

    // Filter based on rootOnly parameter
    let filteredTags = allTags
    if (rootOnly) {
      filteredTags = allTags.filter(tag => tag.parentId === null)
    }

    // Set success response status
    setResponseStatus(event, 200)
    return {
      success: true,
      data: filteredTags,
      count: filteredTags.length,
    }
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching hierarchical tags: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-tags',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while fetching hierarchical tags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
