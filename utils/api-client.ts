/**
 * API Client Interface and Implementation
 *
 * Defines a contract for all API client implementations.
 * This allows for easy testing, mocking, and changing implementations.
 *
 * Architecture Principles:
 * - Dependency Inversion: Depend on abstractions, not concretions
 * - Single Responsibility: Only handles HTTP operations
 * - Testability: Can be easily mocked in tests
 */

/**
 * HTTP Methods supported by API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * API Request Configuration
 */
export interface ApiRequestConfig {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  timeout?: number
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    category: string
    details?: string | Record<string, unknown>
    timestamp: string
    requestId?: string
    path?: string
  }
}

/**
 * API Client Interface
 *
 * This interface defines a contract for all API operations.
 * Implementations can use different underlying transport layers
 * (fetch, axios, or custom HTTP client).
 */
export interface ApiClient {
  /**
   * Perform a GET request
   */
  get<T = unknown>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>

  /**
   * Perform a POST request
   */
  post<T = unknown>(
    url: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>

  /**
   * Perform a PUT request
   */
  put<T = unknown>(
    url: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>

  /**
   * Perform a DELETE request
   */
  delete<T = unknown>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>

  /**
   * Perform a PATCH request
   */
  patch<T = unknown>(
    url: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>

  /**
   * Set default headers for all requests
   */
  setDefaultHeaders(headers: Record<string, string>): void

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null
}

/**
 * Fetch-based API Client Factory
 *
 * Creates an API client implementation using the provided fetch function.
 * This is the default HTTP client for the application.
 *
 * @param fetch - Fetch function to use (typically globalThis.fetch)
 * @returns ApiClient implementation
 */
export const createFetchApiClient = (
  fetch: typeof globalThis.fetch
): ApiClient => {
  let defaultHeaders: Record<string, string> = {}
  let authToken: string | null = null

  const mergeHeaders = (
    headers?: Record<string, string>
  ): Record<string, string> => {
    const merged = { ...defaultHeaders }

    if (authToken) {
      merged['Authorization'] = `Bearer ${authToken}`
    }

    if (headers) {
      Object.assign(merged, headers)
    }

    return merged
  }

  const buildUrl = (
    url: string,
    params?: Record<string, string | number | boolean>
  ): string => {
    if (!params || Object.keys(params).length === 0) {
      return url
    }

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })

    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${searchParams.toString()}`
  }

  const request = async <T = unknown>(
    method: HttpMethod,
    url: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(buildUrl(url, config?.params), {
        method,
        headers: mergeHeaders(config?.headers),
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = (await response.json()) as ApiResponse<T>
      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
          category: 'network',
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  return {
    get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
      return request<T>('GET', url, undefined, config)
    },

    post<T>(
      url: string,
      body?: unknown,
      config?: ApiRequestConfig
    ): Promise<ApiResponse<T>> {
      return request<T>('POST', url, body, config)
    },

    put<T>(
      url: string,
      body?: unknown,
      config?: ApiRequestConfig
    ): Promise<ApiResponse<T>> {
      return request<T>('PUT', url, body, config)
    },

    delete<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
      return request<T>('DELETE', url, undefined, config)
    },

    patch<T>(
      url: string,
      body?: unknown,
      config?: ApiRequestConfig
    ): Promise<ApiResponse<T>> {
      return request<T>('PATCH', url, body, config)
    },

    setDefaultHeaders(headers: Record<string, string>): void {
      defaultHeaders = { ...headers }
    },

    setAuthToken(token: string | null): void {
      authToken = token
    },

    getAuthToken(): string | null {
      return authToken
    },
  }
}
