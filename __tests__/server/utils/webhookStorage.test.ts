import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { webhookStorage } from '~/server/utils/webhookStorage'
import type {
  Webhook,
  WebhookDelivery,
  ApiKey,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'

describe('webhookStorage', () => {
  const mockWebhook: Webhook = {
    id: 'wh_123',
    url: 'https://example.com/webhook',
    events: ['resource.created', 'resource.updated'],
    active: true,
    secret: 'test-secret',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    lastDeliveryAt: '2024-01-01T00:00:00.000Z',
    lastDeliveryStatus: 'success',
    deliveryCount: 5,
    failureCount: 1,
  }

  const mockDelivery: WebhookDelivery = {
    id: 'del_456',
    webhookId: 'wh_123',
    event: 'resource.created',
    payload: {
      event: 'resource.created',
      data: { id: 'res_1' },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
    status: 'success',
    responseCode: 200,
    responseMessage: 'OK',
    attemptCount: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    completedAt: '2024-01-01T00:00:01.000Z',
  }

  const mockApiKey: ApiKey = {
    id: 'ak_789',
    name: 'Test API Key',
    key: 'sk_test_123456',
    userId: 'user_1',
    permissions: ['read', 'write'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    active: true,
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
    deliveryAttempts: [],
  }

  beforeEach(() => {
    webhookStorage
      .getAllWebhooks()
      .forEach(w => webhookStorage.deleteWebhook(w.id))
    webhookStorage
      .getAllApiKeys()
      .forEach(k => webhookStorage.deleteApiKey(k.id))
    webhookStorage.getQueue().forEach(q => webhookStorage.removeFromQueue(q.id))
    webhookStorage
      .getDeadLetterQueue()
      .forEach(dl => webhookStorage.removeFromDeadLetterQueue(dl.id))
  })

  afterEach(() => {
    webhookStorage
      .getAllWebhooks()
      .forEach(w => webhookStorage.deleteWebhook(w.id))
    webhookStorage
      .getAllDeliveries()
      .forEach(d => webhookStorage.deleteWebhook(d.id))
    webhookStorage
      .getAllApiKeys()
      .forEach(k => webhookStorage.deleteApiKey(k.id))
    webhookStorage.getQueue().forEach(q => webhookStorage.removeFromQueue(q.id))
    webhookStorage
      .getDeadLetterQueue()
      .forEach(dl => webhookStorage.removeFromDeadLetterQueue(dl.id))
  })

  describe('Webhook Methods', () => {
    describe('createWebhook', () => {
      it('should create a new webhook', () => {
        const result = webhookStorage.createWebhook(mockWebhook)

        expect(result).toEqual(mockWebhook)
        expect(webhookStorage.getAllWebhooks()).toHaveLength(1)
      })

      it('should create multiple webhooks', () => {
        const webhook2: Webhook = {
          ...mockWebhook,
          id: 'wh_456',
          url: 'https://example2.com/webhook',
        }

        webhookStorage.createWebhook(mockWebhook)
        webhookStorage.createWebhook(webhook2)

        expect(webhookStorage.getAllWebhooks()).toHaveLength(2)
      })
    })

    describe('getWebhookById', () => {
      it('should return webhook by id', () => {
        webhookStorage.createWebhook(mockWebhook)

        const result = webhookStorage.getWebhookById('wh_123')

        expect(result).toEqual(mockWebhook)
      })

      it('should return undefined for non-existent webhook', () => {
        const result = webhookStorage.getWebhookById('non-existent')

        expect(result).toBeUndefined()
      })
    })

    describe('getAllWebhooks', () => {
      it('should return all webhooks', () => {
        const webhook2: Webhook = {
          ...mockWebhook,
          id: 'wh_456',
          url: 'https://example2.com/webhook',
        }

        webhookStorage.createWebhook(mockWebhook)
        webhookStorage.createWebhook(webhook2)

        const result = webhookStorage.getAllWebhooks()

        expect(result).toHaveLength(2)
        expect(result).toContainEqual(mockWebhook)
        expect(result).toContainEqual(webhook2)
      })

      it('should return empty array when no webhooks exist', () => {
        const result = webhookStorage.getAllWebhooks()

        expect(result).toEqual([])
      })
    })

    describe('updateWebhook', () => {
      it('should update webhook with partial data', () => {
        webhookStorage.createWebhook(mockWebhook)

        const result = webhookStorage.updateWebhook('wh_123', {
          active: false,
          failureCount: 2,
        })

        expect(result?.active).toBe(false)
        expect(result?.failureCount).toBe(2)
        expect(result?.id).toBe('wh_123')
        expect(result?.url).toBe(mockWebhook.url)
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return null for non-existent webhook', () => {
        const result = webhookStorage.updateWebhook('non-existent', {
          active: false,
        })

        expect(result).toBeNull()
      })
    })

    describe('deleteWebhook', () => {
      it('should delete webhook by id', () => {
        webhookStorage.createWebhook(mockWebhook)

        const result = webhookStorage.deleteWebhook('wh_123')

        expect(result).toBe(true)
        expect(webhookStorage.getWebhookById('wh_123')).toBeUndefined()
      })

      it('should return false for non-existent webhook', () => {
        const result = webhookStorage.deleteWebhook('non-existent')

        expect(result).toBe(false)
      })
    })

    describe('getWebhooksByEvent', () => {
      it('should return webhooks that match event', () => {
        const webhook2: Webhook = {
          ...mockWebhook,
          id: 'wh_456',
          events: ['resource.deleted'],
          active: true,
        }

        webhookStorage.createWebhook(mockWebhook)
        webhookStorage.createWebhook(webhook2)

        const result = webhookStorage.getWebhooksByEvent('resource.created')

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual(mockWebhook)
      })

      it('should only return active webhooks', () => {
        const inactiveWebhook: Webhook = {
          ...mockWebhook,
          id: 'wh_456',
          active: false,
        }

        webhookStorage.createWebhook(mockWebhook)
        webhookStorage.createWebhook(inactiveWebhook)

        const result = webhookStorage.getWebhooksByEvent('resource.created')

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual(mockWebhook)
      })

      it('should return empty array when no webhooks match event', () => {
        webhookStorage.createWebhook(mockWebhook)

        const result = webhookStorage.getWebhooksByEvent('user.registered')

        expect(result).toEqual([])
      })
    })
  })

  describe('Delivery Methods', () => {
    describe('createDelivery', () => {
      it('should create a new delivery', () => {
        const result = webhookStorage.createDelivery(mockDelivery)

        expect(result).toEqual(mockDelivery)
        expect(webhookStorage.getAllDeliveries()).toHaveLength(1)
      })
    })

    describe('getDeliveryById', () => {
      it('should return delivery by id', () => {
        webhookStorage.createDelivery(mockDelivery)

        const result = webhookStorage.getDeliveryById('del_456')

        expect(result).toEqual(mockDelivery)
      })

      it('should return undefined for non-existent delivery', () => {
        const result = webhookStorage.getDeliveryById('non-existent')

        expect(result).toBeUndefined()
      })
    })

    describe('getAllDeliveries', () => {
      it('should return all deliveries', () => {
        const delivery2: WebhookDelivery = {
          ...mockDelivery,
          id: 'del_789_unique',
          webhookId: 'wh_456',
        }

        webhookStorage.createDelivery(mockDelivery)
        webhookStorage.createDelivery(delivery2)

        const result = webhookStorage.getAllDeliveries()

        expect(result.length).toBeGreaterThanOrEqual(2)
        expect(result).toContainEqual(mockDelivery)
        expect(result).toContainEqual(delivery2)
      })
    })

    describe('updateDelivery', () => {
      it('should update delivery with partial data', () => {
        webhookStorage.createDelivery(mockDelivery)

        const result = webhookStorage.updateDelivery('del_456', {
          status: 'failed',
          attemptCount: 2,
        })

        expect(result?.status).toBe('failed')
        expect(result?.attemptCount).toBe(2)
        expect(result?.id).toBe('del_456')
      })

      it('should return null for non-existent delivery', () => {
        const result = webhookStorage.updateDelivery('non-existent', {
          status: 'failed',
        })

        expect(result).toBeNull()
      })
    })

    describe('getDeliveriesByWebhookId', () => {
      it('should return deliveries for webhook', () => {
        const delivery2: WebhookDelivery = {
          ...mockDelivery,
          id: 'del_789_unique2',
          webhookId: 'wh_123',
        }

        const delivery3: WebhookDelivery = {
          ...mockDelivery,
          id: 'del_999_unique3',
          webhookId: 'wh_456_unique',
        }

        webhookStorage.createDelivery(mockDelivery)
        webhookStorage.createDelivery(delivery2)
        webhookStorage.createDelivery(delivery3)

        const result = webhookStorage.getDeliveriesByWebhookId('wh_123')

        expect(result.length).toBeGreaterThanOrEqual(2)
        expect(result).toContainEqual(mockDelivery)
        expect(result).toContainEqual(delivery2)
        expect(result).not.toContainEqual(delivery3)
      })
    })
  })

  describe('API Key Methods', () => {
    describe('createApiKey', () => {
      it('should create a new API key', () => {
        const result = webhookStorage.createApiKey(mockApiKey)

        expect(result).toEqual(mockApiKey)
        expect(webhookStorage.getAllApiKeys()).toHaveLength(1)
      })
    })

    describe('getApiKeyById', () => {
      it('should return API key by id', () => {
        webhookStorage.createApiKey(mockApiKey)

        const result = webhookStorage.getApiKeyById('ak_789')

        expect(result).toEqual(mockApiKey)
      })

      it('should return undefined for non-existent API key', () => {
        const result = webhookStorage.getApiKeyById('non-existent')

        expect(result).toBeUndefined()
      })
    })

    describe('getApiKeyByValue', () => {
      it('should return API key by value', () => {
        webhookStorage.createApiKey(mockApiKey)

        const result = webhookStorage.getApiKeyByValue('sk_test_123456')

        expect(result).toEqual(mockApiKey)
      })

      it('should return undefined for non-existent API key value', () => {
        const result = webhookStorage.getApiKeyByValue('sk_non_existent')

        expect(result).toBeUndefined()
      })
    })

    describe('getAllApiKeys', () => {
      it('should return all API keys', () => {
        const apiKey2: ApiKey = {
          ...mockApiKey,
          id: 'ak_999',
          key: 'sk_test_789',
        }

        webhookStorage.createApiKey(mockApiKey)
        webhookStorage.createApiKey(apiKey2)

        const result = webhookStorage.getAllApiKeys()

        expect(result).toHaveLength(2)
        expect(result).toContainEqual(mockApiKey)
        expect(result).toContainEqual(apiKey2)
      })
    })

    describe('updateApiKey', () => {
      it('should update API key with partial data', () => {
        webhookStorage.createApiKey(mockApiKey)

        const result = webhookStorage.updateApiKey('ak_789', {
          active: false,
          lastUsedAt: '2024-01-01T00:00:00.000Z',
        })

        expect(result?.active).toBe(false)
        expect(result?.lastUsedAt).toBe('2024-01-01T00:00:00.000Z')
        expect(result?.id).toBe('ak_789')
        expect(result?.updatedAt).toBeDefined()
      })

      it('should return null for non-existent API key', () => {
        const result = webhookStorage.updateApiKey('non-existent', {
          active: false,
        })

        expect(result).toBeNull()
      })
    })

    describe('deleteApiKey', () => {
      it('should delete API key by id', () => {
        webhookStorage.createApiKey(mockApiKey)

        const result = webhookStorage.deleteApiKey('ak_789')

        expect(result).toBe(true)
        expect(webhookStorage.getApiKeyById('ak_789')).toBeUndefined()
      })

      it('should return false for non-existent API key', () => {
        const result = webhookStorage.deleteApiKey('non-existent')

        expect(result).toBe(false)
      })
    })
  })

  describe('Queue Methods', () => {
    describe('addToQueue', () => {
      it('should add item to queue', () => {
        const result = webhookStorage.addToQueue(mockQueueItem)

        expect(result).toEqual(mockQueueItem)
        expect(webhookStorage.getQueue()).toHaveLength(1)
      })
    })

    describe('getQueue', () => {
      it('should return queue sorted by scheduledFor', () => {
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

        webhookStorage.addToQueue(item1)
        webhookStorage.addToQueue(item2)
        webhookStorage.addToQueue(item3)

        const result = webhookStorage.getQueue()

        expect(result).toHaveLength(3)
        expect(result[0]).toEqual(item2)
        expect(result[1]).toEqual(item1)
        expect(result[2]).toEqual(item3)
      })

      it('should return empty array when queue is empty', () => {
        const result = webhookStorage.getQueue()

        expect(result).toEqual([])
      })
    })

    describe('getQueueItemById', () => {
      it('should return queue item by id', () => {
        webhookStorage.addToQueue(mockQueueItem)

        const result = webhookStorage.getQueueItemById('q_001')

        expect(result).toEqual(mockQueueItem)
      })

      it('should return undefined for non-existent queue item', () => {
        const result = webhookStorage.getQueueItemById('non-existent')

        expect(result).toBeUndefined()
      })
    })

    describe('removeFromQueue', () => {
      it('should remove item from queue', () => {
        webhookStorage.addToQueue(mockQueueItem)

        const result = webhookStorage.removeFromQueue('q_001')

        expect(result).toBe(true)
        expect(webhookStorage.getQueue()).toHaveLength(0)
      })

      it('should return false for non-existent queue item', () => {
        const result = webhookStorage.removeFromQueue('non-existent')

        expect(result).toBe(false)
      })
    })
  })

  describe('Dead Letter Queue Methods', () => {
    describe('addToDeadLetterQueue', () => {
      it('should add item to dead letter queue', () => {
        const result = webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)

        expect(result).toEqual(mockDeadLetterItem)
        expect(webhookStorage.getDeadLetterQueue()).toHaveLength(1)
      })
    })

    describe('getDeadLetterQueue', () => {
      it('should return all dead letter items', () => {
        const item2: DeadLetterWebhook = {
          ...mockDeadLetterItem,
          id: 'dl_002',
        }

        webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)
        webhookStorage.addToDeadLetterQueue(item2)

        const result = webhookStorage.getDeadLetterQueue()

        expect(result).toHaveLength(2)
        expect(result).toContainEqual(mockDeadLetterItem)
        expect(result).toContainEqual(item2)
      })

      it('should return empty array when dead letter queue is empty', () => {
        const result = webhookStorage.getDeadLetterQueue()

        expect(result).toEqual([])
      })
    })

    describe('getDeadLetterWebhookById', () => {
      it('should return dead letter item by id', () => {
        webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)

        const result = webhookStorage.getDeadLetterWebhookById('dl_001')

        expect(result).toEqual(mockDeadLetterItem)
      })

      it('should return undefined for non-existent dead letter item', () => {
        const result = webhookStorage.getDeadLetterWebhookById('non-existent')

        expect(result).toBeUndefined()
      })
    })

    describe('removeFromDeadLetterQueue', () => {
      it('should remove item from dead letter queue', () => {
        webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)

        const result = webhookStorage.removeFromDeadLetterQueue('dl_001')

        expect(result).toBe(true)
        expect(webhookStorage.getDeadLetterQueue()).toHaveLength(0)
      })

      it('should return false for non-existent dead letter item', () => {
        const result = webhookStorage.removeFromDeadLetterQueue('non-existent')

        expect(result).toBe(false)
      })
    })
  })

  describe('Idempotency Methods', () => {
    describe('setDeliveryByIdempotencyKey', () => {
      it('should set delivery by idempotency key', () => {
        const result = webhookStorage.setDeliveryByIdempotencyKey(
          'key_123',
          mockDelivery
        )

        expect(result).toEqual(mockDelivery)
      })
    })

    describe('getDeliveryByIdempotencyKey', () => {
      it('should get delivery by idempotency key', () => {
        webhookStorage.setDeliveryByIdempotencyKey('key_123', mockDelivery)

        const result = webhookStorage.getDeliveryByIdempotencyKey('key_123')

        expect(result).toEqual(mockDelivery)
      })

      it('should return undefined for non-existent idempotency key', () => {
        const result =
          webhookStorage.getDeliveryByIdempotencyKey('non-existent')

        expect(result).toBeUndefined()
      })
    })

    describe('hasDeliveryWithIdempotencyKey', () => {
      it('should return true when idempotency key exists', () => {
        webhookStorage.setDeliveryByIdempotencyKey('key_123', mockDelivery)

        const result = webhookStorage.hasDeliveryWithIdempotencyKey('key_123')

        expect(result).toBe(true)
      })

      it('should return false when idempotency key does not exist', () => {
        const result =
          webhookStorage.hasDeliveryWithIdempotencyKey('non-existent')

        expect(result).toBe(false)
      })
    })

    describe('Idempotency Key Overwrite', () => {
      it('should overwrite delivery for existing idempotency key', () => {
        webhookStorage.setDeliveryByIdempotencyKey('key_123', mockDelivery)

        const newDelivery: WebhookDelivery = {
          ...mockDelivery,
          id: 'del_999',
          status: 'failed',
        }

        const result = webhookStorage.setDeliveryByIdempotencyKey(
          'key_123',
          newDelivery
        )

        expect(result).toEqual(newDelivery)
        expect(webhookStorage.getDeliveryByIdempotencyKey('key_123')).toEqual(
          newDelivery
        )
      })
    })
  })
})
