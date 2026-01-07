import { describe, it, expect } from 'vitest'
import {
  createApiError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createRateLimitError,
  createServiceUnavailableError,
  createCircuitBreakerError,
  createExternalServiceError,
  getStatusCodeFromErrorCode,
  isClientError,
  isServerError,
  ErrorCode,
  ErrorCategory,
  type ApiError,
} from '~/server/utils/api-error'

describe('ErrorCode Enum', () => {
  it('should have all required error codes', () => {
    expect(ErrorCode.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR')
    expect(ErrorCode.BAD_REQUEST).toBe('BAD_REQUEST')
    expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED')
    expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN')
    expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND')
    expect(ErrorCode.CONFLICT).toBe('CONFLICT')
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
    expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED')
    expect(ErrorCode.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE')
    expect(ErrorCode.GATEWAY_TIMEOUT).toBe('GATEWAY_TIMEOUT')
    expect(ErrorCode.CIRCUIT_BREAKER_OPEN).toBe('CIRCUIT_BREAKER_OPEN')
    expect(ErrorCode.EXTERNAL_SERVICE_ERROR).toBe('EXTERNAL_SERVICE_ERROR')
  })
})

describe('ErrorCategory Enum', () => {
  it('should have all required error categories', () => {
    expect(ErrorCategory.VALIDATION).toBe('validation')
    expect(ErrorCategory.AUTHENTICATION).toBe('authentication')
    expect(ErrorCategory.AUTHORIZATION).toBe('authorization')
    expect(ErrorCategory.NOT_FOUND).toBe('not_found')
    expect(ErrorCategory.RATE_LIMIT).toBe('rate_limit')
    expect(ErrorCategory.EXTERNAL_SERVICE).toBe('external_service')
    expect(ErrorCategory.INTERNAL).toBe('internal')
    expect(ErrorCategory.NETWORK).toBe('network')
  })
})

describe('createApiError', () => {
  describe('Happy Path - Creates valid API error', () => {
    it('should create API error with all required fields', () => {
      const error = createApiError(
        ErrorCode.BAD_REQUEST,
        'Invalid request',
        ErrorCategory.VALIDATION
      )

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.BAD_REQUEST)
      expect(error.error.message).toBe('Invalid request')
      expect(error.error.category).toBe(ErrorCategory.VALIDATION)
      expect(error.error.timestamp).toBeDefined()
      expect(typeof error.error.timestamp).toBe('string')
    })

    it('should create API error with optional details string', () => {
      const error = createApiError(
        ErrorCode.BAD_REQUEST,
        'Invalid request',
        ErrorCategory.VALIDATION,
        'Field "email" is required'
      )

      expect(error.error.details).toBe('Field "email" is required')
    })

    it('should create API error with optional details object', () => {
      const error = createApiError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        ErrorCategory.VALIDATION,
        { field: 'email', value: 'invalid-email' }
      )

      expect(error.error.details).toEqual({
        field: 'email',
        value: 'invalid-email',
      })
    })

    it('should create API error with request ID', () => {
      const error = createApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Internal error',
        ErrorCategory.INTERNAL,
        undefined,
        'req_1234567890_abc123'
      )

      expect(error.error.requestId).toBe('req_1234567890_abc123')
    })

    it('should create API error with path', () => {
      const error = createApiError(
        ErrorCode.NOT_FOUND,
        'Resource not found',
        ErrorCategory.NOT_FOUND,
        undefined,
        undefined,
        '/api/resources/123'
      )

      expect(error.error.path).toBe('/api/resources/123')
    })

    it('should generate ISO timestamp', () => {
      const beforeCreate = Date.now()
      const error = createApiError(
        ErrorCode.BAD_REQUEST,
        'Test error',
        ErrorCategory.VALIDATION
      )
      const afterCreate = Date.now()

      const timestamp = new Date(error.error.timestamp).getTime()
      expect(timestamp).toBeGreaterThanOrEqual(beforeCreate)
      expect(timestamp).toBeLessThanOrEqual(afterCreate)
    })
  })

  describe('Type Safety', () => {
    it('should return ApiError type', () => {
      const error = createApiError(
        ErrorCode.BAD_REQUEST,
        'Test',
        ErrorCategory.VALIDATION
      )

      const apiError: ApiError = error
      expect(apiError.success).toBe(false)
      expect(apiError.error).toBeDefined()
    })
  })
})

