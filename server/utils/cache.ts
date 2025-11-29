import type { H3Event } from 'h3'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in seconds
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry>
  private maxMemorySize: number
  private cleanupInterval: number

  constructor(maxMemorySize = 1000, cleanupInterval = 300000) {
    // 5 minutes default
    this.memoryCache = new Map()
    this.maxMemorySize = maxMemorySize
    this.cleanupInterval = cleanupInterval
    this.startCleanup()
  }

  /**
   * Start periodic cleanup of expired cache entries
   */
  private startCleanup() {
    setInterval(() => {
      this.cleanupExpired()
    }, this.cleanupInterval)
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpired() {
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.memoryCache.delete(key)
      }
    }
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<any | null> {
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    // Check if entry is expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    // Clean up expired entries if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      this.cleanupExpired()
    }

    // If still full, remove oldest entries
    if (this.memoryCache.size >= this.maxMemorySize) {
      const iterator = this.memoryCache.keys()
      for (let i = 0; i < Math.floor(this.maxMemorySize * 0.1); i++) {
        const key = iterator.next().value
        if (key) this.memoryCache.delete(key)
      }
    }

    this.memoryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    })

    return true
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    return this.memoryCache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const entry = this.memoryCache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key)
      return false
    }

    return true
  }
}

// Initialize cache manager
const cacheManager = new CacheManager()

// Export the cache manager instance
export { cacheManager }

/**
 * Cache decorator function for API endpoints
 */
export function cached(
  ttl: number = 3600,
  keyGenerator?: (event: H3Event) => string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (event: H3Event) {
      // Generate cache key
      let cacheKey = keyGenerator
        ? keyGenerator(event)
        : `${propertyKey}:${event.path}`

      // Try to get from cache first
      const cachedResult = await cacheManager.get(cacheKey)
      if (cachedResult !== null) {
        // Set cache hit header
        if (event.node.res?.setHeader) {
          event.node.res.setHeader('X-Cache', 'HIT')
        }
        return cachedResult
      }

      // Execute original method
      const result = await originalMethod.apply(this, [event])

      // Cache the result
      await cacheManager.set(cacheKey, result, ttl)

      // Set cache miss header
      if (event.node.res?.setHeader) {
        event.node.res.setHeader('X-Cache', 'MISS')
      }

      return result
    }

    return descriptor
  }
}
