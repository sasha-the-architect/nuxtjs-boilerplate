import { z } from 'zod'
import { isValidCategory, isValidEventType } from './constants'

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

export const triggerWebhookSchema = z.object({
  event: z.string().min(1, 'Event type is required'),
  data: z.any(),
  idempotencyKey: z.string().optional(),
})

export const analyticsEventSchema = z.object({
  type: z
    .string()
    .min(1, 'Event type is required')
    .max(50, 'Event type too long')
    .refine(
      val => isValidEventType(val),
      'Invalid event type. Must be one of: resource_view, search, filter_change, bookmark, comparison, submission'
    ),
  resourceId: z
    .string()
    .max(25, 'Resource ID too long')
    .refine(
      val => val === '' || /^[a-zA-Z0-9_-]+$/.test(val),
      'Resource ID contains invalid characters'
    )
    .optional(),
  category: z
    .string()
    .max(100, 'Category too long')
    .refine(
      val => isValidCategory(val),
      'Invalid category. Must be one of: Development, Design, Productivity, Marketing, Analytics, Security, AI/ML, DevOps, Testing, Education'
    )
    .optional(),
  url: z.string().url('Invalid URL format').optional(),
  userAgent: z.string().max(500, 'User agent too long').optional(),
  ip: z
    .string()
    .max(45, 'IP address too long')
    .refine(val => {
      const ipv4Regex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      const ipv6Regex =
        /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^:(?::[0-9a-fA-F]{1,4}){1,7}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,7}|(?:[0-9a-fA-F]{1,4}:){1,7}:|:(?::[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$/
      return ipv4Regex.test(val) || ipv6Regex.test(val) || val === 'unknown'
    }, 'Invalid IP address format')
    .optional(),
  timestamp: z
    .number()
    .int('Timestamp must be an integer')
    .positive('Timestamp must be positive')
    .optional(),
  properties: z.record(z.string(), z.any()).optional(),
})