describe('createValidationError', () => {
  describe('Happy Path - Creates validation error', () => {
    it('should create validation error with field and message', () => {
      const error = createValidationError('email', 'Invalid email format')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(error.error.category).toBe(ErrorCategory.VALIDATION)
      expect(error.error.message).toBe('Validation failed for field: email')
      expect(error.error.details).toEqual({
        field: 'email',
        message: 'Invalid email format',
      })
    })

    it('should create validation error with value', () => {
      const error = createValidationError(
        'age',
        'Must be a positive number',
        -5
      )

      expect(error.error.details).toEqual({
        field: 'age',
        message: 'Must be a positive number',
        value: -5,
      })
    })

    it('should create validation error without value', () => {
      const error = createValidationError('password', 'Password is required')

      expect(error.error.details).toEqual({
        field: 'password',
        message: 'Password is required',
      })
    })
  })
})

describe('createNotFoundError', () => {
  describe('Happy Path - Creates not found error', () => {
    it('should create not found error with resource name', () => {
      const error = createNotFoundError('User')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.NOT_FOUND)
      expect(error.error.category).toBe(ErrorCategory.NOT_FOUND)
      expect(error.error.message).toBe('User not found')
      expect(error.error.details).toEqual({
        resource: 'User',
        identifier: undefined,
      })
    })

    it('should create not found error with resource and identifier', () => {
      const error = createNotFoundError('User', 'user@example.com')

      expect(error.error.message).toBe('User not found: user@example.com')
      expect(error.error.details).toEqual({
        resource: 'User',
        identifier: 'user@example.com',
      })
    })

    it('should handle numeric identifier', () => {
      const error = createNotFoundError('Order', 12345)

      expect(error.error.message).toBe('Order not found: 12345')
      expect(error.error.details).toEqual({
        resource: 'Order',
        identifier: 12345,
      })
    })
  })
})

describe('createUnauthorizedError', () => {
  describe('Happy Path - Creates unauthorized error', () => {
    it('should create unauthorized error with default message', () => {
      const error = createUnauthorizedError()

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.UNAUTHORIZED)
      expect(error.error.category).toBe(ErrorCategory.AUTHENTICATION)
      expect(error.error.message).toBe('Authentication required')
    })

    it('should create unauthorized error with custom message', () => {
      const error = createUnauthorizedError('Invalid API key')

      expect(error.error.message).toBe('Invalid API key')
    })
  })
})

describe('createForbiddenError', () => {
  describe('Happy Path - Creates forbidden error', () => {
    it('should create forbidden error with default message', () => {
      const error = createForbiddenError()

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.FORBIDDEN)
      expect(error.error.category).toBe(ErrorCategory.AUTHORIZATION)
      expect(error.error.message).toBe('Access forbidden')
    })

    it('should create forbidden error with custom message', () => {
      const error = createForbiddenError('Insufficient permissions')

      expect(error.error.message).toBe('Insufficient permissions')
    })
  })
})

describe('createRateLimitError', () => {
  describe('Happy Path - Creates rate limit error', () => {
    it('should create rate limit error without retryAfter', () => {
      const error = createRateLimitError()

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED)
      expect(error.error.category).toBe(ErrorCategory.RATE_LIMIT)
      expect(error.error.message).toBe(
        'Rate limit exceeded. Please try again later.'
      )
      expect(error.error.details).toEqual({
        retryAfter: undefined,
      })
    })

    it('should create rate limit error with retryAfter', () => {
      const error = createRateLimitError(60)

      expect(error.error.message).toBe(
        'Rate limit exceeded. Please try again later.'
      )
      expect(error.error.details).toEqual({
        retryAfter: 60,
      })
    })
  })
})

