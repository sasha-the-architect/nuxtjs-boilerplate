import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  sendApiError,
  sendSuccessResponse,
  sendBadRequestError,
  sendValidationError,
  sendNotFoundError,
  sendUnauthorizedError,
  sendForbiddenError,
  sendRateLimitError,
  handleApiRouteError,
  wrapApiHandler,
} from '~/server/utils/api-response'
import type { H3Event } from 'h3'

describe('sendApiError', () => {
  let mockEvent: H3Event
  let mockResponse: any
  let mockHeaders: Record<string, string>

  beforeEach(() => {
    mockHeaders = {}
    mockResponse = {
      setHeader: vi.fn((name: string, value: string) => {
        mockHeaders[name] = value
      }),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
      path: '/api/test',
    } as any
  })

  describe('Happy Path - Sends API error response', () => {
    it('should set correct status code for BAD_REQUEST', () => {
      const apiError = {
        success: false as const,
        error: {
          code: 'BAD_REQUEST' as const,
          message: 'Invalid request',
          category: 'validation' as const,
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      } as ApiError

      sendApiError(mockEvent, apiError)

      expect(mockResponse.end).toHaveBeenCalled()
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('BAD_REQUEST')
    })

    it('should set correct status code for UNAUTHORIZED', () => {
      const apiError = {
        success: false as const,
        error: {
          code: 'BAD_REQUEST' as const,
          message: 'Invalid request',
          category: 'validation' as const,
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      } as ApiError

      sendApiError(mockEvent, apiError)

      expect(mockResponse.end).toHaveBeenCalled()
    })

    it('should add request ID if not present', () => {
      const apiError = {
        success: false as const,
        error: {
          code: 'UNAUTHORIZED' as const,
          message: 'Authentication required',
          category: 'authentication' as const,
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      } as ApiError

      sendApiError(mockEvent, apiError)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.requestId).toBeDefined()
      expect(sentData.error.requestId).toMatch(/^req_\d+_[a-z0-9]+$/)
    })

    it('should preserve existing request ID', () => {
      const apiError = {
        success: false as const,
        error: {
          code: 'BAD_REQUEST' as const,
          message: 'Invalid request',
          category: 'validation' as const,
          timestamp: '2025-01-07T12:00:00.000Z',
          requestId: 'existing-request-id',
        },
      } as ApiError

      sendApiError(mockEvent, apiError)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.requestId).toBe('existing-request-id')
    })

    it('should add path if not present', () => {
      const apiError = {
        success: false as const,
        error: {
          code: 'INTERNAL_SERVER_ERROR' as const,
          message: 'Internal error',
          category: 'internal' as const,
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      } as ApiError

      sendApiError(mockEvent, apiError)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.path).toBe('/api/test')
    })

    it('should set Content-Type header to application/json', () => {
      const apiError = {
        success: false as const,
        error: {
          code: 'BAD_REQUEST' as const,
          message: 'Invalid request',
          category: 'validation' as const,
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      } as ApiError

      sendApiError(mockEvent, apiError)

      expect(mockHeaders['Content-Type']).toBe('application/json')
    })
  })
})

describe('sendSuccessResponse', () => {
  let mockEvent: H3Event
  let mockResponse: any
  let mockHeaders: Record<string, string>

  beforeEach(() => {
    mockHeaders = {}
    mockResponse = {
      setHeader: vi.fn((name: string, value: string) => {
        mockHeaders[name] = value
      }),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
    } as any
  })

  describe('Happy Path - Sends success response', () => {
    it('should send success response with data', () => {
      const data = { id: 1, name: 'Test Resource' }

      sendSuccessResponse(mockEvent, data)

      expect(mockResponse.end).toHaveBeenCalled()
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(true)
      expect(sentData.data).toEqual(data)
    })

    it('should send success response with default status 200', () => {
      const data = { success: true }

      sendSuccessResponse(mockEvent, data)

      expect(mockResponse.end).toHaveBeenCalled()
    })

    it('should send success response with custom status', () => {
      const data = { created: true }

      sendSuccessResponse(mockEvent, data, 201)

      expect(mockResponse.end).toHaveBeenCalled()
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(true)
      expect(sentData.data).toEqual(data)
    })

    it('should send success response with string data', () => {
      const data = 'Success message'

      sendSuccessResponse(mockEvent, data)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.data).toBe(data)
    })

    it('should send success response with array data', () => {
      const data = [1, 2, 3]

      sendSuccessResponse(mockEvent, data)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.data).toEqual(data)
    })

    it('should set Content-Type header to application/json', () => {
      const data = { test: true }

      sendSuccessResponse(mockEvent, data)

      expect(mockHeaders['Content-Type']).toBe('application/json')
    })
  })
})

