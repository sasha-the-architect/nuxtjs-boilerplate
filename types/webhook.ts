// Define TypeScript interfaces for webhook system
export interface Webhook {
  id: string
  url: string
  events: WebhookEvent[]
  active: boolean
  secret?: string
  createdAt: string
  updatedAt: string
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
  data: unknown
  timestamp: string
  signature?: string
  idempotencyKey?: string
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: WebhookPayload
  status: 'success' | 'failed' | 'pending'
  statusCode?: number
  responseBody?: string
  errorMessage?: string
  attemptCount: number
  idempotencyKey?: string | null
  createdAt: string
  updatedAt: string
}

export interface WebhookQueueItem {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: WebhookPayload
  priority: number
  scheduledFor: string
  createdAt: string
  updatedAt: string
  retryCount: number
  maxRetries: number
}

export interface DeadLetterWebhook {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: WebhookPayload
  failureReason: string
  lastAttemptAt: string
  createdAt: string
  updatedAt: string
  deliveryAttempts: WebhookDelivery[]
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
  active: boolean
  expiresAt?: string
  createdAt: string
  updatedAt: string
}