describe('createServiceUnavailableError', () => {
  describe('Happy Path - Creates service unavailable error', () => {
    it('should create service unavailable error without details', () => {
      const error = createServiceUnavailableError('External API')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.SERVICE_UNAVAILABLE)
      expect(error.error.category).toBe(ErrorCategory.EXTERNAL_SERVICE)
      expect(error.error.message).toBe('Service unavailable: External API')
      expect(error.error.details).toEqual({
        service: 'External API',
        details: undefined,
      })
    })

    it('should create service unavailable error with details', () => {
      const error = createServiceUnavailableError(
        'Payment Gateway',
        'Maintenance mode'
      )

      expect(error.error.message).toBe('Service unavailable: Payment Gateway')
      expect(error.error.details).toEqual({
        service: 'Payment Gateway',
        details: 'Maintenance mode',
      })
    })
  })
})

describe('createCircuitBreakerError', () => {
  describe('Happy Path - Creates circuit breaker error', () => {
    it('should create circuit breaker error without lastFailureTime', () => {
      const error = createCircuitBreakerError('User Service')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.CIRCUIT_BREAKER_OPEN)
      expect(error.error.category).toBe(ErrorCategory.EXTERNAL_SERVICE)
      expect(error.error.message).toBe(
        'Circuit breaker is open for service: User Service'
      )
      expect(error.error.details).toEqual({
        service: 'User Service',
        lastFailureTime: undefined,
      })
    })

    it('should create circuit breaker error with lastFailureTime', () => {
      const failureTime = '2025-01-07T12:00:00.000Z'
      const error = createCircuitBreakerError('User Service', failureTime)

      expect(error.error.details).toEqual({
        service: 'User Service',
        lastFailureTime: failureTime,
      })
    })
  })
})

describe('createExternalServiceError', () => {
  describe('Happy Path - Creates external service error', () => {
    it('should create external service error with service and original error', () => {
      const error = createExternalServiceError(
        'Email Service',
        'Connection timeout'
      )

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.EXTERNAL_SERVICE_ERROR)
      expect(error.error.category).toBe(ErrorCategory.EXTERNAL_SERVICE)
      expect(error.error.message).toBe('External service error: Email Service')
      expect(error.error.details).toEqual({
        service: 'Email Service',
        originalError: 'Connection timeout',
      })
    })
  })
})

describe('getStatusCodeFromErrorCode', () => {
  describe('Happy Path - Maps error codes to HTTP status codes', () => {
    it('should map INTERNAL_SERVER_ERROR to 500', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.INTERNAL_SERVER_ERROR)).toBe(
        500
      )
    })

    it('should map BAD_REQUEST to 400', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.BAD_REQUEST)).toBe(400)
    })

    it('should map UNAUTHORIZED to 401', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.UNAUTHORIZED)).toBe(401)
    })

    it('should map FORBIDDEN to 403', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.FORBIDDEN)).toBe(403)
    })

    it('should map NOT_FOUND to 404', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.NOT_FOUND)).toBe(404)
    })

    it('should map CONFLICT to 409', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.CONFLICT)).toBe(409)
    })

    it('should map VALIDATION_ERROR to 400', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.VALIDATION_ERROR)).toBe(400)
    })

    it('should map RATE_LIMIT_EXCEEDED to 429', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.RATE_LIMIT_EXCEEDED)).toBe(
        429
      )
    })

    it('should map SERVICE_UNAVAILABLE to 503', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.SERVICE_UNAVAILABLE)).toBe(
        503
      )
    })

    it('should map GATEWAY_TIMEOUT to 504', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.GATEWAY_TIMEOUT)).toBe(504)
    })

    it('should map CIRCUIT_BREAKER_OPEN to 503', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.CIRCUIT_BREAKER_OPEN)).toBe(
        503
      )
    })

    it('should map EXTERNAL_SERVICE_ERROR to 502', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.EXTERNAL_SERVICE_ERROR)).toBe(
        502
      )
    })
  })

  describe('Edge Cases', () => {
    it('should default to 500 for unknown error code', () => {
      const unknownCode = 'UNKNOWN_ERROR' as ErrorCode
      expect(getStatusCodeFromErrorCode(unknownCode)).toBe(500)
    })
  })
})

