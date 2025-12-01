import { useAlternatives } from '~/composables/useAlternatives'
import { useResourceData } from '~/composables/useResourceData'

export default defineEventHandler(async event => {
  const { resources } = useResourceData()
  const { getAllAlternatives } = useAlternatives()

  // Get the resource ID from the route parameters
  const resourceId = event.context.params?.id
  if (!resourceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Resource ID is required',
    })
  }

  // Find the target resource
  const targetResource = resources.value?.find(r => r.id === resourceId)
  if (!targetResource) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found',
    })
  }

  // Get alternatives for the resource
  const alternatives = getAllAlternatives(targetResource)

  // Return the alternatives
  return {
    resourceId,
    alternatives: alternatives.map(alt => ({
      ...alt.resource,
      similarityScore: alt.similarityScore,
      reason: alt.reason,
    })),
  }
})
