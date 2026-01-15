import { useAlternatives } from '~/composables/useAlternatives'
import { useResourceData } from '~/composables/useResourceData'
import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const { resources } = useResourceData()
    const { getAllAlternatives } = useAlternatives()

    // Get the resource ID from route parameters
    const resourceId = event.context.params?.id

    if (!resourceId) {
      return sendBadRequestError(event, 'Resource ID is required')
    }

    // Find the target resource
    const targetResource = resources.value?.find(r => r.id === resourceId)
    if (!targetResource) {
      return sendNotFoundError(event, 'Resource', resourceId)
    }

    // Get alternatives for the resource
    const alternatives = getAllAlternatives(targetResource)

    const responseData = {
      resourceId,
      alternatives: alternatives.map(alt => ({
        ...alt.resource,
        score: alt.score,
        reason: alt.reason,
      })),
    }

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
