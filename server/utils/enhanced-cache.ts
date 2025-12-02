import type { H3Event } from 'h3'
import Redis from 'ioredis'
import logger from '~/utils/logger'

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
  private redisClient: Redis | null = null
  private enableAnalytics: boolean
  private hitCount: number = 0
  private missCount: number = 0
  private redisConnected: boolean = false

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
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          enableReadyCheck: true,
        })

        // Set up connection listeners
        this.redisClient.on('connect', () => {
          this.redisConnected = true
          if (process.env.NODE_ENV !== 'production') {
            logger.info('Successfully connected to Redis')
          }
        })

        this.redisClient.on('error', error => {
          logger.warn('Redis connection error:', error)
          this.redisConnected = false
          // Fallback to memory cache only
          this.enableRedis = false
        })

        this.redisClient.on('reconnecting', () => {
          if (process.env.NODE_ENV !== 'production') {
            logger.info('Reconnecting to Redis...')
          }
        })

        // Attempt to connect
        this.redisClient.connect().catch(error => {
          logger.warn(
            'Failed to connect to Redis, falling back to memory cache:',
            error
          )
          this.enableRedis = false
          this.redisConnected = false
        })
      } catch (error) {
        logger.warn(
          'Failed to initialize Redis client, falling back to memory cache:',
          error
        )
        this.enableRedis = false
        this.redisConnected = false
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
    const entries = Array.from(this.memoryCache.entries())
    for (const [key, entry] of entries) {
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
    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        const redisValue = await this.redisClient.get(key)
        if (redisValue) {
          const parsedValue = JSON.parse(redisValue)
          // Cache in memory for faster subsequent access
          await this.set(key, parsedValue, memoryEntry?.ttl || 3600)
          if (this.enableAnalytics) this.hitCount++
          return parsedValue
        }
      } catch (error) {
        logger.warn('Redis get error, falling back to memory cache:', error)
        // Don't disable Redis here, just log the error and continue
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
    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        await this.redisClient.setex(key, ttl, JSON.stringify(value))
      } catch (error) {
        logger.warn('Redis set error:', error)
        // Don't disable Redis here, just log the error and continue
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
    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        await this.redisClient.del(key)
      } catch (error) {
        logger.warn('Redis delete error:', error)
        // Don't disable Redis here, just log the error and continue
      }
    }

    return deleted
  }

  /**
   * Clear all cache entries (both memory and Redis if configured)
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()

    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        await this.redisClient.flushall()
      } catch (error) {
        logger.warn('Redis clear error:', error)
        // Don't disable Redis here, just log the error and continue
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
   * Invalidate cache by pattern (memory cache and Redis if configured)
   */
  async invalidate(pattern: string): Promise<number> {
    let invalidatedCount = 0

    // Invalidate in memory cache
    const entries = Array.from(this.memoryCache.entries())
    for (const [key] of entries) {
      if (this.matchPattern(key, pattern)) {
        this.memoryCache.delete(key)
        invalidatedCount++
      }
    }

    // If Redis is enabled, also invalidate matching keys in Redis
    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        // In Redis, we need to scan keys matching the pattern and delete them
        const keys = await this.redisClient.keys(pattern)
        if (keys.length > 0) {
          await this.redisClient.del(...keys)
          invalidatedCount += keys.length
        }
      } catch (error) {
        logger.warn('Redis invalidate error:', error)
        // Don't disable Redis here, just log the error and continue
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

  /**
   * Close Redis connection properly
   */
  async disconnect(): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.quit()
        this.redisConnected = false
      } catch (error) {
        logger.warn('Error closing Redis connection:', error)
      }
    }
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
