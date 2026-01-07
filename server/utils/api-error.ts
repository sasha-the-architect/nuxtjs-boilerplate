export {}

// Error codes and categories are exported for external use
/* eslint-disable no-unused-vars */
export enum ErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_SERVICE = 'external_service',
  INTERNAL = 'internal',
  NETWORK = 'network',
}
/* eslint-enable no-unused-vars */

export interface ApiError {
  success: false
  error: {
    code: ErrorCode
    message: string
    category: ErrorCategory
    details?: string | Record<string, unknown>
    timestamp: string
    requestId?: string
    path?: string
  }
}

export interface ValidationErrorDetail {
  field: string
  message: string
  value?: unknown
}

export function createApiError(
  code: ErrorCode,
  message: string,
  category: ErrorCategory,
  details?: string | Record<string, unknown>,
  requestId?: string,
  path?: string
): ApiError {
  return {
    success: false,
    error: {
      code,
      message,
      category,
      details,
      timestamp: new Date().toISOString(),
      requestId,
      path,
    },
  }
}

export function createValidationError(
  field: string,
  message: string,
  value?: unknown
): ApiError {
  return createApiError(
    ErrorCode.VALIDATION_ERROR,
    `Validation failed for field: ${field}`,
    ErrorCategory.VALIDATION,
    { field, message, value }
  )
}

export function createNotFoundError(
  resource: string,
  identifier?: string
): ApiError {
  const message = identifier
    ? `${resource} not found: ${identifier}`
    : `${resource} not found`

  return createApiError(ErrorCode.NOT_FOUND, message, ErrorCategory.NOT_FOUND, {
    resource,
    identifier,
  })
}

export function createUnauthorizedError(
  message: string = 'Authentication required'
): ApiError {
  return createApiError(
    ErrorCode.UNAUTHORIZED,
    message,
    ErrorCategory.AUTHENTICATION
  )
}

export function createForbiddenError(
  message: string = 'Access forbidden'
): ApiError {
  return createApiError(
    ErrorCode.FORBIDDEN,
    message,
    ErrorCategory.AUTHORIZATION
  )
}

export function createRateLimitError(retryAfter?: number): ApiError {
  return createApiError(
    ErrorCode.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded. Please try again later.',
    ErrorCategory.RATE_LIMIT,
    { retryAfter }
  )
}

export function createServiceUnavailableError(
  service: string,
  details?: string
): ApiError {
  return createApiError(
    ErrorCode.SERVICE_UNAVAILABLE,
    `Service unavailable: ${service}`,
    ErrorCategory.EXTERNAL_SERVICE,
    { service, details }
  )
}

export function createCircuitBreakerError(
  service: string,
  lastFailureTime?: string
): ApiError {
  return createApiError(
    ErrorCode.CIRCUIT_BREAKER_OPEN,
    `Circuit breaker is open for service: ${service}`,
    ErrorCategory.EXTERNAL_SERVICE,
    { service, lastFailureTime }
  )
}

export function createExternalServiceError(
  service: string,
  originalError: string
): ApiError {
  return createApiError(
    ErrorCode.EXTERNAL_SERVICE_ERROR,
    `External service error: ${service}`,
    ErrorCategory.EXTERNAL_SERVICE,
    { service, originalError }
  )
}

export function getStatusCodeFromErrorCode(code: ErrorCode): number {
  const statusCodeMap: Record<ErrorCode, number> = {
    [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
    [ErrorCode.BAD_REQUEST]: 400,
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.CONFLICT]: 409,
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
    [ErrorCode.SERVICE_UNAVAILABLE]: 503,
    [ErrorCode.GATEWAY_TIMEOUT]: 504,
    [ErrorCode.CIRCUIT_BREAKER_OPEN]: 503,
    [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  }

  return statusCodeMap[code] || 500
}

export function isClientError(code: ErrorCode): boolean {
  const statusCode = getStatusCodeFromErrorCode(code)
  return statusCode >= 400 && statusCode < 500
}

export function isServerError(code: ErrorCode): boolean {
  const statusCode = getStatusCodeFromErrorCode(code)
  return statusCode >= 500
}
