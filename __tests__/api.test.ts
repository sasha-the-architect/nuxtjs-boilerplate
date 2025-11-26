import { describe, it, expect } from 'vitest'
import { ServerCache } from '../server/utils/cache'

describe('API Rate Limiting and Caching', () => {
  it('should have cache functionality available', async () => {
    const cache = ServerCache.getInstance()
    
    // Test basic cache operations
    const testKey = 'test:key'
    const testData = { message: 'Hello World', value: 123 }
    
    // Clear cache first
    await cache.clear()
    
    // Set a value in cache
    await cache.set(testKey, testData, { ttl: 300 }) // 5 minutes
    
    // Retrieve from cache
    const result = await cache.get(testKey)
    
    expect(result).toEqual(testData)
  })

  it('should handle cache expiration', async () => {
    const cache = ServerCache.getInstance()
    
    // Clear cache first
    await cache.clear()
    
    // Set a value in cache with 1 second TTL
    const testKey = 'test:expiring'
    const testData = { message: 'Will expire' }
    
    await cache.set(testKey, testData, { ttl: 1 }) // 1 second
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100))
    
    // Try to retrieve from cache (should be expired)
    const result = await cache.get(testKey)
    
    expect(result).toBeNull()
  })

  it('should properly invalidate cache by tag', async () => {
    const cache = ServerCache.getInstance()
    
    // Clear cache first
    await cache.clear()
    
    // Set multiple values with a common tag pattern
    await cache.set('api:v1:resources?page=1', { data: 'resources page 1' }, { ttl: 300 })
    await cache.set('api:v1:resources?page=2', { data: 'resources page 2' }, { ttl: 300 })
    await cache.set('other:cache:key', { data: 'other data' }, { ttl: 300 })
    
    // Verify they're in cache
    expect(await cache.get('api:v1:resources?page=1')).not.toBeNull()
    expect(await cache.get('api:v1:resources?page=2')).not.toBeNull()
    expect(await cache.get('other:cache:key')).not.toBeNull()
    
    // Delete by tag pattern (deletes resources-related cache)
    await cache.deleteByTag('api:v1:resources')
    
    // Check that resources cache is gone but other cache remains
    expect(await cache.get('api:v1:resources?page=1')).toBeNull()
    expect(await cache.get('api:v1:resources?page=2')).toBeNull()
    expect(await cache.get('other:cache:key')).not.toBeNull()
  })
})

  it('should handle cache expiration', async () => {
    const cache = ServerCache.getInstance()

    // Clear cache first
    await cache.clear()

    // Set a value in cache with 1 second TTL
    const testKey = 'test:expiring'
    const testData = { message: 'Will expire' }

    await cache.set(testKey, testData, { ttl: 1 }) // 1 second

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100))

    // Try to retrieve from cache (should be expired)
    const result = await cache.get(testKey)

    expect(result).toBeNull()
  })

  it('should properly invalidate cache by tag', async () => {
    const cache = ServerCache.getInstance()

    // Clear cache first
    await cache.clear()

    // Set multiple values with a common tag pattern
    await cache.set(
      'api:v1:resources?page=1',
      { data: 'resources page 1' },
      { ttl: 300 }
    )
    await cache.set(
      'api:v1:resources?page=2',
      { data: 'resources page 2' },
      { ttl: 300 }
    )
    await cache.set('other:cache:key', { data: 'other data' }, { ttl: 300 })

    // Verify they're in cache
    expect(await cache.get('api:v1:resources?page=1')).not.toBeNull()
    expect(await cache.get('api:v1:resources?page=2')).not.toBeNull()
    expect(await cache.get('other:cache:key')).not.toBeNull()

    // Delete by tag pattern (deletes resources-related cache)
    await cache.deleteByTag('api:v1:resources')

    // Check that resources cache is gone but other cache remains
    expect(await cache.get('api:v1:resources?page=1')).toBeNull()
    expect(await cache.get('api:v1:resources?page=2')).toBeNull()
    expect(await cache.get('other:cache:key')).not.toBeNull()
  })
})