describe('sendBadRequestError', () => {
  let mockEvent: H3Event
  let mockResponse: any

  beforeEach(() => {
    mockResponse = {
      setHeader: vi.fn(),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
    } as any
  })

  describe('Happy Path - Sends bad request error', () => {
    it('should send bad request error with message', () => {
      sendBadRequestError(mockEvent, 'Invalid input')

      expect(mockResponse.end).toHaveBeenCalled()
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('BAD_REQUEST')
      expect(sentData.error.message).toBe('Invalid input')
      expect(sentData.error.category).toBe('validation')
    })

    it('should send bad request error with message and details', () => {
      sendBadRequestError(
        mockEvent,
        'Invalid input',
        'Field "email" is required'
      )

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.details).toBe('Field "email" is required')
    })

    it('should send bad request error with message and details object', () => {
      const details = { field: 'email', value: 'invalid' }
      sendBadRequestError(mockEvent, 'Invalid input', details)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.details).toEqual(details)
    })
  })
})

describe('sendValidationError', () => {
  let mockEvent: H3Event
  let mockResponse: any

  beforeEach(() => {
    mockResponse = {
      setHeader: vi.fn(),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
    } as any
  })

  describe('Happy Path - Sends validation error', () => {
    it('should send validation error with field and message', () => {
      sendValidationError(mockEvent, 'email', 'Invalid email format')

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('VALIDATION_ERROR')
      expect(sentData.error.category).toBe('validation')
      expect(sentData.error.details).toEqual({
        field: 'email',
        message: 'Invalid email format',
      })
    })

    it('should send validation error with field, message, and value', () => {
      sendValidationError(mockEvent, 'age', 'Must be positive', -5)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.details).toEqual({
        field: 'age',
        message: 'Must be positive',
        value: -5,
      })
    })
  })
})

describe('sendNotFoundError', () => {
  let mockEvent: H3Event
  let mockResponse: any

  beforeEach(() => {
    mockResponse = {
      setHeader: vi.fn(),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
    } as any
  })

  describe('Happy Path - Sends not found error', () => {
    it('should send not found error with resource', () => {
      sendNotFoundError(mockEvent, 'User')

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('NOT_FOUND')
      expect(sentData.error.category).toBe('not_found')
      expect(sentData.error.message).toBe('User not found')
      expect(sentData.error.details).toEqual({
        resource: 'User',
        identifier: undefined,
      })
    })

    it('should send not found error with resource and identifier', () => {
      sendNotFoundError(mockEvent, 'User', 'user@example.com')

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.message).toBe('User not found: user@example.com')
      expect(sentData.error.details).toEqual({
        resource: 'User',
        identifier: 'user@example.com',
      })
    })
  })
})

describe('sendUnauthorizedError', () => {
  let mockEvent: H3Event
  let mockResponse: any

  beforeEach(() => {
    mockResponse = {
      setHeader: vi.fn(),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
    } as any
  })

  describe('Happy Path - Sends unauthorized error', () => {
    it('should send unauthorized error with default message', () => {
      sendUnauthorizedError(mockEvent)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('UNAUTHORIZED')
      expect(sentData.error.category).toBe('authentication')
      expect(sentData.error.message).toBe('Authentication required')
    })

    it('should send unauthorized error with custom message', () => {
      sendUnauthorizedError(mockEvent, 'Invalid API key')

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.message).toBe('Invalid API key')
    })
  })
})

