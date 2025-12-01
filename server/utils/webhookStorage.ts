import type { Webhook, WebhookDelivery, ApiKey } from '~/types/webhook'

// In-memory storage for webhooks (in production, use a database)
let webhooks: Webhook[] = []
let webhookDeliveries: WebhookDelivery[] = []
let apiKeys: ApiKey[] = []

export const webhookStorage = {
  // Webhook methods
  getAllWebhooks() {
    return [...webhooks]
  },

  getWebhookById(id: string) {
    return webhooks.find(w => w.id === id)
  },

  createWebhook(webhook: Webhook) {
    webhooks.push(webhook)
    return webhook
  },

  updateWebhook(id: string, data: Partial<Webhook>) {
    const index = webhooks.findIndex(w => w.id === id)
    if (index !== -1) {
      webhooks[index] = {
        ...webhooks[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return webhooks[index]
    }
    return null
  },

  deleteWebhook(id: string) {
    const index = webhooks.findIndex(w => w.id === id)
    if (index !== -1) {
      webhooks.splice(index, 1)
      return true
    }
    return false
  },

  getWebhooksByEvent(event: string) {
    return webhooks.filter(w => w.events.includes(event as any) && w.active)
  },

  // Delivery methods
  getAllDeliveries() {
    return [...webhookDeliveries]
  },

  getDeliveryById(id: string) {
    return webhookDeliveries.find(d => d.id === id)
  },

  createDelivery(delivery: WebhookDelivery) {
    webhookDeliveries.push(delivery)
    return delivery
  },

  updateDelivery(id: string, data: Partial<WebhookDelivery>) {
    const index = webhookDeliveries.findIndex(d => d.id === id)
    if (index !== -1) {
      webhookDeliveries[index] = { ...webhookDeliveries[index], ...data }
      return webhookDeliveries[index]
    }
    return null
  },

  getDeliveriesByWebhookId(webhookId: string) {
    return webhookDeliveries.filter(d => d.webhookId === webhookId)
  },

  // API Key methods
  getAllApiKeys() {
    return [...apiKeys]
  },

  getApiKeyById(id: string) {
    return apiKeys.find(k => k.id === id)
  },

  getApiKeyByValue(key: string) {
    return apiKeys.find(k => k.key === key)
  },

  createApiKey(apiKey: ApiKey) {
    apiKeys.push(apiKey)
    return apiKey
  },

  updateApiKey(id: string, data: Partial<ApiKey>) {
    const index = apiKeys.findIndex(k => k.id === id)
    if (index !== -1) {
      apiKeys[index] = {
        ...apiKeys[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return apiKeys[index]
    }
    return null
  },

  deleteApiKey(id: string) {
    const index = apiKeys.findIndex(k => k.id === id)
    if (index !== -1) {
      apiKeys.splice(index, 1)
      return true
    }
    return false
  },
}
