import { H3Event } from 'h3'

// Simple in-memory cache utility for server-side caching
// In production, you'd want to use a more robust solution like Redis

interface CacheStore {
  [key: string]: {
    data: any
    expiry: number
  }
}

const cacheStore: CacheStore = {}

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
}

export class ServerCache {
  private static instance: ServerCache
  private cache: CacheStore = cacheStore

  static getInstance(): ServerCache {
    if (!ServerCache.instance) {
      ServerCache.instance = new ServerCache()
    }
    return ServerCache.instance
  }

  async get<T = any>(key: string): Promise<T | null> {
    const cached = this.cache[key]
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T
    }
    // Remove expired entry
    if (cached) {
      delete this.cache[key]
    }
    return null
  }

  async set(key: string, data: any, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 300 // Default to 5 minutes
    this.cache[key] = {
      data,
      expiry: Date.now() + ttl * 1000,
    }
  }

  async delete(key: string): Promise<void> {
    delete this.cache[key]
  }

  async deleteByTag(tag: string): Promise<void> {
    // For now, a simple approach - in a real implementation you'd maintain tag indexes
    Object.keys(this.cache).forEach(key => {
      // Simple tag matching based on key patterns
      if (key.includes(tag)) {
        delete this.cache[key]
      }
    })
  }

  async clear(): Promise<void> {
    Object.keys(this.cache).forEach(key => {
      delete this.cache[key]
    })
  }

  // Get cache key for API endpoints with query parameters
  static getApiCacheKey(event: H3Event, prefix: string = 'api'): string {
    const path = event.path || ''
    const query = event.node.req.url?.split('?')[1] || ''
    const cacheKey = `${prefix}:${path}${query ? `?${query}` : ''}`

    // Normalize the cache key by removing variable parts that shouldn't affect caching
    // For example, time-based parameters that change frequently
    return cacheKey
      .replace(/[?&]_=\d+/g, '') // Remove cache buster params
      .replace(/[?&]t=\d+/g, '') // Remove timestamp params
  }
}