describe('isClientError', () => {
  describe('Happy Path - Identifies client errors (4xx)', () => {
    it('should return true for BAD_REQUEST (400)', () => {
      expect(isClientError(ErrorCode.BAD_REQUEST)).toBe(true)
    })

    it('should return true for UNAUTHORIZED (401)', () => {
      expect(isClientError(ErrorCode.UNAUTHORIZED)).toBe(true)
    })

    it('should return true for FORBIDDEN (403)', () => {
      expect(isClientError(ErrorCode.FORBIDDEN)).toBe(true)
    })

    it('should return true for NOT_FOUND (404)', () => {
      expect(isClientError(ErrorCode.NOT_FOUND)).toBe(true)
    })

    it('should return true for CONFLICT (409)', () => {
      expect(isClientError(ErrorCode.CONFLICT)).toBe(true)
    })

    it('should return true for VALIDATION_ERROR (400)', () => {
      expect(isClientError(ErrorCode.VALIDATION_ERROR)).toBe(true)
    })

    it('should return true for RATE_LIMIT_EXCEEDED (429)', () => {
      expect(isClientError(ErrorCode.RATE_LIMIT_EXCEEDED)).toBe(true)
    })
  })

  describe('Sad Path - Identifies non-client errors', () => {
    it('should return false for INTERNAL_SERVER_ERROR (500)', () => {
      expect(isClientError(ErrorCode.INTERNAL_SERVER_ERROR)).toBe(false)
    })

    it('should return false for SERVICE_UNAVAILABLE (503)', () => {
      expect(isClientError(ErrorCode.SERVICE_UNAVAILABLE)).toBe(false)
    })

    it('should return false for GATEWAY_TIMEOUT (504)', () => {
      expect(isClientError(ErrorCode.GATEWAY_TIMEOUT)).toBe(false)
    })

    it('should return false for CIRCUIT_BREAKER_OPEN (503)', () => {
      expect(isClientError(ErrorCode.CIRCUIT_BREAKER_OPEN)).toBe(false)
    })

    it('should return false for EXTERNAL_SERVICE_ERROR (502)', () => {
      expect(isClientError(ErrorCode.EXTERNAL_SERVICE_ERROR)).toBe(false)
    })
  })
})

describe('isServerError', () => {
  describe('Happy Path - Identifies server errors (5xx)', () => {
    it('should return true for INTERNAL_SERVER_ERROR (500)', () => {
      expect(isServerError(ErrorCode.INTERNAL_SERVER_ERROR)).toBe(true)
    })

    it('should return true for SERVICE_UNAVAILABLE (503)', () => {
      expect(isServerError(ErrorCode.SERVICE_UNAVAILABLE)).toBe(true)
    })

    it('should return true for GATEWAY_TIMEOUT (504)', () => {
      expect(isServerError(ErrorCode.GATEWAY_TIMEOUT)).toBe(true)
    })

    it('should return true for CIRCUIT_BREAKER_OPEN (503)', () => {
      expect(isServerError(ErrorCode.CIRCUIT_BREAKER_OPEN)).toBe(true)
    })

    it('should return true for EXTERNAL_SERVICE_ERROR (502)', () => {
      expect(isServerError(ErrorCode.EXTERNAL_SERVICE_ERROR)).toBe(true)
    })
  })

  describe('Sad Path - Identifies non-server errors', () => {
    it('should return false for BAD_REQUEST (400)', () => {
      expect(isServerError(ErrorCode.BAD_REQUEST)).toBe(false)
    })

    it('should return false for UNAUTHORIZED (401)', () => {
      expect(isServerError(ErrorCode.UNAUTHORIZED)).toBe(false)
    })

    it('should return false for FORBIDDEN (403)', () => {
      expect(isServerError(ErrorCode.FORBIDDEN)).toBe(false)
    })

    it('should return false for NOT_FOUND (404)', () => {
      expect(isServerError(ErrorCode.NOT_FOUND)).toBe(false)
    })

    it('should return false for CONFLICT (409)', () => {
      expect(isServerError(ErrorCode.CONFLICT)).toBe(false)
    })

    it('should return false for VALIDATION_ERROR (400)', () => {
      expect(isServerError(ErrorCode.VALIDATION_ERROR)).toBe(false)
    })

    it('should return false for RATE_LIMIT_EXCEEDED (429)', () => {
      expect(isServerError(ErrorCode.RATE_LIMIT_EXCEEDED)).toBe(false)
    })
  })
})

