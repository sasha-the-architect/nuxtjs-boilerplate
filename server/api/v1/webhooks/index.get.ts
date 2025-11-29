import type { Webhook } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'

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

  return {
    success: true,
    data: webhooksWithoutSecrets,
    count: filteredWebhooks.length,
  }
})
