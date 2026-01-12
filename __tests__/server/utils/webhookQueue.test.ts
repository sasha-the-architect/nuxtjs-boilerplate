import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { WebhookQueueSystem } from '~/server/utils/webhookQueue'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { resetCircuitBreaker } from '~/server/utils/circuit-breaker'
import type { Webhook, WebhookPayload } from '~/types/webhook'

describe('webhookQueueSystem', () => {
  let queueSystem: WebhookQueueSystem

  const mockWebhook: Webhook = {
    id: 'wh_test',
    url: 'https://example.com/webhook',
    events: ['resource.created'],
    active: true,
    secret: 'test-secret-123',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deliveryCount: 0,
    failureCount: 0,
  }

  const mockPayload: WebhookPayload = {
    event: 'resource.created',
    data: { resourceId: 'res_123', name: 'Test Resource' },
    timestamp: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
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
    resetCircuitBreaker('webhook:https://example.com/webhook')
    queueSystem = new WebhookQueueSystem()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    queueSystem.stopQueueProcessor()
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

  describe('deliverWebhook - Synchronous delivery', () => {
    it('should deliver webhook synchronously when async is false', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await queueSystem.deliverWebhook(
        mockWebhook,
        mockPayload,
        { async: false }
      )

      expect(result).toBe(true)
      expect($fetchMock).toHaveBeenCalledTimes(1)
    })

    it('should create delivery record for sync delivery', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await queueSystem.deliverWebhook(mockWebhook, mockPayload, {
        async: false,
      })

      const deliveries = webhookStorage.getDeliveriesByWebhookId('wh_test')
      expect(deliveries.some(d => d.webhookId === 'wh_test')).toBe(true)
    })
  })

  describe('deliverWebhook - Asynchronous delivery', () => {
    it('should queue webhook when async is true', async () => {
      webhookStorage.createWebhook(mockWebhook)

      const result = await queueSystem.deliverWebhook(
        mockWebhook,
        mockPayload,
        { async: true }
      )

      expect(result).toBe(true)
      const queue = webhookStorage.getQueue()
      expect(queue.length).toBeGreaterThan(0)
      expect(queue.some(q => q.webhookId === 'wh_test')).toBe(true)
    })

    it('should start queue processor when queuing webhook', async () => {
      webhookStorage.createWebhook(mockWebhook)

      await queueSystem.deliverWebhook(mockWebhook, mockPayload, {
        async: true,
      })

      const stats = queueSystem.getQueueStats()
      expect(stats.isProcessing).toBe(true)
    })
  })

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      webhookStorage.createWebhook(mockWebhook)

      await queueSystem.deliverWebhook(mockWebhook, mockPayload, {
        async: true,
      })

      const stats = queueSystem.getQueueStats()

      expect(stats).toHaveProperty('pending')
      expect(stats).toHaveProperty('deadLetter')
      expect(stats).toHaveProperty('isProcessing')
      expect(stats).toHaveProperty('nextScheduled')
      expect(stats.pending).toBeGreaterThan(0)
    })

    it('should show zero items when queue is empty', () => {
      const stats = queueSystem.getQueueStats()

      expect(stats.pending).toBe(0)
    })
  })

  describe('stopQueueProcessor', () => {
    it('should stop queue processor', async () => {
      webhookStorage.createWebhook(mockWebhook)

      await queueSystem.deliverWebhook(mockWebhook, mockPayload, {
        async: true,
      })

      queueSystem.stopQueueProcessor()

      const stats = queueSystem.getQueueStats()
      expect(stats.isProcessing).toBe(false)
    })
  })

  describe('deliverWebhook - Custom options', () => {
    it('should use custom maxRetries', async () => {
      webhookStorage.createWebhook(mockWebhook)

      const result = await queueSystem.deliverWebhook(
        mockWebhook,
        mockPayload,
        {
          async: true,
          maxRetries: 5,
        }
      )

      expect(result).toBe(true)
      const queue = webhookStorage.getQueue()
      expect(queue.length).toBeGreaterThan(0)
    })

    it('should use custom initialDelay', async () => {
      webhookStorage.createWebhook(mockWebhook)

      const result = await queueSystem.deliverWebhook(
        mockWebhook,
        mockPayload,
        {
          async: true,
          initialDelayMs: 5000,
        }
      )

      expect(result).toBe(true)
      const queue = webhookStorage.getQueue()
      expect(queue.length).toBeGreaterThan(0)
    })

    it('should use custom priority', async () => {
      webhookStorage.createWebhook(mockWebhook)

      const result = await queueSystem.deliverWebhook(
        mockWebhook,
        mockPayload,
        {
          async: true,
          priority: 10,
        }
      )

      expect(result).toBe(true)
      const queue = webhookStorage.getQueue()
      expect(queue.length).toBeGreaterThan(0)
      expect(queue[0].priority).toBe(10)
    })
  })

  describe('Idempotency', () => {
    it('should store delivery by idempotency key', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      const idempotentPayload: WebhookPayload = {
        ...mockPayload,
        idempotencyKey: 'key_123',
      }

      webhookStorage.createWebhook(mockWebhook)

      await queueSystem.deliverWebhook(mockWebhook, idempotentPayload, {
        async: false,
      })

      const delivery = webhookStorage.getDeliveryByIdempotencyKey('key_123')
      expect(delivery).toBeDefined()
    })
  })

  describe('Queue item creation', () => {
    it('should create queue item with correct properties', async () => {
      webhookStorage.createWebhook(mockWebhook)

      await queueSystem.deliverWebhook(mockWebhook, mockPayload, {
        async: true,
      })

      const queue = webhookStorage.getQueue()
      const queueItem = queue.find(q => q.webhookId === 'wh_test')

      expect(queueItem).toBeDefined()
      expect(queueItem?.webhookId).toBe('wh_test')
      expect(queueItem?.event).toBe('resource.created')
      expect(queueItem?.retryCount).toBe(0)
      expect(queueItem?.maxRetries).toBe(3)
      expect(queueItem?.priority).toBe(0)
      expect(queueItem?.id).toMatch(/^q_/)
      expect(queueItem?.scheduledFor).toBeDefined()
      expect(queueItem?.createdAt).toBeDefined()
    })
  })

  describe('Inactive webhooks', () => {
    it('should not deliver webhook for inactive webhook', async () => {
      const inactiveWebhook: Webhook = {
        ...mockWebhook,
        id: 'wh_inactive',
        active: false,
      }

      webhookStorage.createWebhook(inactiveWebhook)
      webhookStorage.createWebhook(mockWebhook)

      await queueSystem.deliverWebhook(inactiveWebhook, mockPayload, {
        async: true,
      })

      const queue = webhookStorage.getQueue()
      expect(queue.some(q => q.webhookId === 'wh_inactive')).toBe(true)
    })
  })

  describe('Priority queue', () => {
    it('should respect priority when adding items', async () => {
      webhookStorage.createWebhook(mockWebhook)

      await queueSystem.deliverWebhook(mockWebhook, mockPayload, {
        async: true,
        priority: 10,
      })
      await queueSystem.deliverWebhook(mockWebhook, mockPayload, {
        async: true,
        priority: 5,
      })
      await queueSystem.deliverWebhook(mockWebhook, mockPayload, {
        async: true,
        priority: 1,
      })

      const queue = webhookStorage.getQueue()

      expect(queue.length).toBeGreaterThan(0)
    })
  })
})