describe('Integration Tests', () => {
  describe('End-to-end error creation and handling', () => {
    it('should create complete error response for validation failure', () => {
      const error = createValidationError('email', 'Invalid format', 'invalid')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(error.error.category).toBe(ErrorCategory.VALIDATION)
      expect(error.error.message).toContain('email')
      expect(getStatusCodeFromErrorCode(error.error.code)).toBe(400)
      expect(isClientError(error.error.code)).toBe(true)
      expect(isServerError(error.error.code)).toBe(false)
    })

    it('should create complete error response for not found', () => {
      const error = createNotFoundError('User', 'user@example.com')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.NOT_FOUND)
      expect(error.error.category).toBe(ErrorCategory.NOT_FOUND)
      expect(error.error.message).toContain('User')
      expect(getStatusCodeFromErrorCode(error.error.code)).toBe(404)
      expect(isClientError(error.error.code)).toBe(true)
      expect(isServerError(error.error.code)).toBe(false)
    })

    it('should create complete error response for server error', () => {
      const error = createExternalServiceError(
        'Payment Gateway',
        'Connection timeout'
      )

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.EXTERNAL_SERVICE_ERROR)
      expect(error.error.category).toBe(ErrorCategory.EXTERNAL_SERVICE)
      expect(getStatusCodeFromErrorCode(error.error.code)).toBe(502)
      expect(isClientError(error.error.code)).toBe(false)
      expect(isServerError(error.error.code)).toBe(true)
    })

    it('should create complete error response for rate limit', () => {
      const error = createRateLimitError(120)

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED)
      expect(error.error.category).toBe(ErrorCategory.RATE_LIMIT)
      expect(getStatusCodeFromErrorCode(error.error.code)).toBe(429)
      expect(isClientError(error.error.code)).toBe(true)
      expect(isServerError(error.error.code)).toBe(false)
      expect(error.error.details?.retryAfter).toBe(120)
    })
  })

  describe('Error consistency across creation methods', () => {
    it('should have consistent error structure', () => {
      const errors = [
        createApiError(
          ErrorCode.BAD_REQUEST,
          'Bad request',
          ErrorCategory.VALIDATION
        ),
        createValidationError('field', 'Invalid'),
        createNotFoundError('Resource'),
        createUnauthorizedError(),
        createForbiddenError(),
        createRateLimitError(),
        createServiceUnavailableError('Service'),
        createCircuitBreakerError('Service'),
        createExternalServiceError('Service', 'Error'),
      ]

      errors.forEach(error => {
        expect(error.success).toBe(false)
        expect(error.error).toBeDefined()
        expect(error.error.code).toBeDefined()
        expect(error.error.message).toBeDefined()
        expect(error.error.category).toBeDefined()
        expect(error.error.timestamp).toBeDefined()
        expect(typeof error.error.timestamp).toBe('string')
      })
    })
  })
})
