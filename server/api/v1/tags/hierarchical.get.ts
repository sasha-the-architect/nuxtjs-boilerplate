import { HierarchicalTag } from '~/types/resource'
import { getAllTags } from '~/utils/tags'

/**
 * GET /api/v1/tags/hierarchical
 *
 * Get hierarchical tag structure
 */
export default defineEventHandler(async event => {
  try {
    const result = await getAllTags(true)

    return {
      success: true,
      data: {
        tags: result.tags,
        hierarchical: result.hierarchical,
      },
    }
  } catch (error: any) {
    // Set error response status
    throw createError({
      statusCode: 500,
      message: 'An error occurred while fetching hierarchical tags',
      data: {
        success: false,
        message: 'An error occurred while fetching hierarchical tags',
      },
    })
  }
})
