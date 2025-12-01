// Define TypeScript interfaces for webhook system
export interface Webhook {
  id: string
  url: string
  events: WebhookEvent[]
  active: boolean
  secret?: string
  createdAt: string
  updatedAt: string
  lastDeliveryAt?: string
  lastDeliveryStatus?: 'success' | 'failed' | 'pending'
  deliveryCount: number
  failureCount: number
}

export type WebhookEvent =
  | 'resource.created'
  | 'resource.updated'
  | 'resource.deleted'
  | 'resource.approved'
  | 'user.registered'
  | 'submission.received'
  | string

export interface WebhookPayload {
  event: WebhookEvent
  data: any
  timestamp: string
  signature?: string
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: WebhookPayload
  status: 'success' | 'failed' | 'pending'
  responseCode?: number
  responseMessage?: string
  attemptCount: number
  nextRetryAt?: string
  createdAt: string
  completedAt?: string
}

export interface CreateWebhookRequest {
  url: string
  events: WebhookEvent[]
  active?: boolean
}

export interface UpdateWebhookRequest {
  url?: string
  events?: WebhookEvent[]
  active?: boolean
}

export interface ApiKey {
  id: string
  name: string
  key: string
  userId?: string
  permissions: string[]
  createdAt: string
  expiresAt?: string
  lastUsedAt?: string
  active: boolean
}
