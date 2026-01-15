import { ref, readonly, computed } from 'vue'
import type { Resource } from '~/types/resource'
import type { SuggestionResult } from '~/types/search'
import { useSearchHistory } from '~/composables/useSearchHistory'
import { createFuseForSuggestions } from '~/utils/fuseHelper'

// Composable for managing search suggestions engine
export const useSearchSuggestions = (resources: readonly Resource[]) => {
  const { addSearchToHistory, getSearchHistory } = useSearchHistory()
  const fuse = ref(createFuseForSuggestions(resources))
  const popularSearches = ref<{ query: string; count: number }[]>([])

  // Pre-compute tag and category counts for O(1) lookups
  const tagCountsMap = computed(() => {
    const map = new Map<string, number>()
    resources.forEach(resource => {
      resource.tags?.forEach(tag => {
        map.set(tag, (map.get(tag) || 0) + 1)
      })
    })
    return map
  })

  const categoryCountsMap = computed(() => {
    const map = new Map<string, number>()
    resources.forEach(resource => {
      if (resource.category) {
        map.set(resource.category, (map.get(resource.category) || 0) + 1)
      }
    })
    return map
  })

  // Initialize Fuse.js with optimized configuration for suggestions
  const initSearch = () => {
    // Fuse instance already created by createFuseForSuggestions
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
    searchResults.forEach(result => {
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

    // Add tag suggestions based on query (O(n) with O(1) lookups)
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
                  count: tagCountsMap.value.get(tag) || 0,
                },
              })
            }
          }
        })
      }
    })

    // Add category suggestions based on query (O(n) with O(1) lookups)
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
            count: categoryCountsMap.value.get(resource.category) || 0,
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
    const history = getSearchHistory()
    return history.slice(0, limit).map((query, index) => ({
      text: query,
      type: 'popular' as const, // Using 'popular' type for recent searches too
      score: 0.8 - index * 0.1,
      metadata: {},
    }))
  }

  // Add to search history (delegated to useSearchHistory composable)
  const addToSearchHistory = addSearchToHistory

  // Add to popular searches
  const addToPopularSearches = (query: string) => {
    const existingIndex = popularSearches.value.findIndex(
      p => p.query === query
    )
    if (existingIndex >= 0) {
      popularSearches.value[existingIndex].count++
      popularSearches.value.sort((a, b) => b.count - a.count)
    } else {
      popularSearches.value.push({ query, count: 1 })
      popularSearches.value.sort((a, b) => b.count - a.count)
      if (popularSearches.value.length > 20) {
        popularSearches.value = popularSearches.value.slice(0, 20)
      }
    }
  }

  // Initialize search when composable is created
  initSearch()

  return {
    popularSearches: readonly(popularSearches),
    getSearchSuggestions,
    getPopularSuggestions,
    getRecentSearches,
    addToSearchHistory,
    addToPopularSearches,
    tagCountsMap,
    categoryCountsMap,
  }
}
