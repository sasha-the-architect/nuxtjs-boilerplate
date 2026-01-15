import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { defineEventHandler, getRouterParam, readBody } from 'h3'

// This is a simplified implementation for demonstration
// In a real implementation, you'd want to persist these relationships in a database
const alternativeRelationships = new Map<string, string[]>()

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    const resourceId = getRouterParam(event, 'id')

    if (!resourceId) {
      sendBadRequestError(event, 'Resource ID is required')
      return
    }

    // Parse request body
    const body = await readBody(event)
    const { alternativeId, action = 'add' } = body

    if (!alternativeId) {
      sendBadRequestError(event, 'Alternative resource ID is required')
      return
    }

    // Import resources from JSON to validate IDs
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Validate both resources exist
    const resource = resources.find(r => r.id === resourceId)
    const alternativeResource = resources.find(r => r.id === alternativeId)

    if (!resource || !alternativeResource) {
      sendNotFoundError(event, 'Resource or alternative resource')
      return
    }

    // Get existing alternatives for this resource
    let currentAlternatives = alternativeRelationships.get(resourceId) || []

    if (action === 'add') {
      // Add alternative relationship (both ways)
      if (!currentAlternatives.includes(alternativeId)) {
        currentAlternatives.push(alternativeId)
        alternativeRelationships.set(resourceId, currentAlternatives)

        // Also add reverse relationship
        const reverseAlternatives =
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
      sendBadRequestError(event, 'Invalid action. Use "add" or "remove".')
      return
    }

    sendSuccessResponse(event, {
      resourceId,
      alternativeId,
      action,
      alternatives: currentAlternatives,
    })
  } catch (error) {
    // Log error using our error logging service
    logError(
      `Error managing alternative relationship for resource ${getRouterParam(event, 'id')}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-alternatives-post',
      {
        resourceId: getRouterParam(event, 'id'),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      }
    )

    handleApiRouteError(event, error)
  }
})
