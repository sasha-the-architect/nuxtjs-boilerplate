import { describe, it, expect } from 'vitest'
import {
  validateUrlSchema,
  createWebhookSchema,
  updateWebhookSchema,
  createSubmissionSchema,
  updateUserPreferencesSchema,
  searchQuerySchema,
  createApiKeySchema,
  updateApiKeySchema,
  bulkStatusUpdateSchema,
  moderationActionSchema,
  analyticsEventSchema,
} from '~/server/utils/validation-schemas'

describe('Validation Schemas', () => {
  describe('validateUrlSchema', () => {
    it('should validate valid URL', () => {
      const result = validateUrlSchema.safeParse({ url: 'https://example.com' })
      expect(result.success).toBe(true)
    })

    it('should accept optional timeout parameter', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        timeout: 5000,
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional retries parameter', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        retries: 5,
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional retryDelay parameter', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        retryDelay: 1000,
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional useCircuitBreaker parameter', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        useCircuitBreaker: false,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL format', () => {
      const result = validateUrlSchema.safeParse({ url: 'not-a-url' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const errorMessages = result.error.issues.map(i => i.message)
        expect(errorMessages.some(m => m.includes('Invalid URL'))).toBe(true)
      }
    })

    it('should reject negative timeout', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        timeout: -1,
      })
      expect(result.success).toBe(false)
    })

    it('should reject zero timeout', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        timeout: 0,
      })
      expect(result.success).toBe(false)
    })

    it('should reject retries greater than 10', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        retries: 11,
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative retries', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        retries: -1,
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative retryDelay', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        retryDelay: -1,
      })
      expect(result.success).toBe(false)
    })

    it('should provide default values for optional fields', () => {
      const result = validateUrlSchema.safeParse({ url: 'https://example.com' })
      if (result.success) {
        expect(result.data.timeout).toBe(10000)
        expect(result.data.retries).toBe(3)
        expect(result.data.retryDelay).toBe(1000)
        expect(result.data.useCircuitBreaker).toBe(true)
      }
    })

    it('should accept all valid parameters', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com',
        timeout: 15000,
        retries: 5,
        retryDelay: 2000,
        useCircuitBreaker: false,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('createWebhookSchema', () => {
    it('should validate valid webhook', () => {
      const result = createWebhookSchema.safeParse({
        url: 'https://example.com/webhook',
        events: ['resource.created', 'resource.updated'],
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional active parameter', () => {
      const result = createWebhookSchema.safeParse({
        url: 'https://example.com/webhook',
        events: ['resource.created'],
        active: false,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL', () => {
      const result = createWebhookSchema.safeParse({
        url: 'not-a-url',
        events: ['resource.created'],
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty events array', () => {
      const result = createWebhookSchema.safeParse({
        url: 'https://example.com/webhook',
        events: [],
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const errorMessages = result.error.issues.map(i => i.message)
        expect(errorMessages.some(m => m.includes('At least one event'))).toBe(
          true
        )
      }
    })

    it('should accept single event', () => {
      const result = createWebhookSchema.safeParse({
        url: 'https://example.com/webhook',
        events: ['resource.created'],
      })
      expect(result.success).toBe(true)
    })

    it('should accept multiple events', () => {
      const result = createWebhookSchema.safeParse({
        url: 'https://example.com/webhook',
        events: ['resource.created', 'resource.updated', 'resource.deleted'],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('updateWebhookSchema', () => {
    it('should validate with all fields optional', () => {
      const result = updateWebhookSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept url update', () => {
      const result = updateWebhookSchema.safeParse({
        url: 'https://new-url.com/webhook',
      })
      expect(result.success).toBe(true)
    })

    it('should accept events update', () => {
      const result = updateWebhookSchema.safeParse({
        events: ['resource.updated'],
      })
      expect(result.success).toBe(true)
    })

    it('should accept active update', () => {
      const result = updateWebhookSchema.safeParse({ active: false })
      expect(result.success).toBe(true)
    })

    it('should accept multiple field updates', () => {
      const result = updateWebhookSchema.safeParse({
        url: 'https://new-url.com/webhook',
        events: ['resource.updated'],
        active: false,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL', () => {
      const result = updateWebhookSchema.safeParse({ url: 'invalid-url' })
      expect(result.success).toBe(false)
    })

    it('should reject empty events array', () => {
      const result = updateWebhookSchema.safeParse({ events: [] })
      expect(result.success).toBe(false)
    })
  })

  describe('createSubmissionSchema', () => {
    it('should validate valid submission', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test Resource',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: 'Framework',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional tags', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test Resource',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: 'Framework',
        tags: ['frontend', 'vue'],
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional pricingModel', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test Resource',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: 'Framework',
        pricingModel: 'Paid',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional difficulty', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test Resource',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: 'Framework',
        difficulty: 'Advanced',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional technology', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test Resource',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: 'Framework',
        technology: ['TypeScript'],
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional benefits', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test Resource',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: 'Framework',
        benefits: ['Fast', 'Easy to use'],
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing title', () => {
      const result = createSubmissionSchema.safeParse({
        title: '',
        description: 'Description',
        url: 'https://example.com',
        category: 'Framework',
      })
      expect(result.success).toBe(false)
    })

    it('should reject title too long', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'a'.repeat(201),
        description: 'Description',
        url: 'https://example.com',
        category: 'Framework',
      })
      expect(result.success).toBe(false)
    })

    it('should reject description too short', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test',
        description: 'short',
        url: 'https://example.com',
        category: 'Framework',
      })
      expect(result.success).toBe(false)
    })

    it('should reject description too long', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test',
        description: 'a'.repeat(2001),
        url: 'https://example.com',
        category: 'Framework',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid URL', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test',
        description: 'This is a test resource description',
        url: 'not-a-url',
        category: 'Framework',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing category', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: '',
      })
      expect(result.success).toBe(false)
    })

    it('should reject too many tags', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: 'Framework',
        tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
      })
      expect(result.success).toBe(false)
    })

    it('should reject too many technologies', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: 'Framework',
        technology: Array.from({ length: 21 }, (_, i) => `tech${i}`),
      })
      expect(result.success).toBe(false)
    })

    it('should reject too many benefits', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test',
        description: 'This is a test resource description',
        url: 'https://example.com',
        category: 'Framework',
        benefits: Array.from({ length: 11 }, (_, i) => `benefit${i}`),
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid pricingModel values', () => {
      const validPricingModels = ['Free', 'Freemium', 'Paid', 'Open Source']
      for (const pricingModel of validPricingModels) {
        const result = createSubmissionSchema.safeParse({
          title: 'Test',
          description: 'This is a test resource description',
          url: 'https://example.com',
          category: 'Framework',
          pricingModel,
        })
        expect(result.success).toBe(true)
      }
    })

    it('should accept valid difficulty values', () => {
      const validDifficulties = ['Beginner', 'Intermediate', 'Advanced']
      for (const difficulty of validDifficulties) {
        const result = createSubmissionSchema.safeParse({
          title: 'Test',
          description: 'This is a test resource description',
          url: 'https://example.com',
          category: 'Framework',
          difficulty,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('updateUserPreferencesSchema', () => {
    it('should validate with all fields optional', () => {
      const result = updateUserPreferencesSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept categories update', () => {
      const result = updateUserPreferencesSchema.safeParse({
        categories: ['Framework', 'Library'],
      })
      expect(result.success).toBe(true)
    })

    it('should accept technologies update', () => {
      const result = updateUserPreferencesSchema.safeParse({
        technologies: ['TypeScript', 'Vue'],
      })
      expect(result.success).toBe(true)
    })

    it('should accept skillLevel update', () => {
      const result = updateUserPreferencesSchema.safeParse({
        skillLevel: 'advanced',
      })
      expect(result.success).toBe(true)
    })

    it('should accept interests update', () => {
      const result = updateUserPreferencesSchema.safeParse({
        interests: ['frontend', 'web'],
      })
      expect(result.success).toBe(true)
    })

    it('should accept notificationSettings update', () => {
      const result = updateUserPreferencesSchema.safeParse({
        notificationSettings: {
          resourceUpdates: true,
          newContent: false,
          weeklyDigest: true,
        },
      })
      expect(result.success).toBe(true)
    })

    it('should accept privacySettings update', () => {
      const result = updateUserPreferencesSchema.safeParse({
        privacySettings: {
          allowPersonalization: true,
          allowDataCollection: false,
          allowRecommendationExplanations: true,
        },
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid skillLevel values', () => {
      const validSkillLevels = [
        'beginner',
        'intermediate',
        'advanced',
        'expert',
      ]
      for (const skillLevel of validSkillLevels) {
        const result = updateUserPreferencesSchema.safeParse({ skillLevel })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('searchQuerySchema', () => {
    it('should validate valid search query', () => {
      const result = searchQuerySchema.safeParse({ query: 'vue framework' })
      expect(result.success).toBe(true)
    })

    it('should accept optional category filter', () => {
      const result = searchQuerySchema.safeParse({
        query: 'vue',
        category: 'Framework',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional difficulty filter', () => {
      const result = searchQuerySchema.safeParse({
        query: 'vue',
        difficulty: 'Beginner',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional pricingModel filter', () => {
      const result = searchQuerySchema.safeParse({
        query: 'vue',
        pricingModel: 'Free',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional technology filter', () => {
      const result = searchQuerySchema.safeParse({
        query: 'vue',
        technology: 'TypeScript',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional limit parameter', () => {
      const result = searchQuerySchema.safeParse({ query: 'vue', limit: 50 })
      expect(result.success).toBe(true)
    })

    it('should accept optional offset parameter', () => {
      const result = searchQuerySchema.safeParse({ query: 'vue', offset: 20 })
      expect(result.success).toBe(true)
    })

    it('should reject missing query', () => {
      const result = searchQuerySchema.safeParse({ query: '' })
      expect(result.success).toBe(false)
    })

    it('should reject query too long', () => {
      const result = searchQuerySchema.safeParse({ query: 'a'.repeat(501) })
      expect(result.success).toBe(false)
    })

    it('should reject limit too low', () => {
      const result = searchQuerySchema.safeParse({ query: 'vue', limit: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject limit too high', () => {
      const result = searchQuerySchema.safeParse({ query: 'vue', limit: 101 })
      expect(result.success).toBe(false)
    })

    it('should reject negative offset', () => {
      const result = searchQuerySchema.safeParse({ query: 'vue', offset: -1 })
      expect(result.success).toBe(false)
    })

    it('should provide default values for limit and offset', () => {
      const result = searchQuerySchema.safeParse({ query: 'vue' })
      if (result.success) {
        expect(result.data.limit).toBe(20)
        expect(result.data.offset).toBe(0)
      }
    })
  })

  describe('createApiKeySchema', () => {
    it('should validate valid API key creation', () => {
      const result = createApiKeySchema.safeParse({
        name: 'Test API Key',
        scopes: ['read', 'write'],
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional expiresIn parameter', () => {
      const result = createApiKeySchema.safeParse({
        name: 'Test API Key',
        scopes: ['read'],
        expiresIn: 3600,
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing name', () => {
      const result = createApiKeySchema.safeParse({
        name: '',
        scopes: ['read'],
      })
      expect(result.success).toBe(false)
    })

    it('should reject name too long', () => {
      const result = createApiKeySchema.safeParse({
        name: 'a'.repeat(101),
        scopes: ['read'],
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty scopes array', () => {
      const result = createApiKeySchema.safeParse({ name: 'Test', scopes: [] })
      expect(result.success).toBe(false)
    })

    it('should reject zero expiresIn', () => {
      const result = createApiKeySchema.safeParse({
        name: 'Test',
        scopes: ['read'],
        expiresIn: 0,
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative expiresIn', () => {
      const result = createApiKeySchema.safeParse({
        name: 'Test',
        scopes: ['read'],
        expiresIn: -1,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateApiKeySchema', () => {
    it('should validate with all fields optional', () => {
      const result = updateApiKeySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept name update', () => {
      const result = updateApiKeySchema.safeParse({ name: 'Updated Name' })
      expect(result.success).toBe(true)
    })

    it('should accept scopes update', () => {
      const result = updateApiKeySchema.safeParse({ scopes: ['read', 'write'] })
      expect(result.success).toBe(true)
    })

    it('should accept active update', () => {
      const result = updateApiKeySchema.safeParse({ active: false })
      expect(result.success).toBe(true)
    })

    it('should reject empty scopes array', () => {
      const result = updateApiKeySchema.safeParse({ scopes: [] })
      expect(result.success).toBe(false)
    })
  })

  describe('bulkStatusUpdateSchema', () => {
    it('should validate valid bulk status update', () => {
      const result = bulkStatusUpdateSchema.safeParse({
        resourceIds: ['id1', 'id2', 'id3'],
        status: 'active',
      })
      expect(result.success).toBe(true)
    })

    it('should accept all valid status values', () => {
      const validStatuses = ['active', 'archived', 'deprecated']
      for (const status of validStatuses) {
        const result = bulkStatusUpdateSchema.safeParse({
          resourceIds: ['id1'],
          status,
        })
        expect(result.success).toBe(true)
      }
    })

    it('should reject empty resourceIds array', () => {
      const result = bulkStatusUpdateSchema.safeParse({
        resourceIds: [],
        status: 'active',
      })
      expect(result.success).toBe(false)
    })

    it('should reject too many resourceIds', () => {
      const result = bulkStatusUpdateSchema.safeParse({
        resourceIds: Array.from({ length: 101 }, (_, i) => `id${i}`),
        status: 'active',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid status', () => {
      const result = bulkStatusUpdateSchema.safeParse({
        resourceIds: ['id1'],
        status: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('moderationActionSchema', () => {
    it('should validate valid moderation action', () => {
      const result = moderationActionSchema.safeParse({
        reason: 'This violates our community guidelines',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional notes', () => {
      const result = moderationActionSchema.safeParse({
        reason: 'This violates our community guidelines',
        notes: 'Additional context for the moderation action',
      })
      expect(result.success).toBe(true)
    })

    it('should reject reason too short', () => {
      const result = moderationActionSchema.safeParse({ reason: 'short' })
      expect(result.success).toBe(false)
    })

    it('should reject reason too long', () => {
      const result = moderationActionSchema.safeParse({
        reason: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })

    it('should reject notes too long', () => {
      const result = moderationActionSchema.safeParse({
        reason: 'This violates our community guidelines with proper length',
        notes: 'a'.repeat(1001),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('analyticsEventSchema', () => {
    it('should validate valid analytics event', () => {
      const result = analyticsEventSchema.safeParse({
        eventType: 'resource_view',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional resourceId', () => {
      const result = analyticsEventSchema.safeParse({
        eventType: 'resource_view',
        resourceId: 'resource-123',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional metadata', () => {
      const result = analyticsEventSchema.safeParse({
        eventType: 'resource_view',
        resourceId: 'resource-123',
        metadata: {
          source: 'search',
          position: 1,
        },
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing eventType', () => {
      const result = analyticsEventSchema.safeParse({
        eventType: '',
      })
      expect(result.success).toBe(false)
    })

    it('should accept complex metadata', () => {
      const result = analyticsEventSchema.safeParse({
        eventType: 'search',
        metadata: {
          query: 'vue framework',
          filters: ['category:Framework'],
          resultCount: 10,
          timestamp: 1234567890,
        },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings in optional fields', () => {
      const result = updateUserPreferencesSchema.safeParse({
        categories: [],
        technologies: [],
        interests: [],
      })
      expect(result.success).toBe(true)
    })

    it('should handle null values in optional metadata', () => {
      const result = analyticsEventSchema.safeParse({
        eventType: 'test',
        metadata: {
          field1: 'value',
          field2: null as any,
        },
      })
      expect(result.success).toBe(true)
    })

    it('should handle special characters in strings', () => {
      const result = createSubmissionSchema.safeParse({
        title: 'Test with émojis 🎉 and spëcial çhars!',
        description: 'Description with <script>alert("test")</script>',
        url: 'https://example.com/path?query=value&other=123',
        category: 'Framework',
      })
      expect(result.success).toBe(true)
    })

    it('should handle URL with various protocols', () => {
      const urls = [
        'https://example.com',
        'http://example.com',
        'ftp://example.com',
      ]
      for (const url of urls) {
        const result = validateUrlSchema.safeParse({ url })
        expect(result.success).toBe(true)
      }
    })

    it('should handle URLs with query parameters and fragments', () => {
      const result = validateUrlSchema.safeParse({
        url: 'https://example.com/path?query=value&other=123#section',
      })
      expect(result.success).toBe(true)
    })
  })
})
