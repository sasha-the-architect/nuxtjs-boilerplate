import { defineEventHandler, getQuery } from 'h3'
import { webhookStorage } from '~/server/utils/webhookStorage'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const webhookId = query.webhookId as string | undefined
  const status = query.status as string | undefined

  let deliveries = webhookStorage.getAllDeliveries()

  // Filter by webhook ID if provided
  if (webhookId) {
    deliveries = deliveries.filter(d => d.webhookId === webhookId)
  }

  // Filter by status if provided
  if (status) {
    deliveries = deliveries.filter(d => d.status === status)
  }

  return {
    success: true,
    data: deliveries,
    count: deliveries.length,
  }
})
