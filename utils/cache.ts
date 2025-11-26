// Application-level caching utility with in-memory store
// In production, you'd want to use a more robust solution like Redis

interface CacheEntry<T = any> {
  value: T
  expiry: number
  createdAt: number
}

interface CacheStore {
  [key: string]: CacheEntry
}

type TimeoutHandle = ReturnType<typeof setTimeout>

class InMemoryCache {
  private store: CacheStore = {}
  private cleanupInterval: TimeoutHandle | null = null

  constructor() {
    // Set up periodic cleanup of expired entries
    this.startCleanupInterval()
  }

  private startCleanupInterval() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpired()
      },
      5 * 60 * 1000
    ) // 5 minutes
  }

  set<T>(key: string, value: T, ttl: number = 300): void {
    // Default TTL: 5 minutes
    const now = Date.now()
    this.store[key] = {
      value,
      expiry: now + ttl * 1000,
      createdAt: now,
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store[key]
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiry) {
      // Entry has expired
      this.delete(key)
      return null
    }

    return entry.value
  }

  has(key: string): boolean {
    const entry = this.store[key]
    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiry) {
      // Entry has expired
      this.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }

  private cleanupExpired(): void {
    const now = Date.now()
    for (const key in this.store) {
      if (this.store[key].expiry < now) {
        delete this.store[key]
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    // For a more complete implementation, we would track hits/misses
    // This is a simplified version
    return {
      size: Object.keys(this.store).length,
      hits: 0,
      misses: 0,
      hitRate: 0,
    }
  }

  // Get cache memory usage (approximate)
  getMemoryUsage(): number {
    return JSON.stringify(this.store).length
  }
}

// Create a global cache instance
export const apiCache = new InMemoryCache()

// Predefined cache strategies for different types of data
export const CACHE_STRATEGIES = {
  resources: { ttl: 300 }, // 5 minutes
  categories: { ttl: 600 }, // 10 minutes
  search: { ttl: 120 }, // 2 minutes
  rss: { ttl: 1800 }, // 30 minutes
  export: { ttl: 3600 }, // 1 hour
  default: { ttl: 300 }, // 5 minutes
}

// Get appropriate TTL based on cache key
export function getCacheTTL(key: string): number {
  if (key.includes('resources')) return CACHE_STRATEGIES.resources.ttl
  if (key.includes('categories')) return CACHE_STRATEGIES.categories.ttl
  if (key.includes('search')) return CACHE_STRATEGIES.search.ttl
  if (key.includes('rss')) return CACHE_STRATEGIES.rss.ttl
  if (key.includes('export')) return CACHE_STRATEGIES.export.ttl
  return CACHE_STRATEGIES.default.ttl
}
