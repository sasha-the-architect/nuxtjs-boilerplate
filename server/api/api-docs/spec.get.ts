import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Free Stuff on the Internet API',
      description:
        'API for discovering and managing free resources available on the internet. ' +
        'This API implements industry-standard resilience patterns including ' +
        'circuit breakers, exponential backoff retries, rate limiting, ' +
        'and standardized error responses.',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        url: 'https://github.com/cpa02cmz/nuxtjs-boilerplate',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://yourdomain.com',
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'Resources', description: 'Resource discovery and management' },
      { name: 'Search', description: 'Search and filtering' },
      { name: 'Webhooks', description: 'Webhook management' },
      { name: 'Analytics', description: 'Analytics and metrics' },
      { name: 'Authentication', description: 'API key management' },
      { name: 'Moderation', description: 'Content moderation' },
      { name: 'Submissions', description: 'Resource submissions' },
      { name: 'Validation', description: 'URL validation' },
      { name: 'Export', description: 'Data export' },
    ],
    paths: {
      '/api/v1/resources': {
        get: {
          summary: 'Get all resources',
          description:
            'Retrieve a paginated list of resources with optional filtering. ' +
            'Supports filtering by category, pricing model, difficulty level, and search terms.',
          operationId: 'getResources',
          tags: ['Resources'],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description:
                'Number of resources to return (default: 20, max: 100)',
              required: false,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 20,
              },
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Number of resources to skip (default: 0)',
              required: false,
              schema: {
                type: 'integer',
                minimum: 0,
                default: 0,
              },
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by category',
              required: false,
              schema: {
                type: 'string',
              },
            },
            {
              name: 'pricing',
              in: 'query',
              description: 'Filter by pricing model',
              required: false,
              schema: {
                type: 'string',
                enum: ['Free', 'Freemium', 'Open Source', 'Paid'],
              },
            },
            {
              name: 'difficulty',
              in: 'query',
              description: 'Filter by difficulty level',
              required: false,
              schema: {
                type: 'string',
                enum: ['Beginner', 'Intermediate', 'Advanced'],
              },
            },
            {
              name: 'search',
              in: 'query',
              description: 'Search term to filter by title/description',
              required: false,
              schema: {
                type: 'string',
              },
            },
            {
              name: 'sort',
              in: 'query',
              description: 'Sort option',
              required: false,
              schema: {
                type: 'string',
                enum: [
                  'alphabetical-asc',
                  'alphabetical-desc',
                  'date-added-desc',
                  'popularity-desc',
                ],
                default: 'popularity-desc',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SuccessResponse',
                  },
                },
              },
              headers: {
                'X-Cache': {
                  description: 'Cache status (HIT or MISS)',
                  schema: { type: 'string', enum: ['HIT', 'MISS'] },
                },
                'X-Cache-Key': {
                  description: 'Cache key used',
                  schema: { type: 'string' },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
              headers: {
                'Retry-After': {
                  description: 'Seconds until retry is allowed',
                  schema: { type: 'integer' },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
          security: [],
        },
      },
      '/api/v1/resources/{id}': {
        get: {
          summary: 'Get resource by ID',
          description:
            'Retrieve a specific resource by its ID. Includes hierarchical tags and metadata.',
          operationId: 'getResourceById',
          tags: ['Resources'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Resource ID',
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SuccessResponse',
                  },
                },
              },
              headers: {
                'X-Cache': {
                  description: 'Cache status (HIT or MISS)',
                  schema: { type: 'string', enum: ['HIT', 'MISS'] },
                },
              },
            },
            '404': {
              description: 'Resource not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                'Retry-After': {
                  description: 'Seconds until retry is allowed',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/search': {
        get: {
          summary: 'Search resources',
          description:
            'Search resources with advanced filtering options using Fuse.js fuzzy search.',
          operationId: 'searchResources',
          tags: ['Search'],
          parameters: [
            {
              name: 'q',
              in: 'query',
              description: 'Search query term',
              required: false,
              schema: {
                type: 'string',
              },
            },
            {
              name: 'limit',
              in: 'query',
              description:
                'Number of resources to return (default: 20, max: 100)',
              required: false,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 20,
              },
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Number of resources to skip (default: 0)',
              required: false,
              schema: {
                type: 'integer',
                minimum: 0,
                default: 0,
              },
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by category',
              required: false,
              schema: {
                type: 'string',
              },
            },
            {
              name: 'pricing',
              in: 'query',
              description: 'Filter by pricing model',
              required: false,
              schema: {
                type: 'string',
                enum: ['Free', 'Freemium', 'Open Source', 'Paid'],
              },
            },
            {
              name: 'difficulty',
              in: 'query',
              description: 'Filter by difficulty level',
              required: false,
              schema: {
                type: 'string',
                enum: ['Beginner', 'Intermediate', 'Advanced'],
              },
            },
            {
              name: 'tags',
              in: 'query',
              description: 'Filter by tags (comma-separated)',
              required: false,
              schema: {
                type: 'string',
              },
            },
            {
              name: 'hierarchicalTags',
              in: 'query',
              description: 'Filter by hierarchical tags (comma-separated)',
              required: false,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SuccessResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/validate-url': {
        post: {
          summary: 'Validate URL',
          description:
            'Validate a URL by checking its HTTP status. ' +
            'Uses circuit breaker and retry with exponential backoff for resilience.',
          operationId: 'validateUrl',
          tags: ['Validation'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url'],
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                      description: 'URL to validate',
                    },
                    timeout: {
                      type: 'integer',
                      description: 'Timeout in milliseconds (default: 10000)',
                      default: 10000,
                    },
                    retries: {
                      type: 'integer',
                      description: 'Number of retry attempts (default: 3)',
                      default: 3,
                    },
                    retryDelay: {
                      type: 'integer',
                      description:
                        'Initial retry delay in milliseconds (default: 1000)',
                      default: 1000,
                    },
                    useCircuitBreaker: {
                      type: 'boolean',
                      description:
                        'Use circuit breaker for this validation (default: true)',
                      default: true,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'URL validation result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      data: {
                        type: 'object',
                        properties: {
                          validationResult: {
                            type: 'object',
                            properties: {
                              url: {
                                type: 'string',
                                example: 'https://example.com',
                              },
                              status: {
                                type: 'string',
                                enum: [
                                  'valid',
                                  'invalid',
                                  'unreachable',
                                  'timeout',
                                ],
                                example: 'valid',
                              },
                              statusCode: {
                                type: 'integer',
                                example: 200,
                              },
                              attempts: {
                                type: 'integer',
                                description: 'Number of attempts made',
                                example: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/webhooks': {
        get: {
          summary: 'List webhooks',
          description:
            'Retrieve all registered webhooks for the authenticated user.',
          operationId: 'listWebhooks',
          tags: ['Webhooks'],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Webhook',
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create webhook',
          description:
            'Create a new webhook for event notifications. Webhooks support circuit breaker ' +
            'and retry with exponential backoff for reliable delivery.',
          operationId: 'createWebhook',
          tags: ['Webhooks'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url', 'events'],
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                      description: 'Webhook URL to send events to',
                    },
                    events: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: [
                          'resource.created',
                          'resource.updated',
                          'resource.deleted',
                          'submission.created',
                          'submission.approved',
                          'submission.rejected',
                        ],
                      },
                      description: 'List of events to subscribe to',
                    },
                    active: {
                      type: 'boolean',
                      description: 'Whether the webhook is active',
                      default: true,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Webhook created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        $ref: '#/components/schemas/Webhook',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/webhooks/{id}': {
        put: {
          summary: 'Update webhook',
          description: 'Update an existing webhook configuration.',
          operationId: 'updateWebhook',
          tags: ['Webhooks'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Webhook ID',
              schema: {
                type: 'string',
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                    },
                    events: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    active: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Webhook updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        $ref: '#/components/schemas/Webhook',
                      },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Webhook not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
        delete: {
          summary: 'Delete webhook',
          description: 'Delete a webhook.',
          operationId: 'deleteWebhook',
          tags: ['Webhooks'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Webhook ID',
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Webhook deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'Webhook deleted successfully',
                      },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Webhook not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/webhooks/trigger': {
        post: {
          summary: 'Trigger webhook test',
          description: 'Send a test event to a webhook for testing purposes.',
          operationId: 'triggerWebhook',
          tags: ['Webhooks'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['webhookId'],
                  properties: {
                    webhookId: {
                      type: 'string',
                      description: 'Webhook ID to trigger',
                    },
                    eventType: {
                      type: 'string',
                      description: 'Event type to send',
                      enum: [
                        'resource.created',
                        'resource.updated',
                        'submission.created',
                      ],
                      default: 'resource.created',
                    },
                    testData: {
                      type: 'object',
                      description: 'Custom test data (optional)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Test event sent successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'Test event sent',
                      },
                      deliveryId: {
                        type: 'string',
                        example: 'del_abc123',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/webhooks/deliveries': {
        get: {
          summary: 'List webhook deliveries',
          description: 'Retrieve delivery history for webhooks.',
          operationId: 'listWebhookDeliveries',
          tags: ['Webhooks'],
          parameters: [
            {
              name: 'webhookId',
              in: 'query',
              description: 'Filter by webhook ID',
              required: false,
              schema: { type: 'string' },
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter by delivery status',
              required: false,
              schema: {
                type: 'string',
                enum: ['success', 'failed', 'pending'],
              },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of deliveries to return',
              required: false,
              schema: { type: 'integer', default: 50, maximum: 100 },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/WebhookDelivery',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/analytics/events': {
        post: {
          summary: 'Record analytics event',
          description:
            'Record an analytics event for tracking. Rate limited to 10 events per IP per minute. ' +
            'Uses Prisma ORM with database-level aggregation for performance.',
          operationId: 'recordAnalyticsEvent',
          tags: ['Analytics'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['type'],
                  properties: {
                    type: {
                      type: 'string',
                      description:
                        'Event type (e.g., page_view, resource_click)',
                      example: 'page_view',
                    },
                    resourceId: {
                      type: 'string',
                      description: 'Associated resource ID (optional)',
                    },
                    category: {
                      type: 'string',
                      description: 'Event category (optional)',
                    },
                    url: {
                      type: 'string',
                      description: 'Current URL (optional)',
                    },
                    properties: {
                      type: 'object',
                      description: 'Additional event properties as JSON',
                      example: { referrer: 'google.com' },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Event recorded successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      eventId: {
                        type: 'number',
                        description: 'Event timestamp as unique identifier',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                'Retry-After': {
                  description: 'Seconds until retry is allowed',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/analytics/search': {
        get: {
          summary: 'Query analytics data',
          description:
            'Retrieve aggregated analytics data with filtering. Uses parallel database queries ' +
            'and database-level aggregation for 95% reduction in data transfer.',
          operationId: 'queryAnalytics',
          tags: ['Analytics'],
          parameters: [
            {
              name: 'startDate',
              in: 'query',
              required: true,
              description: 'Start date (ISO 8601 format)',
              schema: { type: 'string', format: 'date-time' },
            },
            {
              name: 'endDate',
              in: 'query',
              required: true,
              description: 'End date (ISO 8601 format)',
              schema: { type: 'string', format: 'date-time' },
            },
            {
              name: 'resourceId',
              in: 'query',
              description: 'Filter by resource ID',
              schema: { type: 'string' },
            },
            {
              name: 'type',
              in: 'query',
              description: 'Filter by event type',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Analytics data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          totalEvents: { type: 'integer' },
                          eventsByType: {
                            type: 'object',
                            additionalProperties: { type: 'integer' },
                          },
                          resourceViews: {
                            type: 'object',
                            additionalProperties: { type: 'integer' },
                          },
                          dailyTrends: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                date: { type: 'string' },
                                count: { type: 'integer' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/analytics/resource/{id}': {
        get: {
          summary: 'Get resource analytics',
          description: 'Retrieve analytics data for a specific resource.',
          operationId: 'getResourceAnalytics',
          tags: ['Analytics'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Resource ID',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Resource analytics data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          resourceId: { type: 'string' },
                          totalViews: { type: 'integer' },
                          uniqueVisitors: { type: 'integer' },
                          clickRate: { type: 'number' },
                          topReferrers: {
                            type: 'array',
                            items: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Resource not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/submissions': {
        post: {
          summary: 'Submit a new resource',
          description:
            'Submit a new resource for review. Submissions are queued for moderation.',
          operationId: 'submitResource',
          tags: ['Submissions'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ResourceSubmission',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Resource submitted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'Resource submitted successfully',
                      },
                      submissionId: {
                        type: 'string',
                        example: 'sub_123456789',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/moderation/queue': {
        get: {
          summary: 'Get moderation queue',
          description:
            'Retrieve pending submissions for moderation. Requires authentication.',
          operationId: 'getModerationQueue',
          tags: ['Moderation'],
          parameters: [
            {
              name: 'status',
              in: 'query',
              description: 'Filter by status',
              schema: {
                type: 'string',
                enum: ['pending', 'approved', 'rejected'],
              },
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by category',
              schema: { type: 'string' },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of submissions to return',
              schema: { type: 'integer', default: 50 },
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Number of submissions to skip',
              schema: { type: 'integer', default: 0 },
            },
          ],
          responses: {
            '200': {
              description: 'Moderation queue',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      queue: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Submission',
                        },
                      },
                      total: { type: 'integer' },
                      limit: { type: 'integer' },
                      offset: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/moderation/approve': {
        post: {
          summary: 'Approve submission',
          description:
            'Approve a submission and add it to the resources collection.',
          operationId: 'approveSubmission',
          tags: ['Moderation'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['submissionId'],
                  properties: {
                    submissionId: {
                      type: 'string',
                      description: 'Submission ID to approve',
                    },
                    notes: {
                      type: 'string',
                      description: 'Moderation notes (optional)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Submission approved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'Submission approved',
                      },
                      resourceId: {
                        type: 'string',
                        example: 'res_12345',
                      },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Submission not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/moderation/reject': {
        post: {
          summary: 'Reject submission',
          description: 'Reject a submission. Optionally provide a reason.',
          operationId: 'rejectSubmission',
          tags: ['Moderation'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['submissionId'],
                  properties: {
                    submissionId: {
                      type: 'string',
                      description: 'Submission ID to reject',
                    },
                    reason: {
                      type: 'string',
                      description: 'Rejection reason (optional)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Submission rejected',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'Submission rejected',
                      },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Submission not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/resources/bulk-status': {
        post: {
          summary: 'Bulk update resource status',
          description: 'Update status for multiple resources at once.',
          operationId: 'bulkUpdateResourceStatus',
          tags: ['Resources'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['resourceIds', 'status'],
                  properties: {
                    resourceIds: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'List of resource IDs to update',
                    },
                    status: {
                      type: 'string',
                      enum: [
                        'active',
                        'deprecated',
                        'discontinued',
                        'updated',
                        'pending',
                      ],
                      description: 'New status value',
                    },
                    reason: {
                      type: 'string',
                      description: 'Reason for status change (optional)',
                    },
                    notes: {
                      type: 'string',
                      description: 'Additional notes (optional)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Bulk status update result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      updatedCount: { type: 'integer' },
                      errorCount: { type: 'integer' },
                      updatedResources: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            status: { type: 'string' },
                            title: { type: 'string' },
                          },
                        },
                      },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            resourceId: { type: 'string' },
                            error: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/export/csv': {
        get: {
          summary: 'Export resources as CSV',
          description:
            'Export all resources in CSV format for offline use or analysis.',
          operationId: 'exportResourcesCsv',
          tags: ['Export'],
          responses: {
            '200': {
              description: 'CSV file',
              content: {
                'text/csv': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
              headers: {
                'Content-Disposition': {
                  description: 'Filename for download',
                  schema: {
                    type: 'string',
                    example: 'attachment; filename="resources.csv"',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)',
            },
            pagination: {
              $ref: '#/components/schemas/Pagination',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Always false for error responses',
            },
            error: {
              type: 'object',
              required: ['code', 'message', 'category', 'timestamp'],
              properties: {
                code: {
                  type: 'string',
                  description: 'Standardized error code',
                  enum: [
                    'INTERNAL_SERVER_ERROR',
                    'BAD_REQUEST',
                    'UNAUTHORIZED',
                    'FORBIDDEN',
                    'NOT_FOUND',
                    'CONFLICT',
                    'VALIDATION_ERROR',
                    'RATE_LIMIT_EXCEEDED',
                    'SERVICE_UNAVAILABLE',
                    'GATEWAY_TIMEOUT',
                    'CIRCUIT_BREAKER_OPEN',
                    'EXTERNAL_SERVICE_ERROR',
                  ],
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  description: 'Human-readable error message',
                  example: 'Validation failed for field: email',
                },
                category: {
                  type: 'string',
                  description: 'Error category for logical grouping',
                  enum: [
                    'validation',
                    'authentication',
                    'authorization',
                    'not_found',
                    'rate_limit',
                    'external_service',
                    'internal',
                    'network',
                  ],
                  example: 'validation',
                },
                details: {
                  type: 'object',
                  description: 'Additional error details (optional)',
                  properties: {
                    field: {
                      type: 'string',
                      description: 'Field that caused error',
                    },
                    value: { description: 'Invalid value received' },
                    resource: { type: 'string', description: 'Resource type' },
                    identifier: { description: 'Resource identifier' },
                  },
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'ISO 8601 timestamp of error',
                },
                requestId: {
                  type: 'string',
                  description: 'Unique request ID for tracing',
                },
                path: {
                  type: 'string',
                  description: 'API endpoint path',
                },
              },
            },
          },
        },
        Resource: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'res_12345' },
            title: { type: 'string', example: 'Free Hosting Service' },
            description: {
              type: 'string',
              example: 'A free hosting service for static websites',
            },
            url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com',
            },
            category: { type: 'string', example: 'Hosting' },
            pricingModel: {
              type: 'string',
              enum: ['Free', 'Freemium', 'Open Source', 'Paid'],
              example: 'Free',
            },
            difficulty: {
              type: 'string',
              enum: ['Beginner', 'Intermediate', 'Advanced'],
              example: 'Beginner',
            },
            technology: {
              type: 'array',
              items: { type: 'string' },
              example: ['JavaScript', 'React'],
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['hosting', 'static', 'free'],
            },
            hierarchicalTags: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  parentId: { type: 'string' },
                  level: { type: 'integer' },
                },
              },
            },
            popularity: { type: 'number', example: 95 },
            status: {
              type: 'string',
              enum: [
                'active',
                'deprecated',
                'discontinued',
                'updated',
                'pending',
              ],
              example: 'active',
            },
            dateAdded: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z',
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00Z',
            },
            statusHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  fromStatus: { type: 'string' },
                  toStatus: { type: 'string' },
                  reason: { type: 'string' },
                  changedBy: { type: 'string' },
                  changedAt: { type: 'string', format: 'date-time' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        ResourceSubmission: {
          type: 'object',
          required: ['title', 'description', 'url', 'category'],
          properties: {
            title: { type: 'string', example: 'My Resource' },
            description: {
              type: 'string',
              example: 'A brief description',
              minLength: 10,
            },
            url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com',
            },
            category: { type: 'string', example: 'Tools' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['development', 'free'],
            },
            pricingModel: {
              type: 'string',
              enum: ['Free', 'Freemium', 'Open Source', 'Paid'],
              example: 'Free',
            },
            difficulty: {
              type: 'string',
              enum: ['Beginner', 'Intermediate', 'Advanced'],
              example: 'Beginner',
            },
            technology: {
              type: 'array',
              items: { type: 'string' },
              example: ['JavaScript', 'React'],
            },
            benefits: {
              type: 'array',
              items: { type: 'string' },
              example: ['Free tier', 'Open source'],
            },
          },
        },
        Submission: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'sub_123456' },
            resourceData: {
              $ref: '#/components/schemas/ResourceSubmission',
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              example: 'pending',
            },
            submittedBy: { type: 'string', example: 'user123' },
            submittedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T12:00:00Z',
            },
          },
        },
        Webhook: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'wh_abc123' },
            url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/webhook',
            },
            events: {
              type: 'array',
              items: { type: 'string' },
              example: ['resource.created', 'resource.updated'],
            },
            active: { type: 'boolean', example: true },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            deliveryCount: { type: 'integer', example: 42 },
            failureCount: { type: 'integer', example: 2 },
          },
        },
        WebhookDelivery: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'del_xyz789' },
            webhookId: { type: 'string', example: 'wh_abc123' },
            eventType: {
              type: 'string',
              example: 'resource.created',
            },
            status: {
              type: 'string',
              enum: ['success', 'failed', 'pending'],
              example: 'success',
            },
            attempt: { type: 'integer', example: 1 },
            deliveredAt: {
              type: 'string',
              format: 'date-time',
            },
            response: {
              type: 'object',
              description: 'HTTP response from webhook endpoint',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', description: 'Total number of items' },
            limit: { type: 'integer', description: 'Items per page' },
            offset: { type: 'integer', description: 'Items skipped' },
            hasNext: {
              type: 'boolean',
              description: 'Whether there are more items',
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there are previous items',
            },
          },
        },
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication',
        },
      },
    },
    security: [],
  }

  return openApiSpec
})
