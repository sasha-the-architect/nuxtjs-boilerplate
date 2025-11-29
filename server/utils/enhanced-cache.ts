import type { H3Event } from 'h3'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in seconds
}

interface CacheConfig {
  maxMemorySize?: number
  cleanupInterval?: number
  enableRedis?: boolean
  redisUrl?: string
  enableAnalytics?: boolean
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry>
  private maxMemorySize: number
  private cleanupInterval: number
  private enableRedis: boolean
  private redisClient: any | null = null
  private enableAnalytics: boolean
  private hitCount: number = 0
  private missCount: number = 0

  constructor(config: CacheConfig = {}) {
    const {
      maxMemorySize = 1000,
      cleanupInterval = 300000, // 5 minutes default
      enableRedis = false,
      redisUrl = process.env.REDIS_URL,
      enableAnalytics = true,
    } = config

    this.memoryCache = new Map<string, CacheEntry>()
    this.maxMemorySize = maxMemorySize
    this.cleanupInterval = cleanupInterval
    this.enableRedis = enableRedis
    this.enableAnalytics = enableAnalytics

    // Initialize Redis if enabled
    if (enableRedis && redisUrl) {
      try {
        // In a real implementation, we would connect to Redis here
        // For now, we'll just set a flag to indicate Redis is enabled
        if (process.env.NODE_ENV !== 'production') {
          console.log('Redis caching enabled')
        }
      } catch (error) {
        console.warn(
          'Failed to connect to Redis, falling back to memory cache:',
          error
        )
        this.enableRedis = false
      }
    }

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
   * Get value from cache (memory first, then Redis if configured)
   */
  async get(key: string): Promise<any | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry) {
      // Check if entry is expired
      const now = Date.now()
      if (now - memoryEntry.timestamp <= memoryEntry.ttl * 1000) {
        if (this.enableAnalytics) this.hitCount++
        return memoryEntry.data
      } else {
        // Entry is expired, remove it
        this.memoryCache.delete(key)
      }
    }

    // If Redis is enabled, try to get from Redis
    if (this.enableRedis) {
      try {
        // In a real implementation, we would fetch from Redis here
        // const redisValue = await this.redisClient.get(key)
        // if (redisValue) {
        //   // Cache in memory for faster subsequent access
        //   await this.set(key, redisValue, memoryEntry?.ttl || 3600)
        //   if (this.enableAnalytics) this.hitCount++
        //   return JSON.parse(redisValue)
        // }
      } catch (error) {
        console.warn('Redis get error:', error)
      }
    }

    if (this.enableAnalytics) this.missCount++
    return null
  }

  /**
   * Set value in cache (both memory and Redis if configured)
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    // Clean up expired entries if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      this.cleanupExpired()
    }

    // If still full, remove oldest entries (LRU)
    if (this.memoryCache.size >= this.maxMemorySize) {
      const keys = Array.from(this.memoryCache.keys())
      // Remove a portion of the oldest entries
      for (
        let i = 0;
        i < Math.min(Math.floor(this.maxMemorySize * 0.1), keys.length);
        i++
      ) {
        this.memoryCache.delete(keys[i])
      }
    }

    // Set in memory cache
    this.memoryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    })

    // If Redis is enabled, also set in Redis
    if (this.enableRedis) {
      try {
        // In a real implementation, we would set in Redis here
        // await this.redisClient.setex(key, ttl, JSON.stringify(value))
      } catch (error) {
        console.warn('Redis set error:', error)
      }
    }

    return true
  }

  /**
   * Delete value from cache (both memory and Redis if configured)
   */
  async delete(key: string): Promise<boolean> {
    let deleted = false

    // Delete from memory cache
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key)
      deleted = true
    }

    // If Redis is enabled, also delete from Redis
    if (this.enableRedis) {
      try {
        // In a real implementation, we would delete from Redis here
        // await this.redisClient.del(key)
      } catch (error) {
        console.warn('Redis delete error:', error)
      }
    }

    return deleted
  }

  /**
   * Clear all cache entries (both memory and Redis if configured)
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()

    if (this.enableRedis) {
      try {
        // In a real implementation, we would clear Redis here
        // await this.redisClient.flushall()
      } catch (error) {
        console.warn('Redis clear error:', error)
      }
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const result = await this.get(key)
    return result !== null
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    hits: number
    misses: number
    hitRate: number
    size: number
  }> {
    const total = this.hitCount + this.missCount
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0

    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate,
      size: this.memoryCache.size,
    }
  }

  /**
   * Preload cache with initial data
   */
  async preload(
    keys: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<void> {
    for (const item of keys) {
      await this.set(item.key, item.value, item.ttl || 3600)
    }
  }

  /**
   * Invalidate cache by pattern (memory cache only for now)
   */
  async invalidate(pattern: string): Promise<number> {
    let invalidatedCount = 0

    for (const [key] of this.memoryCache.entries()) {
      if (this.matchPattern(key, pattern)) {
        this.memoryCache.delete(key)
        invalidatedCount++
      }
    }

    return invalidatedCount
  }

  /**
   * Simple pattern matching for cache invalidation
   */
  private matchPattern(key: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.') // Escape dots
      .replace(/\*/g, '.*') // Convert * to .*
      .replace(/\?/g, '.') // Convert ? to .

    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(key)
  }
}

// Initialize cache manager with default configuration
const cacheManager = new CacheManager({
  maxMemorySize: 2000, // Increased default size
  enableRedis: !!process.env.REDIS_URL,
  enableAnalytics: true,
})

// Export the cache manager instance
export { cacheManager }

/**
 * Cache decorator function for API endpoints
 */
export function cached(
  ttl: number = 3600,
  keyGenerator?: (event: H3Event) => string,
  tags?: string[] // For cache invalidation by tags
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
        : `${propertyKey}:${event.path}:${JSON.stringify(event.context.params || {})}`

      // Try to get from cache first
      const cachedResult = await cacheManager.get(cacheKey)
      if (cachedResult !== null) {
        // Set cache hit header
        if (event.node.res?.setHeader) {
          event.node.res.setHeader('X-Cache', 'HIT')
          event.node.res.setHeader('X-Cache-Key', cacheKey)
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
        event.node.res.setHeader('X-Cache-Key', cacheKey)
      }

      return result
    }

    return descriptor
  }
}

/**
 * Cache with tags for easier invalidation
 */
export async function cacheSetWithTags(
  key: string,
  value: any,
  ttl: number = 3600,
  tags: string[] = []
): Promise<boolean> {
  // Store the value
  const setResult = await cacheManager.set(key, value, ttl)

  // Create tag mappings for later invalidation
  for (const tag of tags) {
    const tagKey = `tag:${tag}`
    let tagMembers: string[] = (await cacheManager.get(tagKey)) || []
    if (!tagMembers.includes(key)) {
      tagMembers.push(key)
      await cacheManager.set(tagKey, tagMembers, ttl + 3600) // Tag mapping expires later
    }
  }

  return setResult
}

/**
 * Invalidate cache by tag
 */
export async function invalidateCacheByTag(tag: string): Promise<number> {
  const tagKey = `tag:${tag}`
  const tagMembers: string[] = (await cacheManager.get(tagKey)) || []
  let invalidatedCount = 0

  for (const key of tagMembers) {
    if (await cacheManager.delete(key)) {
      invalidatedCount++
    }
  }

  // Clean up the tag mapping
  await cacheManager.delete(tagKey)

  return invalidatedCount
}
