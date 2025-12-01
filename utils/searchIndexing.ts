import Fuse from 'fuse.js'
import type { Resource } from '~/types/resource'

// Define search index structure
interface SearchIndex {
  resources: Fuse<Resource>
  tags: Set<string>
  categories: Set<string>
  popularSearches: Map<string, number>
}

// Search index manager utility
class SearchIndexManager {
  private index: SearchIndex | null = null
  private resources: Resource[] = []

  // Initialize the search index with resources
  initialize(resources: Resource[]) {
    this.resources = resources

    // Create Fuse.js index for resources
    const fuseIndex = new Fuse(resources, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'benefits', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      useExtendedSearch: true,
      minMatchCharLength: 1,
    })

    // Extract unique tags and categories
    const tags = new Set<string>()
    const categories = new Set<string>()

    resources.forEach(resource => {
      if (resource.tags) {
        resource.tags.forEach(tag => tags.add(tag))
      }
      if (resource.category) {
        categories.add(resource.category)
      }
    })

    // Initialize popular searches map
    const popularSearches = new Map<string, number>()

    this.index = {
      resources: fuseIndex,
      tags,
      categories,
      popularSearches,
    }
  }

  // Get the search index (initialize if not already done)
  getIndex(resources?: Resource[]): SearchIndex {
    if (!this.index || (resources && resources !== this.resources)) {
      if (resources) {
        this.initialize(resources)
      } else {
        throw new Error(
          'Search index not initialized and no resources provided'
        )
      }
    }
    return this.index
  }

  // Update the index when resources change
  updateResources(resources: Resource[]) {
    this.initialize(resources)
  }

  // Add a single resource to the index
  addResource(resource: Resource) {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }

    // Note: Fuse.js doesn't have a direct add method, so we reinitialize
    this.resources.push(resource)

    // Update tags and categories
    if (resource.tags) {
      resource.tags.forEach(tag => this.index!.tags.add(tag))
    }
    if (resource.category) {
      this.index!.categories.add(resource.category)
    }

    // Rebuild the fuse index
    this.index.resources = new Fuse(this.resources, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'benefits', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      useExtendedSearch: true,
      minMatchCharLength: 1,
    })
  }

  // Remove a resource from the index
  removeResource(resourceId: string) {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }

    // Filter out the resource
    this.resources = this.resources.filter(
      resource => resource.id !== resourceId
    )

    // Rebuild the fuse index
    this.index.resources = new Fuse(this.resources, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'benefits', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      useExtendedSearch: true,
      minMatchCharLength: 1,
    })

    // Rebuild tags and categories
    const tags = new Set<string>()
    const categories = new Set<string>()

    this.resources.forEach(resource => {
      if (resource.tags) {
        resource.tags.forEach(tag => tags.add(tag))
      }
      if (resource.category) {
        categories.add(resource.category)
      }
    })

    this.index.tags = tags
    this.index.categories = categories
  }

  // Get all available tags
  getTags(): string[] {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }
    return Array.from(this.index.tags)
  }

  // Get all available categories
  getCategories(): string[] {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }
    return Array.from(this.index.categories)
  }

  // Track a search query for popularity
  trackSearchQuery(query: string) {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }

    const currentCount = this.index.popularSearches.get(query) || 0
    this.index.popularSearches.set(query, currentCount + 1)
  }

  // Get popular searches
  getPopularSearches(limit: number = 10): { query: string; count: number }[] {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }

    // Convert map to array and sort by count
    const popularSearches = Array.from(this.index.popularSearches.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)

    return popularSearches.slice(0, limit)
  }
}

// Create a singleton instance
const searchIndexManager = new SearchIndexManager()

export { searchIndexManager, SearchIndexManager }
