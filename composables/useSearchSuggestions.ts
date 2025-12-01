import { ref, readonly, computed } from 'vue'
import Fuse from 'fuse.js'
import type { Resource } from '~/types/resource'
import type { SuggestionResult } from '~/types/search'

// Composable for managing search suggestions engine
export const useSearchSuggestions = (resources: readonly Resource[]) => {
  const fuse = ref<Fuse<Resource> | null>(null)
  const searchHistory = ref<string[]>([])
  const popularSearches = ref<{ query: string; count: number }[]>([])

  // Initialize Fuse.js with optimized configuration for suggestions
  const initSearch = () => {
    fuse.value = new Fuse([...resources], {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'benefits', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      useExtendedSearch: true, // Enable extended search syntax for better suggestions
      minMatchCharLength: 1, // Allow single character matches for suggestions
    })
  }

  // Create optimized search indices for suggestions
  const createSuggestionsIndex = () => {
    // This would normally be pre-computed for better performance
    // For now, we'll use the existing resources to create suggestions
    return resources
  }

  // Generate suggestions based on search query
  const generateSuggestions = (
    query: string,
    limit: number = 5
  ): SuggestionResult[] => {
    if (!query || !fuse.value) return []

    // Perform fuzzy search to find matching resources
    const searchResults = fuse.value.search(query, { limit: limit * 2 }) // Get more results for better ranking

    // Transform search results to suggestion format
    const suggestions: SuggestionResult[] = []

    // Add resource suggestions
    searchResults.forEach((result, index) => {
      suggestions.push({
        text: result.item.title,
        type: 'resource',
        score: result.score ? 1 - result.score : 0.5,
        resourceId: result.item.id,
        metadata: {
          description:
            result.item.description.substring(0, 100) +
            (result.item.description.length > 100 ? '...' : ''),
          category: result.item.category,
          tags: result.item.tags,
          url: result.item.url,
        },
      })
    })

    // Add tag suggestions based on query
    const tagMatches = new Set<string>()
    resources.forEach(resource => {
      if (resource.tags) {
        resource.tags.forEach(tag => {
          if (
            tag.toLowerCase().includes(query.toLowerCase()) &&
            !tagMatches.has(tag)
          ) {
            tagMatches.add(tag)
            if (tagMatches.size <= limit) {
              suggestions.push({
                text: tag,
                type: 'tag',
                score: 0.7, // Lower priority than exact resource matches
                metadata: {
                  tag: tag,
                  count: resources.filter(r => r.tags?.includes(tag)).length,
                },
              })
            }
          }
        })
      }
    })

    // Add category suggestions based on query
    const categoryMatches = new Set<string>()
    resources.forEach(resource => {
      if (
        resource.category &&
        resource.category.toLowerCase().includes(query.toLowerCase()) &&
        !categoryMatches.has(resource.category)
      ) {
        categoryMatches.add(resource.category)
        suggestions.push({
          text: resource.category,
          type: 'category',
          score: 0.6, // Lower priority than tags
          metadata: {
            category: resource.category,
            count: resources.filter(r => r.category === resource.category)
              .length,
          },
        })
      }
    })

    // Add popular searches if the query is empty or short
    if (query.length < 3) {
      popularSearches.value.slice(0, limit).forEach((popular, index) => {
        suggestions.push({
          text: popular.query,
          type: 'popular',
          score: 0.9 - index * 0.1, // Higher priority for more popular searches
          metadata: {
            count: popular.count,
            popularity: index + 1,
          },
        })
      })
    }

    // Sort suggestions by score (relevance)
    suggestions.sort((a, b) => b.score - a.score)

    // Return only the requested limit
    return suggestions.slice(0, limit)
  }

  // Get search suggestions with debouncing consideration
  const getSearchSuggestions = (query: string, limit: number = 5) => {
    return generateSuggestions(query, limit)
  }

  // Get popular suggestions
  const getPopularSuggestions = (limit: number = 5) => {
    return popularSearches.value.slice(0, limit).map((popular, index) => ({
      text: popular.query,
      type: 'popular' as const,
      score: 0.9 - index * 0.1,
      metadata: {
        count: popular.count,
      },
    }))
  }

  // Get recent search history suggestions
  const getRecentSearches = (limit: number = 5) => {
    return searchHistory.value.slice(0, limit).map((query, index) => ({
      text: query,
      type: 'popular' as const, // Using 'popular' type for recent searches too
      score: 0.8 - index * 0.1,
      metadata: {},
    }))
  }

  // Add to search history
  const addToSearchHistory = (query: string) => {
    if (query && !searchHistory.value.includes(query)) {
      searchHistory.value.unshift(query)
      // Limit to 10 most recent searches
      if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10)
      }
    }
  }

  // Add to popular searches
  const addToPopularSearches = (query: string) => {
    const existingIndex = popularSearches.value.findIndex(
      p => p.query === query
    )
    if (existingIndex >= 0) {
      // Increment count if already exists
      popularSearches.value[existingIndex].count++
      // Re-sort by count
      popularSearches.value.sort((a, b) => b.count - a.count)
    } else {
      // Add new popular search
      popularSearches.value.push({ query, count: 1 })
      // Re-sort by count
      popularSearches.value.sort((a, b) => b.count - a.count)
      // Limit to 20 popular searches
      if (popularSearches.value.length > 20) {
        popularSearches.value = popularSearches.value.slice(0, 20)
      }
    }
  }

  // Clear search history
  const clearSearchHistory = () => {
    searchHistory.value = []
  }

  // Get all search history
  const getSearchHistory = () => {
    return [...searchHistory.value]
  }

  // Initialize search when composable is created
  initSearch()

  return {
    // Reactive references (readonly to prevent direct modification)
    searchHistory: readonly(searchHistory),
    popularSearches: readonly(popularSearches),

    // Methods
    getSearchSuggestions,
    getPopularSuggestions,
    getRecentSearches,
    addToSearchHistory,
    addToPopularSearches,
    clearSearchHistory,
    getSearchHistory,
  }
}
