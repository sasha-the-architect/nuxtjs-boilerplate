import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  // Generate OpenAPI 3.0 specification
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Free Stuff on the Internet API',
      description:
        'API for discovering free resources available on the internet',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        url: 'https://github.com/cpa02cmz/nuxtjs-boilerplate',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://yourdomain.com/api',
        description: 'Production server',
      },
    ],
    paths: {
      '/v1/resources': {
        get: {
          summary: 'Get resources',
          description:
            'Retrieve a list of resources with optional filtering and pagination',
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
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Resource',
                        },
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination',
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
      '/v1/search': {
        get: {
          summary: 'Search resources',
          description: 'Search resources with advanced filtering options',
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
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Resource',
                        },
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination',
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
      '/submissions': {
        post: {
          summary: 'Submit a new resource',
          description: 'Submit a new resource for review',
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
      '/v1/auth/api-keys': {
        post: {
          summary: 'Create API key',
          description: 'Create a new API key for authentication',
          operationId: 'createApiKey',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Name for the API key',
                      example: 'My API Key',
                    },
                    permissions: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Permissions for the API key',
                      example: ['read'],
                    },
                    expiresAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Expiration date for the API key',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'API key created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        $ref: '#/components/schemas/ApiKey',
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
    },
    components: {
      schemas: {
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
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['hosting', 'static', 'free'],
            },
            popularity: { type: 'number', example: 95 },
            dateAdded: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z',
            },
            hierarchicalTags: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  parentId: { type: 'string' },
                  level: { type: 'number' },
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
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'key_12345' },
            name: { type: 'string', example: 'My API Key' },
            key: { type: 'string', example: 'ak_abc123def456' },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              example: ['read'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
            active: { type: 'boolean', example: true },
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
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  }

  return openApiSpec
})
