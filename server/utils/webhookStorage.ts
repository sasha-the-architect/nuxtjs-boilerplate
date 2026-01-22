import type {
  Webhook,
  WebhookEvent,
  WebhookDelivery,
  ApiKey,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'
import type {
  Webhook as PrismaWebhook,
  WebhookDelivery as PrismaWebhookDelivery,
  ApiKey as PrismaApiKey,
  WebhookQueueItem as PrismaWebhookQueueItem,
  DeadLetterWebhook as PrismaDeadLetterWebhook,
} from '@prisma/client'
import { prisma } from './db'

function mapPrismaToWebhook(webhook: PrismaWebhook): Webhook {
  return {
    id: webhook.id,
    url: webhook.url,
    secret: webhook.secret,
    active: webhook.active,
    events: JSON.parse(webhook.events) as WebhookEvent[],
    createdAt: webhook.createdAt.toISOString(),
    updatedAt: webhook.updatedAt.toISOString(),
  }
}

function mapPrismaToWebhookDelivery(
  delivery: PrismaWebhookDelivery
): WebhookDelivery {
  return {
    id: delivery.id,
    webhookId: delivery.webhookId,
    event: delivery.event as WebhookEvent,
    payload: JSON.parse(delivery.payload),
    status: delivery.status,
    statusCode: delivery.statusCode,
    responseBody: delivery.responseBody
      ? JSON.parse(delivery.responseBody)
      : undefined,
    errorMessage: delivery.errorMessage,
    attemptCount: delivery.attemptCount,
    idempotencyKey: delivery.idempotencyKey,
    createdAt: delivery.createdAt.toISOString(),
    updatedAt: delivery.updatedAt.toISOString(),
  }
}

function mapPrismaToApiKey(apiKey: PrismaApiKey): ApiKey {
  return {
    id: apiKey.id,
    key: apiKey.key,
    userId: apiKey.userId,
    name: apiKey.name,
    permissions: JSON.parse(apiKey.permissions),
    active: apiKey.active,
    expiresAt: apiKey.expiresAt?.toISOString(),
    createdAt: apiKey.createdAt.toISOString(),
    updatedAt: apiKey.updatedAt.toISOString(),
  }
}

function mapPrismaToWebhookQueueItem(
  queueItem: PrismaWebhookQueueItem
): WebhookQueueItem {
  return {
    id: queueItem.id,
    webhookId: queueItem.webhookId,
    event: queueItem.event as WebhookEvent,
    payload: JSON.parse(queueItem.payload),
    priority: queueItem.priority,
    retryCount: queueItem.retryCount,
    maxRetries: queueItem.maxRetries,
    scheduledFor: queueItem.scheduledFor.toISOString(),
    createdAt: queueItem.createdAt.toISOString(),
    updatedAt: queueItem.updatedAt.toISOString(),
  }
}

function mapPrismaToDeadLetterWebhook(
  deadLetter: PrismaDeadLetterWebhook
): DeadLetterWebhook {
  return {
    id: deadLetter.id,
    webhookId: deadLetter.webhookId,
    event: deadLetter.event as WebhookEvent,
    payload: JSON.parse(deadLetter.payload),
    failureReason: deadLetter.failureReason,
    lastAttemptAt: deadLetter.lastAttemptAt.toISOString(),
    createdAt: deadLetter.createdAt.toISOString(),
    updatedAt: deadLetter.updatedAt.toISOString(),
    deliveryAttempts: JSON.parse(deadLetter.deliveryAttempts),
  }
}

export const webhookStorage = {
  // Webhook methods
  async getAllWebhooks() {
    const webhooks = await prisma.webhook.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return webhooks.map(mapPrismaToWebhook)
  },

  async getWebhookById(id: string) {
    const webhook = await prisma.webhook.findFirst({
      where: { id, deletedAt: null },
    })

    if (!webhook) return null

    return mapPrismaToWebhook(webhook)
  },

  async createWebhook(webhook: Webhook) {
    const created = await prisma.webhook.create({
      data: {
        id: webhook.id,
        url: webhook.url,
        secret: webhook.secret,
        active: webhook.active,
        events: JSON.stringify(webhook.events),
      },
    })

    return mapPrismaToWebhook(created)
  },

  async updateWebhook(id: string, data: Partial<Webhook>) {
    const updated = await prisma.webhook.updateMany({
      where: { id, deletedAt: null },
      data: {
        ...(data.url && { url: data.url }),
        ...(data.secret !== undefined && { secret: data.secret }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.events && { events: JSON.stringify(data.events) }),
      },
    })

    if (updated.count === 0) return null

    const webhook = await prisma.webhook.findUnique({
      where: { id },
    })

    return webhook ? mapPrismaToWebhook(webhook) : null
  },

  async deleteWebhook(id: string) {
    const deleted = await prisma.webhook.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    return deleted.count > 0
  },

  async getWebhooksByEvent(event: string) {
    const webhooks = await prisma.webhook.findMany({
      where: {
        deletedAt: null,
        active: true,
        events: { contains: `"${event}"` },
      },
      take: 100,
    })

    return webhooks.map(mapPrismaToWebhook)
  },

  // Delivery methods
  async getAllDeliveries() {
    const deliveries = await prisma.webhookDelivery.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return deliveries.map(mapPrismaToWebhookDelivery)
  },

  async getDeliveryById(id: string) {
    const delivery = await prisma.webhookDelivery.findFirst({
      where: { id, deletedAt: null },
    })

    if (!delivery) return null

    return mapPrismaToWebhookDelivery(delivery)
  },

  async createDelivery(delivery: WebhookDelivery) {
    const created = await prisma.webhookDelivery.create({
      data: {
        id: delivery.id,
        webhookId: delivery.webhookId,
        event: delivery.event,
        payload: JSON.stringify(delivery.payload),
        status: delivery.status,
        statusCode: delivery.statusCode,
        responseBody: delivery.responseBody
          ? JSON.stringify(delivery.responseBody)
          : null,
        errorMessage: delivery.errorMessage,
        attemptCount: delivery.attemptCount,
        idempotencyKey: delivery.idempotencyKey,
      },
    })

    return mapPrismaToWebhookDelivery(created)
  },

  async updateDelivery(id: string, data: Partial<WebhookDelivery>) {
    const updated = await prisma.webhookDelivery.updateMany({
      where: { id, deletedAt: null },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.statusCode && { statusCode: data.statusCode }),
        ...(data.responseBody && {
          responseBody: JSON.stringify(data.responseBody),
        }),
        ...(data.errorMessage && { errorMessage: data.errorMessage }),
        ...(data.attemptCount && { attemptCount: data.attemptCount }),
      },
    })

    if (updated.count === 0) return null

    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id },
    })

    return delivery ? mapPrismaToWebhookDelivery(delivery) : null
  },

  async getDeliveriesByWebhookId(
    webhookId: string
  ): Promise<WebhookDelivery[]> {
    const deliveries = await prisma.webhookDelivery.findMany({
      where: { webhookId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return deliveries.map(mapPrismaToWebhookDelivery)
  },

  // API Key methods
  async getAllApiKeys() {
    const apiKeys = await prisma.apiKey.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return apiKeys.map(mapPrismaToApiKey)
  },

  async getApiKeyById(id: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, deletedAt: null },
    })

    if (!apiKey) return null

    return mapPrismaToApiKey(apiKey)
  },

  async getApiKeyByValue(key: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        key,
        deletedAt: null,
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    if (!apiKey) return null

    return mapPrismaToApiKey(apiKey)
  },

  async createApiKey(apiKey: ApiKey) {
    const created = await prisma.apiKey.create({
      data: {
        id: apiKey.id,
        key: apiKey.key,
        userId: apiKey.userId,
        name: apiKey.name,
        permissions: JSON.stringify(apiKey.permissions),
        active: apiKey.active,
        expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt) : null,
      },
    })

    return mapPrismaToApiKey(created)
  },

  async updateApiKey(id: string, data: Partial<ApiKey>) {
    const updated = await prisma.apiKey.updateMany({
      where: { id, deletedAt: null },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.permissions && {
          permissions: JSON.stringify(data.permissions),
        }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }),
      },
    })

    if (updated.count === 0) return null

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
    })

    return apiKey ? mapPrismaToApiKey(apiKey) : null
  },

  async deleteApiKey(id: string) {
    const deleted = await prisma.apiKey.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    return deleted.count > 0
  },

  // Webhook Queue methods
  async getQueue() {
    const queue = await prisma.webhookQueue.findMany({
      where: { deletedAt: null },
      orderBy: [{ priority: 'asc' }, { scheduledFor: 'asc' }],
      take: 1000,
    })

    return queue.map(mapPrismaToWebhookQueueItem)
  },

  async getQueueItemById(id: string) {
    const item = await prisma.webhookQueue.findFirst({
      where: { id, deletedAt: null },
    })

    if (!item) return null

    return mapPrismaToWebhookQueueItem(item)
  },

  async addToQueue(item: WebhookQueueItem) {
    const created = await prisma.webhookQueue.create({
      data: {
        id: item.id,
        webhookId: item.webhookId,
        event: item.event,
        payload: JSON.stringify(item.payload),
        priority: item.priority,
        retryCount: item.retryCount,
        maxRetries: item.maxRetries,
        scheduledFor: new Date(item.scheduledFor),
      },
    })

    return mapPrismaToWebhookQueueItem(created)
  },

  async removeFromQueue(id: string) {
    const deleted = await prisma.webhookQueue.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    return deleted.count > 0
  },

  // Dead Letter Queue methods
  async getDeadLetterQueue() {
    const deadLetter = await prisma.deadLetterWebhook.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return deadLetter.map(mapPrismaToDeadLetterWebhook)
  },

  async getDeadLetterWebhookById(id: string) {
    const item = await prisma.deadLetterWebhook.findFirst({
      where: { id, deletedAt: null },
    })

    if (!item) return null

    return mapPrismaToDeadLetterWebhook(item)
  },

  async addToDeadLetterQueue(item: DeadLetterWebhook) {
    const created = await prisma.deadLetterWebhook.create({
      data: {
        id: item.id,
        webhookId: item.webhookId,
        event: item.event,
        payload: JSON.stringify(item.payload),
        failureReason: item.failureReason,
        lastAttemptAt: new Date(item.lastAttemptAt),
        deliveryAttempts: JSON.stringify(item.deliveryAttempts),
      },
    })

    return mapPrismaToDeadLetterWebhook(created)
  },

  async removeFromDeadLetterQueue(id: string) {
    const deleted = await prisma.deadLetterWebhook.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    return deleted.count > 0
  },

  // Idempotency methods
  async getDeliveryByIdempotencyKey(key: string) {
    const idempotencyKey = await prisma.idempotencyKey.findFirst({
      where: {
        key,
        deletedAt: null,
      },
    })

    if (!idempotencyKey) return null

    const delivery = await prisma.webhookDelivery.findFirst({
      where: { id: idempotencyKey.deliveryId, deletedAt: null },
    })

    if (!delivery) return null

    return mapPrismaToWebhookDelivery(delivery)
  },

  async setDeliveryByIdempotencyKey(key: string, delivery: WebhookDelivery) {
    await prisma.idempotencyKey.upsert({
      where: { key },
      create: {
        key,
        deliveryId: delivery.id,
      },
      update: {
        deliveryId: delivery.id,
      },
    })

    return delivery
  },

  async hasDeliveryWithIdempotencyKey(key: string) {
    const idempotencyKey = await prisma.idempotencyKey.findFirst({
      where: {
        key,
        deletedAt: null,
      },
    })

    return !!idempotencyKey
  },
}

export async function resetWebhookStorage() {
  await prisma.idempotencyKey.deleteMany({})
  await prisma.webhookDelivery.deleteMany({})
  await prisma.webhookQueue.deleteMany({})
  await prisma.deadLetterWebhook.deleteMany({})
  await prisma.webhook.deleteMany({})
  await prisma.apiKey.deleteMany({})
}
