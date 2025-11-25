import { getQuery } from 'h3'
import { Resource } from '~/types/resource'
import { getAllTags } from '~/utils/tags'

/**
 * GET /api/v1/tags
 *
 * Get all available tags with optional hierarchical structure
 *
 * Query parameters:
 * - hierarchical: boolean - Whether to include hierarchical structure
 */
export default defineEventHandler(async event => {
  try {
    const query = getQuery(event)
    const includeHierarchical = query.hierarchical === 'true'

    const result = await getAllTags(includeHierarchical)

    return {
      success: true,
      data: {
        tags: result.tags,
        count: result.tags.length,
        hierarchical: result.hierarchical,
      },
    }
  } catch (error: any) {
    // Set error response status
    throw createError({
      statusCode: 500,
      message: 'An error occurred while fetching tags',
      data: {
        success: false,
        message: 'An error occurred while fetching tags',
      },
    })
  }
})
