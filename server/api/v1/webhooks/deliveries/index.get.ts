import { defineEventHandler, getQuery } from 'h3'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const query = getQuery(event)
    const webhookId = query.webhookId as string | undefined
    const status = query.status as string | undefined

    let deliveries = await webhookStorage.getAllDeliveries()

    // Filter by webhook ID if provided
    if (webhookId) {
      deliveries = deliveries.filter(d => d.webhookId === webhookId)
    }

    // Filter by status if provided
    if (status) {
      deliveries = deliveries.filter(d => d.status === status)
    }

    return sendSuccessResponse(event, {
      deliveries,
      count: deliveries.length,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
