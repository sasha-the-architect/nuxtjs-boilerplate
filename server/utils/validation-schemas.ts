import { z } from 'zod'

export const validateUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
  timeout: z.number().int().positive().optional().default(10000),
  retries: z.number().int().min(0).max(10).optional().default(3),
  retryDelay: z.number().int().nonnegative().optional().default(1000),
  useCircuitBreaker: z.boolean().optional().default(true),
})

export const createWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL format'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  active: z.boolean().optional(),
})

export const updateWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL format').optional(),
  events: z
    .array(z.string())
    .min(1, 'At least one event is required')
    .optional(),
  active: z.boolean().optional(),
})

export const createSubmissionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description too long'),
  url: z.string().url('Invalid URL format'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).max(20, 'Too many tags').optional().default([]),
  pricingModel: z
    .enum(['Free', 'Freemium', 'Paid', 'Open Source'])
    .optional()
    .default('Free'),
  difficulty: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .optional()
    .default('Beginner'),
  technology: z
    .array(z.string())
    .max(20, 'Too many technologies')
    .optional()
    .default([]),
  benefits: z
    .array(z.string())
    .max(10, 'Too many benefits')
    .optional()
    .default([]),
})

export const updateUserPreferencesSchema = z.object({
  categories: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  skillLevel: z
    .enum(['beginner', 'intermediate', 'advanced', 'expert'])
    .optional(),
  interests: z.array(z.string()).optional(),
  notificationSettings: z
    .object({
      resourceUpdates: z.boolean().optional(),
      newContent: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
    })
    .optional(),
  privacySettings: z
    .object({
      allowPersonalization: z.boolean().optional(),
      allowDataCollection: z.boolean().optional(),
      allowRecommendationExplanations: z.boolean().optional(),
    })
    .optional(),
})

export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(500, 'Query too long'),
  category: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  pricingModel: z.enum(['Free', 'Freemium', 'Paid', 'Open Source']).optional(),
  technology: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().nonnegative().optional().default(0),
})

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100, 'Name too long'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expiresIn: z.number().int().positive().optional(),
})

export const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  scopes: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
})

export const bulkStatusUpdateSchema = z.object({
  resourceIds: z
    .array(z.string())
    .min(1, 'At least one resource ID is required')
    .max(100, 'Too many resources'),
  status: z.enum(['active', 'archived', 'deprecated']),
})

export const moderationActionSchema = z.object({
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason too long'),
  notes: z.string().max(1000, 'Notes too long').optional(),
})

export const analyticsEventSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  resourceId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})
