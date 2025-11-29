import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { getRouterParam } from 'h3'

// This is a simplified implementation for demonstration
// In a real implementation, you'd want to persist these relationships in a database
const alternativeRelationships = new Map<string, string[]>()

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    const resourceId = getRouterParam(event, 'id')

    if (!resourceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Resource ID is required',
      })
    }

    // Parse request body
    const body = await readBody(event)
    const { alternativeId, action = 'add' } = body

    if (!alternativeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Alternative resource ID is required',
      })
    }

    // Import resources from JSON to validate IDs
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Validate both resources exist
    const resource = resources.find(r => r.id === resourceId)
    const alternativeResource = resources.find(r => r.id === alternativeId)

    if (!resource || !alternativeResource) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Resource or alternative resource not found',
      })
    }

    // Get existing alternatives for this resource
    let currentAlternatives = alternativeRelationships.get(resourceId) || []

    if (action === 'add') {
      // Add alternative relationship (both ways)
      if (!currentAlternatives.includes(alternativeId)) {
        currentAlternatives.push(alternativeId)
        alternativeRelationships.set(resourceId, currentAlternatives)

        // Also add reverse relationship
        let reverseAlternatives =
          alternativeRelationships.get(alternativeId) || []
        if (!reverseAlternatives.includes(resourceId)) {
          reverseAlternatives.push(resourceId)
          alternativeRelationships.set(alternativeId, reverseAlternatives)
        }
      }
    } else if (action === 'remove') {
      // Remove alternative relationship (both ways)
      currentAlternatives = currentAlternatives.filter(
        id => id !== alternativeId
      )
      alternativeRelationships.set(resourceId, currentAlternatives)

      // Also remove reverse relationship
      let reverseAlternatives =
        alternativeRelationships.get(alternativeId) || []
      reverseAlternatives = reverseAlternatives.filter(id => id !== resourceId)
      alternativeRelationships.set(alternativeId, reverseAlternatives)
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid action. Use "add" or "remove".',
      })
    }

    return {
      success: true,
      data: {
        resourceId,
        alternativeId,
        action,
        alternatives: currentAlternatives,
      },
    }
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error managing alternative relationship for resource ${getRouterParam(event, 'id')}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-alternatives-post',
      {
        resourceId: getRouterParam(event, 'id'),
        errorType: error?.constructor?.name,
      }
    )

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || 'Failed to manage alternative relationship',
    })
  }
})