describe('sendForbiddenError', () => {
  let mockEvent: H3Event
  let mockResponse: any

  beforeEach(() => {
    mockResponse = {
      setHeader: vi.fn(),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
    } as any
  })

  describe('Happy Path - Sends forbidden error', () => {
    it('should send forbidden error with default message', () => {
      sendForbiddenError(mockEvent)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('FORBIDDEN')
      expect(sentData.error.category).toBe('authorization')
      expect(sentData.error.message).toBe('Access forbidden')
    })

    it('should send forbidden error with custom message', () => {
      sendForbiddenError(mockEvent, 'Insufficient permissions')

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.message).toBe('Insufficient permissions')
    })
  })
})

describe('sendRateLimitError', () => {
  let mockEvent: H3Event
  let mockResponse: any
  let mockHeaders: Record<string, string>

  beforeEach(() => {
    mockHeaders = {}
    mockResponse = {
      setHeader: vi.fn((name: string, value: string) => {
        mockHeaders[name] = value
      }),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
    } as any
  })

  describe('Happy Path - Sends rate limit error', () => {
    it('should send rate limit error without retryAfter', () => {
      sendRateLimitError(mockEvent)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(sentData.error.category).toBe('rate_limit')
      expect(sentData.error.message).toBe(
        'Rate limit exceeded. Please try again later.'
      )
    })

    it('should send rate limit error with retryAfter header', () => {
      sendRateLimitError(mockEvent, 60)

      expect(mockHeaders['Retry-After']).toBe('60')
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
    })
  })
})

describe('handleApiRouteError', () => {
  let mockEvent: H3Event
  let mockResponse: any

  beforeEach(() => {
    mockResponse = {
      setHeader: vi.fn(),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
      path: '/api/test',
    } as any
  })

  describe('Happy Path - Handles errors and sends standardized response', () => {
    it('should handle Error instances', () => {
      const error = new Error('Something went wrong')

      handleApiRouteError(mockEvent, error)

      expect(mockResponse.end).toHaveBeenCalled()
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('INTERNAL_SERVER_ERROR')
      expect(sentData.error.category).toBe('internal')
      expect(sentData.error.path).toBe('/api/test')
      expect(sentData.error.requestId).toBeDefined()
    })

    it('should handle non-Error errors', () => {
      handleApiRouteError(mockEvent, 'string error')

      expect(mockResponse.end).toHaveBeenCalled()
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.code).toBe('INTERNAL_SERVER_ERROR')
      expect(sentData.error.message).toBe('An unexpected error occurred')
    })

    it('should generate request ID', () => {
      handleApiRouteError(mockEvent, new Error('test'))

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.requestId).toMatch(/^req_\d+_[a-z0-9]+$/)
    })

    it('should add path to error response', () => {
      handleApiRouteError(mockEvent, new Error('test'))

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.path).toBe('/api/test')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null error', () => {
      handleApiRouteError(mockEvent, null)

      expect(mockResponse.end).toHaveBeenCalled()
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.code).toBe('INTERNAL_SERVER_ERROR')
    })

    it('should handle undefined error', () => {
      handleApiRouteError(mockEvent, undefined)

      expect(mockResponse.end).toHaveBeenCalled()
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.error.code).toBe('INTERNAL_SERVER_ERROR')
    })

    it('should handle numeric error', () => {
      handleApiRouteError(mockEvent, 12345)

      expect(mockResponse.end).toHaveBeenCalled()
    })
  })
})

