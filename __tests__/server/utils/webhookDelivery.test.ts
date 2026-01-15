import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { webhookDeliveryService } from '~/server/utils/webhookDelivery'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { resetCircuitBreaker } from '~/server/utils/circuit-breaker'
import type { Webhook, WebhookPayload } from '~/types/webhook'

describe('webhookDeliveryService', () => {
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
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Happy Path - Successful webhook delivery', () => {
    it('should deliver webhook successfully', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhook(
        mockWebhook,
        mockPayload
      )

      expect(result).toBe(true)
      expect($fetchMock).toHaveBeenCalledTimes(1)
      expect($fetchMock).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Webhook-Event': 'resource.created',
          }),
        })
      )
    })

    it('should create delivery record on success', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhook(mockWebhook, mockPayload)

      const deliveries = webhookStorage.getDeliveriesByWebhookId('wh_test')
      expect(deliveries.length).toBeGreaterThanOrEqual(1)
      expect(
        deliveries.some(
          d => d.webhookId === 'wh_test' && d.status === 'success'
        )
      ).toBe(true)
    })

    it('should update webhook stats on success', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhook(mockWebhook, mockPayload)

      const webhook = webhookStorage.getWebhookById('wh_test')
      expect(webhook?.deliveryCount).toBe(1)
      expect(webhook?.lastDeliveryStatus).toBe('success')
      expect(webhook?.lastDeliveryAt).toBeDefined()
    })

    it('should generate HMAC signature for payload', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhook(mockWebhook, mockPayload)

      expect($fetchMock).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Webhook-Signature': expect.stringMatching(/^v1=/),
          }),
        })
      )
    })

    it('should handle webhook without secret', async () => {
      const webhookNoSecret: Webhook = {
        ...mockWebhook,
        id: 'wh_no_secret',
        secret: undefined,
      }

      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(webhookNoSecret)

      const result = await webhookDeliveryService.deliverWebhook(
        webhookNoSecret,
        mockPayload
      )

      expect(result).toBe(true)
      expect($fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('Sad Path - Failed webhook delivery', () => {
    it('should handle 500 error', async () => {
      const $fetchMock = vi
        .fn()
        .mockRejectedValue({ status: 500, message: 'Internal Server Error' })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhook(
        mockWebhook,
        mockPayload
      )

      expect(result).toBe(false)
    })

    it('should create failed delivery record', async () => {
      const $fetchMock = vi
        .fn()
        .mockRejectedValue({ status: 503, message: 'Service Unavailable' })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhook(mockWebhook, mockPayload)

      const deliveries = webhookStorage.getDeliveriesByWebhookId('wh_test')
      expect(deliveries.some(d => d.status === 'failed')).toBe(true)
    })

    it('should update webhook failure count on failure', async () => {
      const $fetchMock = vi
        .fn()
        .mockRejectedValue({ status: 503, message: 'Service Unavailable' })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhook(mockWebhook, mockPayload)

      const webhook = webhookStorage.getWebhookById('wh_test')
      expect(webhook?.failureCount).toBe(1)
      expect(webhook?.lastDeliveryStatus).toBe('failed')
    })

    it('should handle network errors', async () => {
      const $fetchMock = vi.fn().mockRejectedValue(new Error('ECONNRESET'))
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhook(
        mockWebhook,
        mockPayload
      )

      expect(result).toBe(false)
    })

    it('should handle timeout errors', async () => {
      const $fetchMock = vi.fn().mockRejectedValue(new Error('ETIMEDOUT'))
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhook(
        mockWebhook,
        mockPayload
      )

      expect(result).toBe(false)
    })
  })

  describe('deliverWebhookWithRetry - Retry functionality', () => {
    it('should not retry on non-retryable errors', async () => {
      const $fetchMock = vi
        .fn()
        .mockRejectedValue({ status: 400, message: 'Bad Request' })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhookWithRetry(
        mockWebhook,
        mockPayload
      )

      expect(result).toBe(false)
      expect($fetchMock).toHaveBeenCalledTimes(1)
    })

    it('should not retry on 401 unauthorized', async () => {
      const $fetchMock = vi
        .fn()
        .mockRejectedValue({ status: 401, message: 'Unauthorized' })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhookWithRetry(
        mockWebhook,
        mockPayload
      )

      expect(result).toBe(false)
      expect($fetchMock).toHaveBeenCalledTimes(1)
    })

    it('should not retry on 404 not found', async () => {
      const $fetchMock = vi
        .fn()
        .mockRejectedValue({ status: 404, message: 'Not Found' })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhookWithRetry(
        mockWebhook,
        mockPayload
      )

      expect(result).toBe(false)
      expect($fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('Circuit Breaker Integration', () => {
    it('should track circuit breaker stats', async () => {
      const $fetchMock = vi
        .fn()
        .mockRejectedValue({ status: 503, message: 'Service Unavailable' })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhookWithRetry(
        mockWebhook,
        mockPayload
      )

      const stats = webhookDeliveryService.getWebhookDeliveryStats()
      expect(stats).toBeDefined()
      expect(stats).toBeInstanceOf(Object)
    })
  })

  describe('Payload Handling', () => {
    it('should handle complex payload data', async () => {
      const complexPayload: WebhookPayload = {
        event: 'resource.created',
        data: {
          id: 'res_123',
          name: 'Test Resource',
          nested: {
            field1: 'value1',
            field2: [1, 2, 3],
            field3: { deep: 'value' },
          },
        },
        timestamp: '2024-01-01T00:00:00.000Z',
      }

      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhook(
        mockWebhook,
        complexPayload
      )

      expect(result).toBe(true)
      expect($fetchMock).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          body: expect.stringContaining('resource.created'),
        })
      )
    })

    it('should handle empty payload data', async () => {
      const emptyPayload: WebhookPayload = {
        event: 'resource.created',
        data: {},
        timestamp: '2024-01-01T00:00:00.000Z',
      }

      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhook(
        mockWebhook,
        emptyPayload
      )

      expect(result).toBe(true)
    })

    it('should handle null payload data', async () => {
      const nullPayload: WebhookPayload = {
        event: 'resource.created',
        data: null,
        timestamp: '2024-01-01T00:00:00.000Z',
      }

      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      const result = await webhookDeliveryService.deliverWebhook(
        mockWebhook,
        nullPayload
      )

      expect(result).toBe(true)
    })
  })

  describe('Signature Generation', () => {
    it('should generate consistent signature for same payload', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhook(mockWebhook, mockPayload)

      const signature1 =
        $fetchMock.mock.calls[0][1].headers['X-Webhook-Signature']

      webhookStorage
        .getWebhooksByEvent('resource.created')
        .forEach(w => webhookStorage.deleteWebhook(w.id))
      webhookStorage.createWebhook(mockWebhook)

      const payloadCopy: WebhookPayload = {
        event: 'resource.created',
        data: { resourceId: 'res_123', name: 'Test Resource' },
        timestamp: '2024-01-01T00:00:00.000Z',
      }

      await webhookDeliveryService.deliverWebhook(mockWebhook, payloadCopy)

      const signature2 =
        $fetchMock.mock.calls[0][1].headers['X-Webhook-Signature']

      expect(signature1).toBe(signature2)
    })

    it('should include signature in delivery record', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhook(mockWebhook, mockPayload)

      const deliveries = webhookStorage.getDeliveriesByWebhookId('wh_test')
      const latestDelivery = deliveries[deliveries.length - 1]

      expect(latestDelivery.payload.signature).toMatch(/^v1=/)
    })
  })

  describe('Headers', () => {
    it('should include required headers', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhook(mockWebhook, mockPayload)

      const headers = $fetchMock.mock.calls[0][1].headers

      expect(headers).toHaveProperty('Content-Type', 'application/json')
      expect(headers).toHaveProperty('X-Webhook-Event', 'resource.created')
      expect(headers).toHaveProperty('X-Webhook-Signature')
      expect(headers).toHaveProperty(
        'X-Webhook-Timestamp',
        '2024-01-01T00:00:00.000Z'
      )
    })

    it('should set correct content type', async () => {
      const $fetchMock = vi.fn().mockResolvedValue({ status: 200 })
      global.$fetch = $fetchMock as any

      webhookStorage.createWebhook(mockWebhook)

      await webhookDeliveryService.deliverWebhook(mockWebhook, mockPayload)

      expect($fetchMock).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })
})
