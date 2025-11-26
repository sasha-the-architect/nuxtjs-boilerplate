import { apiCache } from './cache'

// Cache warming and invalidation strategies
class CacheManager {
  // Pre-warm commonly accessed cache entries
  async warmCaches(): Promise<void> {
    try {
      // Warm resources cache with common queries
      await this.warmResourcesCache()

      // Warm categories cache
      await this.warmCategoriesCache()
    } catch (error) {
      // In production, you'd want to use a proper logging service
      // console.error('Error during cache warming:', error)
    }
  }

  private async warmResourcesCache(): Promise<void> {
    // Common queries to pre-warm
    const commonQueries = [
      { limit: 20, offset: 0 }, // Default query
      { limit: 50, offset: 0 }, // Popular query
      { category: 'ai', limit: 20, offset: 0 }, // Category filter
      { pricing: 'free', limit: 20, offset: 0 }, // Pricing filter
    ]

    for (const query of commonQueries) {
      const cacheKey = `resources:${JSON.stringify(query)}`

      // Only warm if not already cached
      if (!apiCache.has(cacheKey)) {
        try {
          // Import resources from JSON
          const resourcesModule = await import('~/data/resources.json')
          let resources: any[] = resourcesModule.default || resourcesModule

          // Apply filters based on query
          if (query.category) {
            resources = resources.filter(
              (r: any) =>
                r.category.toLowerCase() === query.category.toLowerCase()
            )
          }
          if (query.pricing) {
            resources = resources.filter(
              (r: any) =>
                r.pricingModel.toLowerCase() === query.pricing.toLowerCase()
            )
          }

          // Apply pagination
          const limit = query.limit || 20
          const offset = query.offset || 0
          const paginatedResources = resources.slice(offset, offset + limit)

          // Cache the result
          apiCache.set(cacheKey, {
            success: true,
            data: paginatedResources,
            pagination: {
              total: resources.length,
              limit,
              offset,
              hasNext: offset + limit < resources.length,
              hasPrev: offset > 0,
            },
          })
        } catch (error) {
          // In production, you'd want to use a proper logging service
          // console.error(`Error warming cache for query ${JSON.stringify(query)}:`, error)
        }
      }
    }
  }

  private async warmCategoriesCache(): Promise<void> {
    try {
      const resourcesModule = await import('~/data/resources.json')
      const resources: any[] = resourcesModule.default || resourcesModule

      // Get unique categories
      const categories = [...new Set(resources.map((r: any) => r.category))]

      // Cache the categories list
      apiCache.set('categories:all', {
        success: true,
        data: categories.map(cat => ({
          name: cat,
          count: resources.filter((r: any) => r.category === cat).length,
        })),
      })
    } catch (error) {
      // In production, you'd want to use a proper logging service
      // console.error('Error warming categories cache:', error)
    }
  }

  // Invalidate cache entries based on patterns
  invalidateByPattern(pattern: string): number {
    let invalidatedCount = 0
    const allKeys = Object.keys(apiCache['store'] || {})

    for (const key of allKeys) {
      if (key.includes(pattern)) {
        apiCache.delete(key)
        invalidatedCount++
      }
    }

    return invalidatedCount
  }

  // Invalidate specific resource-related caches
  invalidateResourceCaches(): void {
    // Invalidate all resource-related caches
    this.invalidateByPattern('resources')

    // Also warm the cache again with default values
    this.warmResourcesCache().catch(error => {
      // In production, you'd want to use a proper logging service
      // console.error('Error warming resources cache after invalidation:', error)
    })
  }

  // Invalidate search-related caches
  invalidateSearchCaches(): void {
    this.invalidateByPattern('search')
  }

  // Get cache statistics
  getStats(): { size: number; memoryUsage: number } {
    return {
      size: Object.keys(apiCache['store'] || {}).length,
      memoryUsage: apiCache.getMemoryUsage(),
    }
  }
}

export const cacheManager = new CacheManager()