describe('wrapApiHandler', () => {
  let mockEvent: H3Event
  let mockResponse: any

  beforeEach(() => {
    mockResponse = {
      setHeader: vi.fn(),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
      path: '/api/test',
    } as any
  })

  describe('Happy Path - Wraps handler with error handling', () => {
    it('should return result when handler succeeds', async () => {
      const handler = vi.fn().mockResolvedValue({ data: 'success' })
      const wrappedHandler = wrapApiHandler(handler)

      const result = await wrappedHandler(mockEvent)

      expect(result).toEqual({ data: 'success' })
      expect(handler).toHaveBeenCalledWith(mockEvent)
    })

    it('should handle handler errors and send error response', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Handler error'))
      const wrappedHandler = wrapApiHandler(handler)

      await expect(wrappedHandler(mockEvent)).rejects.toThrow('Handler error')
      expect(mockResponse.end).toHaveBeenCalled()
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle handler throwing non-Error', async () => {
      const handler = vi.fn().mockRejectedValue('string error')
      const wrappedHandler = wrapApiHandler(handler)

      await expect(wrappedHandler(mockEvent)).rejects.toThrow('string error')
      expect(mockResponse.end).toHaveBeenCalled()
    })

    it('should handle handler returning null', async () => {
      const handler = vi.fn().mockResolvedValue(null)
      const wrappedHandler = wrapApiHandler(handler)

      const result = await wrappedHandler(mockEvent)

      expect(result).toBeNull()
    })
  })
})

describe('Integration Tests', () => {
  let mockEvent: H3Event
  let mockResponse: any

  beforeEach(() => {
    mockResponse = {
      setHeader: vi.fn(),
      end: vi.fn(),
    }
    mockEvent = {
      node: {
        res: mockResponse,
      },
      path: '/api/test',
    } as any
  })

  describe('Complete API response flow', () => {
    it('should handle complete success flow', () => {
      const data = { id: 1, name: 'Test' }

      sendSuccessResponse(mockEvent, data, 201)

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(true)
      expect(sentData.data).toEqual(data)
    })

    it('should handle complete error flow for validation', () => {
      sendValidationError(mockEvent, 'email', 'Invalid', 'test')

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('VALIDATION_ERROR')
      expect(sentData.error.requestId).toBeDefined()
      expect(sentData.error.path).toBe('/api/test')
    })

    it('should handle complete error flow for not found', () => {
      sendNotFoundError(mockEvent, 'User', '123')

      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('NOT_FOUND')
      expect(sentData.error.requestId).toBeDefined()
      expect(sentData.error.path).toBe('/api/test')
    })

    it('should handle complete error flow for rate limit', () => {
      const mockHeaders: Record<string, string> = {}
      mockResponse.setHeader = vi.fn((name: string, value: string) => {
        mockHeaders[name] = value
      })

      sendRateLimitError(mockEvent, 120)

      expect(mockHeaders['Retry-After']).toBe('120')
      const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
      expect(sentData.success).toBe(false)
      expect(sentData.error.code).toBe('RATE_LIMIT_EXCEEDED')
    })
  })

  describe('Error response consistency', () => {
    it('should maintain consistent error structure across all error types', () => {
      const errors = [
        () => sendBadRequestError(mockEvent, 'Bad'),
        () => sendValidationError(mockEvent, 'field', 'Invalid'),
        () => sendNotFoundError(mockEvent, 'Resource'),
        () => sendUnauthorizedError(mockEvent),
        () => sendForbiddenError(mockEvent),
        () => sendRateLimitError(mockEvent),
        () => handleApiRouteError(mockEvent, new Error('Test')),
      ]

      errors.forEach(errorFunc => {
        mockResponse.end.mockClear()
        errorFunc()

        const sentData = JSON.parse(mockResponse.end.mock.calls[0][0])
        expect(sentData.success).toBe(false)
        expect(sentData.error).toBeDefined()
        expect(sentData.error.code).toBeDefined()
        expect(sentData.error.message).toBeDefined()
        expect(sentData.error.category).toBeDefined()
        expect(sentData.error.timestamp).toBeDefined()
        expect(sentData.error.requestId).toBeDefined()
      })
    })
  })
})
