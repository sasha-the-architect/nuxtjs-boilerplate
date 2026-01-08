import { defineEventHandler, getQuery } from 'h3'
import type { Webhook } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { sendSuccessResponse } from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  // Get query parameters for filtering
  const query = getQuery(event)
  const active = query.active as string | undefined
  const eventFilter = query.event as string | undefined

  let filteredWebhooks = webhookStorage.getAllWebhooks()

  // Filter by active status
  if (active !== undefined) {
    const isActive = active === 'true'
    filteredWebhooks = filteredWebhooks.filter(w => w.active === isActive)
  }

  // Filter by event type
  if (eventFilter) {
    filteredWebhooks = filteredWebhooks.filter(w =>
      w.events.includes(eventFilter as any)
    )
  }

  // Return webhooks without secrets for security
  const webhooksWithoutSecrets = filteredWebhooks.map(
    ({ secret: _, ...webhook }) => webhook
  )

  return sendSuccessResponse(event, {
    data: webhooksWithoutSecrets,
    count: filteredWebhooks.length,
  })
})
