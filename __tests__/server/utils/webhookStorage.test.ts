import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  webhookStorage,
  resetWebhookStorage,
} from '~/server/utils/webhookStorage'
import type {
  Webhook,
  WebhookDelivery,
  ApiKey,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'

describe('webhookStorage', () => {
  const mockWebhook: Webhook = {
    id: 'wh_test_webhook_001',
    url: 'https://example.com/webhook',
    events: ['resource.created', 'resource.updated'],
    active: true,
    secret: 'test-secret',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }

  const mockDelivery: WebhookDelivery = {
    id: 'del_test_delivery_001',
    webhookId: 'wh_test_webhook_001',
    event: 'resource.created',
    payload: {
      event: 'resource.created',
      data: { id: 'res_1' },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
    status: 'success',
    statusCode: 200,
    attemptCount: 1,
    idempotencyKey: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:01.000Z',
  }

  const mockApiKey: ApiKey = {
    id: 'ak_test_apikey_001',
    name: 'Test API Key',
    key: 'sk_test_123456',
    userId: 'user_1',
    permissions: ['read', 'write'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    active: true,
    expiresAt: undefined,
  }

  const mockQueueItem: WebhookQueueItem = {
    id: 'q_001',
    webhookId: 'wh_123',
    event: 'resource.created',
    payload: {
      event: 'resource.created',
      data: { id: 'res_1' },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
    priority: 0,
    scheduledFor: '2024-01-01T00:00:05.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    retryCount: 0,
    maxRetries: 3,
  }

  const mockDeadLetterItem: DeadLetterWebhook = {
    id: 'dl_001',
    webhookId: 'wh_123',
    event: 'resource.created',
    payload: {
      event: 'resource.created',
      data: { id: 'res_1' },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
    failureReason: 'Max retries exceeded',
    lastAttemptAt: '2024-01-01T00:00:10.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deliveryAttempts: [],
  }

  beforeEach(async () => {
    await resetWebhookStorage()
  })

  afterEach(async () => {
    await resetWebhookStorage()
  })

  describe('Webhook Methods', () => {
    describe('createWebhook', () => {
      it('should create a new webhook', async () => {
        const result = await webhookStorage.createWebhook(mockWebhook)

        expect(result).toMatchObject({
          id: 'wh_test_webhook_001',
          url: 'https://example.com/webhook',
          events: ['resource.created', 'resource.updated'],
          active: true,
          secret: 'test-secret',
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
        expect(await webhookStorage.getAllWebhooks()).toHaveLength(1)
      })

      it('should create multiple webhooks', async () => {
        const webhook2: Webhook = {
          ...mockWebhook,
          id: 'wh_test_webhook_002',
          url: 'https://example2.com/webhook',
        }

        await webhookStorage.createWebhook(mockWebhook)
        await webhookStorage.createWebhook(webhook2)

        expect(await webhookStorage.getAllWebhooks()).toHaveLength(2)
      })
    })

    describe('getWebhookById', () => {
      it('should return webhook by id', async () => {
        await webhookStorage.createWebhook(mockWebhook)

        const result = await webhookStorage.getWebhookById(
          'wh_test_webhook_001'
        )

        expect(result).toMatchObject({
          id: 'wh_test_webhook_001',
          url: 'https://example.com/webhook',
          events: ['resource.created', 'resource.updated'],
          active: true,
          secret: 'test-secret',
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return undefined for non-existent webhook', async () => {
        const result = await webhookStorage.getWebhookById('non-existent')

        expect(result).toBeNull()
      })
    })

    describe('getAllWebhooks', () => {
      it('should return all webhooks', async () => {
        const webhook2: Webhook = {
          ...mockWebhook,
          id: 'wh_test_webhook_003',
          url: 'https://example2.com/webhook',
        }

        await webhookStorage.createWebhook(mockWebhook)
        await webhookStorage.createWebhook(webhook2)

        const result = await webhookStorage.getAllWebhooks()

        expect(result).toHaveLength(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'wh_test_webhook_001',
              url: 'https://example.com/webhook',
            }),
            expect.objectContaining({
              id: 'wh_test_webhook_003',
              url: 'https://example2.com/webhook',
            }),
          ])
        )
      })

      it('should return empty array when no webhooks exist', async () => {
        const result = await webhookStorage.getAllWebhooks()

        expect(result).toEqual([])
      })
    })

    describe('updateWebhook', () => {
      it('should update webhook with partial data', async () => {
        await webhookStorage.createWebhook(mockWebhook)

        const result = await webhookStorage.updateWebhook(
          'wh_test_webhook_001',
          {
            active: false,
          }
        )

        expect(result?.active).toBe(false)
        expect(result?.id).toBe('wh_test_webhook_001')
        expect(result?.url).toBe(mockWebhook.url)
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return null for non-existent webhook', async () => {
        const result = await webhookStorage.updateWebhook('non-existent', {
          active: false,
        })

        expect(result).toBeNull()
      })
    })

    describe('deleteWebhook', () => {
      it('should delete webhook by id', async () => {
        await webhookStorage.createWebhook(mockWebhook)

        const result = await webhookStorage.deleteWebhook('wh_test_webhook_001')

        expect(result).toBe(true)
        expect(
          await webhookStorage.getWebhookById('wh_test_webhook_001')
        ).toBeNull()
      })

      it('should return false for non-existent webhook', async () => {
        const result = await webhookStorage.deleteWebhook('non-existent')

        expect(result).toBe(false)
      })
    })

    describe('getWebhooksByEvent', () => {
      it('should return webhooks that match event', async () => {
        const webhook2: Webhook = {
          ...mockWebhook,
          id: 'wh_test_webhook_002',
          events: ['resource.deleted'],
          active: true,
        }

        await webhookStorage.createWebhook(mockWebhook)
        await webhookStorage.createWebhook(webhook2)

        const result =
          await webhookStorage.getWebhooksByEvent('resource.created')

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
          id: 'wh_test_webhook_001',
          url: 'https://example.com/webhook',
          events: ['resource.created', 'resource.updated'],
          active: true,
          secret: 'test-secret',
        })
      })

      it('should only return active webhooks', async () => {
        const inactiveWebhook: Webhook = {
          ...mockWebhook,
          id: 'wh_test_webhook_002',
          active: false,
        }

        await webhookStorage.createWebhook(mockWebhook)
        await webhookStorage.createWebhook(inactiveWebhook)

        const result =
          await webhookStorage.getWebhooksByEvent('resource.created')

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
          id: 'wh_test_webhook_001',
          url: 'https://example.com/webhook',
          events: ['resource.created', 'resource.updated'],
          active: true,
          secret: 'test-secret',
        })
      })

      it('should return empty array when no webhooks match event', async () => {
        await webhookStorage.createWebhook(mockWebhook)

        const result =
          await webhookStorage.getWebhooksByEvent('user.registered')

        expect(result).toEqual([])
      })
    })
  })

  describe('Delivery Methods', () => {
    describe('createDelivery', () => {
      it('should create a new delivery', async () => {
        const result = await webhookStorage.createDelivery(mockDelivery)

        expect(result).toMatchObject({
          id: 'del_test_delivery_001',
          webhookId: 'wh_test_webhook_001',
          event: 'resource.created',
          status: 'success',
          statusCode: 200,
          attemptCount: 1,
          idempotencyKey: null,
        })
        expect(result?.payload).toEqual(mockDelivery.payload)
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
        expect(result?.errorMessage).toBeNull()
        expect(result?.responseBody).toBeUndefined()
        expect(await webhookStorage.getAllDeliveries()).toHaveLength(1)
      })
    })

    describe('getDeliveryById', () => {
      it('should return delivery by id', async () => {
        await webhookStorage.createDelivery(mockDelivery)

        const result = await webhookStorage.getDeliveryById(
          'del_test_delivery_001'
        )

        expect(result).toMatchObject({
          id: 'del_test_delivery_001',
          webhookId: 'wh_test_webhook_001',
          event: 'resource.created',
          status: 'success',
          statusCode: 200,
          attemptCount: 1,
          idempotencyKey: null,
        })
        expect(result?.payload).toEqual(mockDelivery.payload)
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return undefined for non-existent delivery', async () => {
        const result = await webhookStorage.getDeliveryById('non-existent')

        expect(result).toBeNull()
      })
    })

    describe('getAllDeliveries', () => {
      it('should return all deliveries', async () => {
        const delivery2: WebhookDelivery = {
          ...mockDelivery,
          id: 'del_test_delivery_002',
          webhookId: 'wh_test_webhook_002',
        }

        await webhookStorage.createDelivery(mockDelivery)
        await webhookStorage.createDelivery(delivery2)

        const result = await webhookStorage.getAllDeliveries()

        expect(result.length).toBeGreaterThanOrEqual(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'del_test_delivery_001',
              webhookId: 'wh_test_webhook_001',
            }),
            expect.objectContaining({
              id: 'del_test_delivery_002',
              webhookId: 'wh_test_webhook_002',
            }),
          ])
        )
      })
    })

    describe('updateDelivery', () => {
      it('should update delivery with partial data', async () => {
        await webhookStorage.createDelivery(mockDelivery)

        const result = await webhookStorage.updateDelivery(
          'del_test_delivery_001',
          {
            status: 'failed',
            attemptCount: 2,
          }
        )

        expect(result?.status).toBe('failed')
        expect(result?.attemptCount).toBe(2)
        expect(result?.id).toBe('del_test_delivery_001')
      })

      it('should return null for non-existent delivery', async () => {
        const result = await webhookStorage.updateDelivery('non-existent', {
          status: 'failed',
        })

        expect(result).toBeNull()
      })
    })

    describe('getDeliveriesByWebhookId', () => {
      it('should return deliveries for webhook', async () => {
        const delivery2: WebhookDelivery = {
          ...mockDelivery,
          id: 'del_test_delivery_002',
          webhookId: 'wh_test_webhook_001',
        }

        const delivery3: WebhookDelivery = {
          ...mockDelivery,
          id: 'del_test_delivery_003',
          webhookId: 'wh_test_webhook_002',
        }

        await webhookStorage.createDelivery(mockDelivery)
        await webhookStorage.createDelivery(delivery2)
        await webhookStorage.createDelivery(delivery3)

        const result = await webhookStorage.getDeliveriesByWebhookId(
          'wh_test_webhook_001'
        )

        expect(result.length).toBeGreaterThanOrEqual(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'del_test_delivery_001',
              webhookId: 'wh_test_webhook_001',
            }),
            expect.objectContaining({
              id: 'del_test_delivery_002',
              webhookId: 'wh_test_webhook_001',
            }),
          ])
        )
        expect(result).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'del_test_delivery_003',
            }),
          ])
        )
      })
    })
  })

  describe('API Key Methods', () => {
    describe('createApiKey', () => {
      it('should create a new API key', async () => {
        const result = await webhookStorage.createApiKey(mockApiKey)

        expect(result).toMatchObject({
          id: 'ak_test_apikey_001',
          name: 'Test API Key',
          key: 'sk_test_123456',
          userId: 'user_1',
          permissions: ['read', 'write'],
          active: true,
          expiresAt: undefined,
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
        expect(await webhookStorage.getAllApiKeys()).toHaveLength(1)
      })
    })

    describe('getApiKeyById', () => {
      it('should return API key by id', async () => {
        await webhookStorage.createApiKey(mockApiKey)

        const result = await webhookStorage.getApiKeyById('ak_test_apikey_001')

        expect(result).toMatchObject({
          id: 'ak_test_apikey_001',
          name: 'Test API Key',
          key: 'sk_test_123456',
          userId: 'user_1',
          permissions: ['read', 'write'],
          active: true,
          expiresAt: undefined,
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return undefined for non-existent API key', async () => {
        const result = await webhookStorage.getApiKeyById('non-existent')

        expect(result).toBeNull()
      })
    })

    describe('getApiKeyByValue', () => {
      it('should return API key by value', async () => {
        await webhookStorage.createApiKey(mockApiKey)

        const result = await webhookStorage.getApiKeyByValue('sk_test_123456')

        expect(result).toMatchObject({
          id: 'ak_test_apikey_001',
          name: 'Test API Key',
          key: 'sk_test_123456',
          userId: 'user_1',
          permissions: ['read', 'write'],
          active: true,
          expiresAt: undefined,
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return undefined for non-existent API key value', async () => {
        const result = await webhookStorage.getApiKeyByValue('sk_non_existent')

        expect(result).toBeNull()
      })
    })

    describe('getAllApiKeys', () => {
      it('should return all API keys', async () => {
        const apiKey2: ApiKey = {
          ...mockApiKey,
          id: 'ak_test_apikey_002',
          key: 'sk_test_789',
        }

        await webhookStorage.createApiKey(mockApiKey)
        await webhookStorage.createApiKey(apiKey2)

        const result = await webhookStorage.getAllApiKeys()

        expect(result).toHaveLength(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'ak_test_apikey_001',
              key: 'sk_test_123456',
            }),
            expect.objectContaining({
              id: 'ak_test_apikey_002',
              key: 'sk_test_789',
            }),
          ])
        )
      })
    })

    describe('updateApiKey', () => {
      it('should update API key with partial data', async () => {
        await webhookStorage.createApiKey(mockApiKey)

        const result = await webhookStorage.updateApiKey('ak_test_apikey_001', {
          active: false,
        })

        expect(result?.active).toBe(false)
        expect(result?.id).toBe('ak_test_apikey_001')
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return null for non-existent API key', async () => {
        const result = await webhookStorage.updateApiKey('non-existent', {
          active: false,
        })

        expect(result).toBeNull()
      })
    })

    describe('deleteApiKey', () => {
      it('should delete API key by id', async () => {
        await webhookStorage.createApiKey(mockApiKey)

        const result = await webhookStorage.deleteApiKey('ak_test_apikey_001')

        expect(result).toBe(true)
        expect(
          await webhookStorage.getApiKeyById('ak_test_apikey_001')
        ).toBeNull()
      })

      it('should return false for non-existent API key', async () => {
        const result = await webhookStorage.deleteApiKey('non-existent')

        expect(result).toBe(false)
      })
    })
  })

  describe('Queue Methods', () => {
    describe('addToQueue', () => {
      it('should add item to queue', async () => {
        const result = await webhookStorage.addToQueue(mockQueueItem)

        expect(result).toMatchObject({
          id: 'q_001',
          webhookId: 'wh_123',
          event: 'resource.created',
          priority: 0,
          retryCount: 0,
          maxRetries: 3,
        })
        expect(result?.payload).toEqual(mockQueueItem.payload)
        expect(result?.scheduledFor).toBeDefined()
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
        expect(await webhookStorage.getQueue()).toHaveLength(1)
      })
    })

    describe('getQueue', () => {
      it('should return queue sorted by scheduledFor', async () => {
        const item1: WebhookQueueItem = {
          ...mockQueueItem,
          id: 'q_001',
          scheduledFor: '2024-01-01T00:00:10.000Z',
        }
        const item2: WebhookQueueItem = {
          ...mockQueueItem,
          id: 'q_002',
          scheduledFor: '2024-01-01T00:00:05.000Z',
        }
        const item3: WebhookQueueItem = {
          ...mockQueueItem,
          id: 'q_003',
          scheduledFor: '2024-01-01T00:00:15.000Z',
        }

        await webhookStorage.addToQueue(item1)
        await webhookStorage.addToQueue(item2)
        await webhookStorage.addToQueue(item3)

        const result = await webhookStorage.getQueue()

        expect(result).toHaveLength(3)
        expect(result[0]).toMatchObject({
          id: 'q_002',
          scheduledFor: expect.any(String),
        })
        expect(result[1]).toMatchObject({
          id: 'q_001',
          scheduledFor: expect.any(String),
        })
        expect(result[2]).toMatchObject({
          id: 'q_003',
          scheduledFor: expect.any(String),
        })
      })

      it('should return empty array when queue is empty', async () => {
        const result = await webhookStorage.getQueue()

        expect(result).toEqual([])
      })
    })

    describe('getQueueItemById', () => {
      it('should return queue item by id', async () => {
        await webhookStorage.addToQueue(mockQueueItem)

        const result = await webhookStorage.getQueueItemById('q_001')

        expect(result).toMatchObject({
          id: 'q_001',
          webhookId: 'wh_123',
          event: 'resource.created',
          priority: 0,
          retryCount: 0,
          maxRetries: 3,
        })
        expect(result?.payload).toEqual(mockQueueItem.payload)
        expect(result?.scheduledFor).toBeDefined()
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return undefined for non-existent queue item', async () => {
        const result = await webhookStorage.getQueueItemById('non-existent')

        expect(result).toBeNull()
      })
    })

    describe('removeFromQueue', () => {
      it('should remove item from queue', async () => {
        await webhookStorage.addToQueue(mockQueueItem)

        const result = await webhookStorage.removeFromQueue('q_001')

        expect(result).toBe(true)
        expect(await webhookStorage.getQueue()).toHaveLength(0)
      })

      it('should return false for non-existent queue item', async () => {
        const result = await webhookStorage.removeFromQueue('non-existent')

        expect(result).toBe(false)
      })
    })
  })

  describe('Dead Letter Queue Methods', () => {
    describe('addToDeadLetterQueue', () => {
      it('should add item to dead letter queue', async () => {
        const result =
          await webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)

        expect(result).toMatchObject({
          id: 'dl_001',
          webhookId: 'wh_123',
          event: 'resource.created',
          failureReason: 'Max retries exceeded',
        })
        expect(result?.payload).toEqual(mockDeadLetterItem.payload)
        expect(result?.lastAttemptAt).toBeDefined()
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
        expect(await webhookStorage.getDeadLetterQueue()).toHaveLength(1)
      })
    })

    describe('getDeadLetterQueue', () => {
      it('should return all dead letter items', async () => {
        const item2: DeadLetterWebhook = {
          ...mockDeadLetterItem,
          id: 'dl_002',
        }

        await webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)
        await webhookStorage.addToDeadLetterQueue(item2)

        const result = await webhookStorage.getDeadLetterQueue()

        expect(result).toHaveLength(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'dl_001',
              webhookId: 'wh_123',
            }),
            expect.objectContaining({
              id: 'dl_002',
              webhookId: 'wh_123',
            }),
          ])
        )
      })

      it('should return empty array when dead letter queue is empty', async () => {
        const result = await webhookStorage.getDeadLetterQueue()

        expect(result).toEqual([])
      })
    })

    describe('getDeadLetterWebhookById', () => {
      it('should return dead letter item by id', async () => {
        await webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)

        const result = await webhookStorage.getDeadLetterWebhookById('dl_001')

        expect(result).toMatchObject({
          id: 'dl_001',
          webhookId: 'wh_123',
          event: 'resource.created',
          failureReason: 'Max retries exceeded',
        })
        expect(result?.payload).toEqual(mockDeadLetterItem.payload)
        expect(result?.lastAttemptAt).toBeDefined()
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return undefined for non-existent dead letter item', async () => {
        const result =
          await webhookStorage.getDeadLetterWebhookById('non-existent')

        expect(result).toBeNull()
      })
    })

    describe('removeFromDeadLetterQueue', () => {
      it('should remove item from dead letter queue', async () => {
        await webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)

        const result = await webhookStorage.removeFromDeadLetterQueue('dl_001')

        expect(result).toBe(true)
        expect(await webhookStorage.getDeadLetterQueue()).toHaveLength(0)
      })

      it('should return false for non-existent dead letter item', async () => {
        const result =
          await webhookStorage.removeFromDeadLetterQueue('non-existent')

        expect(result).toBe(false)
      })
    })
  })

  describe('Idempotency Methods', () => {
    describe('setDeliveryByIdempotencyKey', () => {
      it('should set delivery by idempotency key', async () => {
        const createdDelivery =
          await webhookStorage.createDelivery(mockDelivery)
        const result = await webhookStorage.setDeliveryByIdempotencyKey(
          'key_123',
          createdDelivery
        )

        expect(result).toMatchObject({
          id: createdDelivery.id,
          webhookId: 'wh_test_webhook_001',
          event: 'resource.created',
          status: 'success',
          statusCode: 200,
          attemptCount: 1,
          idempotencyKey: null,
        })
      })
    })

    describe('getDeliveryByIdempotencyKey', () => {
      it('should get delivery by idempotency key', async () => {
        const createdDelivery =
          await webhookStorage.createDelivery(mockDelivery)
        await webhookStorage.setDeliveryByIdempotencyKey(
          'key_123',
          createdDelivery
        )

        const result =
          await webhookStorage.getDeliveryByIdempotencyKey('key_123')

        expect(result).toMatchObject({
          id: createdDelivery.id,
          webhookId: 'wh_test_webhook_001',
          event: 'resource.created',
          status: 'success',
          statusCode: 200,
          attemptCount: 1,
          idempotencyKey: null,
        })
        expect(result?.payload).toEqual(mockDelivery.payload)
      })

      it('should return undefined for non-existent idempotency key', async () => {
        const result =
          await webhookStorage.getDeliveryByIdempotencyKey('non-existent')

        expect(result).toBeNull()
      })
    })

    describe('hasDeliveryWithIdempotencyKey', () => {
      it('should return true when idempotency key exists', async () => {
        const createdDelivery =
          await webhookStorage.createDelivery(mockDelivery)
        await webhookStorage.setDeliveryByIdempotencyKey(
          'key_123',
          createdDelivery
        )

        const result =
          await webhookStorage.hasDeliveryWithIdempotencyKey('key_123')

        expect(result).toBe(true)
      })

      it('should return false when idempotency key does not exist', async () => {
        const result =
          await webhookStorage.hasDeliveryWithIdempotencyKey('non-existent')

        expect(result).toBe(false)
      })
    })

    describe('Idempotency Key Overwrite', () => {
      it('should overwrite delivery for existing idempotency key', async () => {
        const createdDelivery =
          await webhookStorage.createDelivery(mockDelivery)
        await webhookStorage.setDeliveryByIdempotencyKey(
          'key_123',
          createdDelivery
        )

        const newDelivery: WebhookDelivery = {
          ...mockDelivery,
          id: 'del_test_delivery_002',
          webhookId: 'wh_test_webhook_001',
          status: 'failed',
        }

        const createdNewDelivery =
          await webhookStorage.createDelivery(newDelivery)
        const result = await webhookStorage.setDeliveryByIdempotencyKey(
          'key_123',
          createdNewDelivery
        )

        expect(result).toMatchObject({
          id: createdNewDelivery.id,
          webhookId: 'wh_test_webhook_001',
          event: 'resource.created',
          status: 'failed',
        })
        expect(
          await webhookStorage.getDeliveryByIdempotencyKey('key_123')
        ).toMatchObject({
          id: createdNewDelivery.id,
          webhookId: 'wh_test_webhook_001',
          event: 'resource.created',
          status: 'failed',
        })
      })
    })
  })
})
