import type {
  Webhook,
  WebhookEvent,
  WebhookDelivery,
  ApiKey,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'
import { prisma } from './db'

export const webhookStorage = {
  // Webhook methods
  async getAllWebhooks() {
    const webhooks = await prisma.webhook.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return webhooks.map(w => ({
      id: w.id,
      url: w.url,
      secret: w.secret,
      active: w.active,
      events: JSON.parse(w.events) as WebhookEvent[],
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    }))
  },

  async getWebhookById(id: string) {
    const webhook = await prisma.webhook.findFirst({
      where: { id, deletedAt: null },
    })

    if (!webhook) return null

    return {
      id: webhook.id,
      url: webhook.url,
      secret: webhook.secret,
      active: webhook.active,
      events: JSON.parse(webhook.events) as WebhookEvent[],
      createdAt: webhook.createdAt.toISOString(),
      updatedAt: webhook.updatedAt.toISOString(),
    } as Webhook
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

    return {
      id: created.id,
      url: created.url,
      secret: created.secret,
      active: created.active,
      events: JSON.parse(created.events) as WebhookEvent[],
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  },

  async updateWebhook(id: string, data: Partial<Webhook>) {
    const webhook = await prisma.webhook.findFirst({
      where: { id, deletedAt: null },
    })

    if (!webhook) return null

    const updated = await prisma.webhook.update({
      where: { id },
      data: {
        ...(data.url && { url: data.url }),
        ...(data.secret !== undefined && { secret: data.secret }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.events && { events: JSON.stringify(data.events) }),
      },
    })

    return {
      id: updated.id,
      url: updated.url,
      secret: updated.secret,
      active: updated.active,
      events: JSON.parse(updated.events) as WebhookEvent[],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  },

  async deleteWebhook(id: string) {
    const webhook = await prisma.webhook.findFirst({
      where: { id, deletedAt: null },
    })

    if (!webhook) return false

    await prisma.webhook.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return true
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

    return webhooks.map(w => ({
      id: w.id,
      url: w.url,
      secret: w.secret,
      active: w.active,
      events: JSON.parse(w.events) as WebhookEvent[],
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    }))
  },

  // Delivery methods
  async getAllDeliveries() {
    const deliveries = await prisma.webhookDelivery.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return deliveries.map(d => ({
      id: d.id,
      webhookId: d.webhookId,
      event: d.event as WebhookEvent,
      payload: JSON.parse(d.payload),
      status: d.status,
      statusCode: d.statusCode,
      responseBody: d.responseBody ? JSON.parse(d.responseBody) : undefined,
      errorMessage: d.errorMessage,
      attemptCount: d.attemptCount,
      idempotencyKey: d.idempotencyKey,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }))
  },

  async getDeliveryById(id: string) {
    const delivery = await prisma.webhookDelivery.findFirst({
      where: { id, deletedAt: null },
    })

    if (!delivery) return null

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

    return {
      id: created.id,
      webhookId: created.webhookId,
      event: created.event as WebhookEvent,
      payload: JSON.parse(created.payload),
      status: created.status,
      statusCode: created.statusCode,
      responseBody: created.responseBody
        ? JSON.parse(created.responseBody)
        : undefined,
      errorMessage: created.errorMessage,
      attemptCount: created.attemptCount,
      idempotencyKey: created.idempotencyKey,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  },

  async updateDelivery(id: string, data: Partial<WebhookDelivery>) {
    const delivery = await prisma.webhookDelivery.findFirst({
      where: { id, deletedAt: null },
    })

    if (!delivery) return null

    const updated = await prisma.webhookDelivery.update({
      where: { id },
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

    return {
      id: updated.id,
      webhookId: updated.webhookId,
      event: updated.event as WebhookEvent,
      payload: JSON.parse(updated.payload),
      status: updated.status,
      statusCode: updated.statusCode,
      responseBody: updated.responseBody
        ? JSON.parse(updated.responseBody)
        : undefined,
      errorMessage: updated.errorMessage,
      attemptCount: updated.attemptCount,
      idempotencyKey: updated.idempotencyKey,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  },

  async getDeliveriesByWebhookId(
    webhookId: string
  ): Promise<WebhookDelivery[]> {
    const deliveries = await prisma.webhookDelivery.findMany({
      where: { webhookId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return deliveries.map(d => ({
      id: d.id,
      webhookId: d.webhookId,
      event: d.event as WebhookEvent,
      payload: JSON.parse(d.payload),
      status: d.status,
      statusCode: d.statusCode,
      responseBody: d.responseBody ? JSON.parse(d.responseBody) : undefined,
      errorMessage: d.errorMessage,
      attemptCount: d.attemptCount,
      idempotencyKey: d.idempotencyKey,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }))
  },

  // API Key methods
  async getAllApiKeys() {
    const apiKeys = await prisma.apiKey.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return apiKeys.map(k => ({
      id: k.id,
      key: k.key,
      userId: k.userId,
      name: k.name,
      permissions: JSON.parse(k.permissions),
      active: k.active,
      expiresAt: k.expiresAt?.toISOString(),
      createdAt: k.createdAt.toISOString(),
      updatedAt: k.updatedAt.toISOString(),
    }))
  },

  async getApiKeyById(id: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, deletedAt: null },
    })

    if (!apiKey) return null

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

    return {
      id: created.id,
      key: created.key,
      userId: created.userId,
      name: created.name,
      permissions: JSON.parse(created.permissions),
      active: created.active,
      expiresAt: created.expiresAt?.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  },

  async updateApiKey(id: string, data: Partial<ApiKey>) {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, deletedAt: null },
    })

    if (!apiKey) return null

    const updated = await prisma.apiKey.update({
      where: { id },
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

    return {
      id: updated.id,
      key: updated.key,
      userId: updated.userId,
      name: updated.name,
      permissions: JSON.parse(updated.permissions),
      active: updated.active,
      expiresAt: updated.expiresAt?.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  },

  async deleteApiKey(id: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, deletedAt: null },
    })

    if (!apiKey) return false

    await prisma.apiKey.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return true
  },

  // Webhook Queue methods
  async getQueue() {
    const queue = await prisma.webhookQueue.findMany({
      where: { deletedAt: null },
      orderBy: [{ priority: 'asc' }, { scheduledFor: 'asc' }],
      take: 1000,
    })

    return queue.map(q => ({
      id: q.id,
      webhookId: q.webhookId,
      event: q.event as WebhookEvent,
      payload: JSON.parse(q.payload),
      priority: q.priority,
      retryCount: q.retryCount,
      maxRetries: q.maxRetries,
      scheduledFor: q.scheduledFor.toISOString(),
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    }))
  },

  async getQueueItemById(id: string) {
    const item = await prisma.webhookQueue.findFirst({
      where: { id, deletedAt: null },
    })

    if (!item) return null

    return {
      id: item.id,
      webhookId: item.webhookId,
      event: item.event as WebhookEvent,
      payload: JSON.parse(item.payload),
      priority: item.priority,
      retryCount: item.retryCount,
      maxRetries: item.maxRetries,
      scheduledFor: item.scheduledFor.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }
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

    return {
      id: created.id,
      webhookId: created.webhookId,
      event: created.event as WebhookEvent,
      payload: JSON.parse(created.payload),
      priority: created.priority,
      retryCount: created.retryCount,
      maxRetries: created.maxRetries,
      scheduledFor: created.scheduledFor.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  },

  async removeFromQueue(id: string) {
    const item = await prisma.webhookQueue.findFirst({
      where: { id, deletedAt: null },
    })

    if (!item) return false

    await prisma.webhookQueue.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return true
  },

  // Dead Letter Queue methods
  async getDeadLetterQueue() {
    const deadLetter = await prisma.deadLetterWebhook.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return deadLetter.map(dl => ({
      id: dl.id,
      webhookId: dl.webhookId,
      event: dl.event as WebhookEvent,
      payload: JSON.parse(dl.payload),
      failureReason: dl.failureReason,
      lastAttemptAt: dl.lastAttemptAt.toISOString(),
      createdAt: dl.createdAt.toISOString(),
      updatedAt: dl.updatedAt.toISOString(),
      deliveryAttempts: JSON.parse(dl.deliveryAttempts),
    }))
  },

  async getDeadLetterWebhookById(id: string) {
    const item = await prisma.deadLetterWebhook.findFirst({
      where: { id, deletedAt: null },
    })

    if (!item) return null

    return {
      id: item.id,
      webhookId: item.webhookId,
      event: item.event as WebhookEvent,
      payload: JSON.parse(item.payload),
      failureReason: item.failureReason,
      lastAttemptAt: item.lastAttemptAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      deliveryAttempts: JSON.parse(item.deliveryAttempts),
    }
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

    return {
      id: created.id,
      webhookId: created.webhookId,
      event: created.event as WebhookEvent,
      payload: JSON.parse(created.payload),
      failureReason: created.failureReason,
      lastAttemptAt: created.lastAttemptAt.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      deliveryAttempts: JSON.parse(created.deliveryAttempts),
    }
  },

  async removeFromDeadLetterQueue(id: string) {
    const item = await prisma.deadLetterWebhook.findFirst({
      where: { id, deletedAt: null },
    })

    if (!item) return false

    await prisma.deadLetterWebhook.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return true
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
