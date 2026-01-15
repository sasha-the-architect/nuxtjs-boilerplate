import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateUrl, validateUrls, isUrlHealthy } from '~/utils/urlValidation'

// Mock fetch to avoid making actual network requests
vi.mock('node-fetch-native', () => ({
  default: vi.fn(),
}))

// Also mock the global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('urlValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateUrl', () => {
    it('should return error for invalid URL format', async () => {
      const result = await validateUrl('invalid-url')

      expect(result).toEqual({
        url: 'invalid-url',
        status: null,
        statusText: null,
        isAccessible: false,
        responseTime: null,
        error: 'Invalid URL format',
        timestamp: expect.any(String),
      })
    })

    it('should validate a valid URL successfully', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await validateUrl('https://example.com')

      expect(result.url).toBe('https://example.com')
      expect(result.status).toBe(200)
      expect(result.statusText).toBe('OK')
      expect(result.isAccessible).toBe(true)
      expect(result.responseTime).toBeTypeOf('number')
      expect(result.timestamp).toBeTypeOf('string')
      expect(result.error).toBeUndefined()
    })

    it('should handle HEAD request method not allowed by falling back to GET', async () => {
      const mockHeadResponse = {
        status: 405,
        statusText: 'Method Not Allowed',
      }

      const mockGetResponse = {
        status: 200,
        statusText: 'OK',
      }

      // First call (HEAD) returns 405, second call (GET) succeeds
      mockFetch.mockResolvedValueOnce(mockHeadResponse)
      mockFetch.mockResolvedValueOnce(mockGetResponse)

      const result = await validateUrl('https://example.com')

      expect(result.status).toBe(200)
      expect(result.isAccessible).toBe(true)
    })

    it('should handle HEAD request failure by falling back to GET', async () => {
      const mockGetResponse = {
        status: 200,
        statusText: 'OK',
      }

      // First call (HEAD) throws error, second call (GET) succeeds
      mockFetch.mockRejectedValueOnce(new Error('HEAD not supported'))
      mockFetch.mockResolvedValueOnce(mockGetResponse)

      const result = await validateUrl('https://example.com')

      expect(result.status).toBe(200)
      expect(result.isAccessible).toBe(true)
    })

    it('should return error when both HEAD and GET requests fail', async () => {
      mockFetch.mockRejectedValueOnce(new Error('HEAD failed'))
      mockFetch.mockRejectedValueOnce(new Error('GET failed'))

      const result = await validateUrl('https://example.com', {
        useCircuitBreaker: false,
      })

      expect(result.isAccessible).toBe(false)
      expect(result.error).toContain('failed')
    })

    it('should return error when GET request fails', async () => {
      mockFetch.mockRejectedValue(new Error('GET failed'))

      const result = await validateUrl('https://example.com', {
        useCircuitBreaker: false,
      })

      expect(result.isAccessible).toBe(false)
      expect(result.error).toContain('failed')
    })

    it('should consider 2xx status codes as accessible', async () => {
      const mockResponse = {
        status: 201,
        statusText: 'Created',
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await validateUrl('https://example.com')

      expect(result.status).toBe(201)
      expect(result.isAccessible).toBe(true)
    })

    it('should consider 3xx status codes as accessible', async () => {
      const mockResponse = {
        status: 301,
        statusText: 'Moved Permanently',
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await validateUrl('https://example.com')

      expect(result.status).toBe(301)
      expect(result.isAccessible).toBe(true)
    })

    it('should consider 4xx status codes as not accessible', async () => {
      const mockResponse = {
        status: 404,
        statusText: 'Not Found',
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await validateUrl('https://example.com')

      expect(result.status).toBe(404)
      expect(result.isAccessible).toBe(false)
    })

    it('should consider 5xx status codes as not accessible', async () => {
      const mockResponse = {
        status: 500,
        statusText: 'Internal Server Error',
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await validateUrl('https://example.com')

      expect(result.status).toBe(500)
      expect(result.isAccessible).toBe(false)
    })

    it('should handle retries when request fails', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
      }

      // First call fails, second succeeds (within retry attempts)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await validateUrl('https://example.com', { retries: 3 })

      expect(result.status).toBe(200)
      expect(result.isAccessible).toBe(true)
    })
  })

  describe('validateUrls', () => {
    it('should validate multiple URLs concurrently', async () => {
      const mockResponses = [
        { status: 200, statusText: 'OK' },
        { status: 404, statusText: 'Not Found' },
        { status: 301, statusText: 'Moved Permanently' },
      ]

      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://example1.com')
          return Promise.resolve(mockResponses[0])
        if (url === 'https://example2.com')
          return Promise.resolve(mockResponses[1])
        return Promise.resolve(mockResponses[2])
      })

      const urls = [
        'https://example1.com',
        'https://example2.com',
        'https://example3.com',
      ]
      const results = await validateUrls(urls)

      expect(results).toHaveLength(3)
      expect(results[0].status).toBe(200)
      expect(results[0].isAccessible).toBe(true)
      expect(results[1].status).toBe(404)
      expect(results[1].isAccessible).toBe(false)
      expect(results[2].status).toBe(301)
      expect(results[2].isAccessible).toBe(true)
    })

    it('should handle invalid URLs in the batch', async () => {
      mockFetch.mockResolvedValue({ status: 200, statusText: 'OK' })

      const urls = [
        'https://valid.com',
        'invalid-url',
        'https://another-valid.com',
      ]
      const results = await validateUrls(urls)

      expect(results).toHaveLength(3)
      expect(results[1].url).toBe('invalid-url')
      expect(results[1].error).toBe('Invalid URL format')
    })

    it('should process URLs in batches based on concurrency limit', async () => {
      mockFetch.mockResolvedValue({ status: 200, statusText: 'OK' })

      const urls = Array.from(
        { length: 8 },
        (_, i) => `https://example${i}.com`
      )
      const results = await validateUrls(urls, {}, 3) // Limit to 3 concurrent requests

      expect(results).toHaveLength(8)
      results.forEach(result => {
        expect(result.status).toBe(200)
        expect(result.isAccessible).toBe(true)
      })
    })
  })

  describe('isUrlHealthy', () => {
    it('should return false for null status', () => {
      const result = isUrlHealthy(null)
      expect(result).toBe(false)
    })

    it('should return true for 2xx status codes', () => {
      expect(isUrlHealthy(200)).toBe(true)
      expect(isUrlHealthy(201)).toBe(true)
      expect(isUrlHealthy(299)).toBe(true)
    })

    it('should return true for 3xx status codes', () => {
      expect(isUrlHealthy(300)).toBe(true)
      expect(isUrlHealthy(301)).toBe(true)
      expect(isUrlHealthy(399)).toBe(true)
    })

    it('should return false for 4xx and 5xx status codes', () => {
      expect(isUrlHealthy(400)).toBe(false)
      expect(isUrlHealthy(404)).toBe(false)
      expect(isUrlHealthy(500)).toBe(false)
      expect(isUrlHealthy(503)).toBe(false)
    })

    it('should return false for status codes below 200', () => {
      expect(isUrlHealthy(100)).toBe(false)
      expect(isUrlHealthy(199)).toBe(false)
      expect(isUrlHealthy(0)).toBe(false)
    })
  })
})
