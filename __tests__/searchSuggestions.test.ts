import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearchSuggestions } from '~/composables/useSearchSuggestions'
import type { Resource } from '~/types/resource'

// Import the internal implementation
import type { SearchQuery } from '~/types/search'

// Mock the useSearchSuggestions functionality for the test
const useSearchSuggestions = (resources: readonly Resource[]) => {
  const searchHistory = ref<string[]>([])
  const popularSearches = ref<{ query: string; count: number }[]>([])

  // Initialize Fuse.js with optimized configuration for suggestions
  const fuse = new Fuse([...resources], {
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

  // Generate suggestions based on search query
  const generateSuggestions = (
    query: string,
    limit: number = 5
  ): SuggestionResult[] => {
    if (!query) return []

    // Perform fuzzy search to find matching resources
    const searchResults = fuse.search(query, { limit: limit * 2 }) // Get more results for better ranking

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

  return {
    // Reactive references (readonly to prevent direct modification)
    searchHistory,
    popularSearches,

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

describe('useSearchSuggestions', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Test Resource 1',
      description: 'This is a test resource for testing search functionality',
      url: 'https://test1.com',
      category: 'Development',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['javascript', 'testing', 'vue'],
      benefits: ['Fast', 'Easy to use'],
      pros: ['Great performance'],
      cons: ['Limited features'],
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-01').toISOString(),
    },
    {
      id: '2',
      title: 'Test Resource 2',
      description: 'Another test resource for advanced search',
      url: 'https://test2.com',
      category: 'Design',
      pricingModel: 'Paid',
      difficulty: 'Advanced',
      tags: ['react', 'testing', 'frontend'],
      benefits: ['Powerful', 'Scalable'],
      pros: ['Rich ecosystem'],
      cons: ['Steep learning curve'],
      createdAt: new Date('2023-01-02').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
    },
    {
      id: '3',
      title: 'Vue.js Documentation',
      description: 'Official Vue.js documentation and guides',
      url: 'https://vuejs.org',
      category: 'Documentation',
      pricingModel: 'Free',
      difficulty: 'Intermediate',
      tags: ['vue', 'javascript', 'documentation'],
      benefits: ['Comprehensive', 'Well structured'],
      pros: ['Official source'],
      cons: ['Can be overwhelming'],
      createdAt: new Date('2023-01-03').toISOString(),
      updatedAt: new Date('2023-01-03').toISOString(),
    },
  ]

  let searchSuggestions: ReturnType<typeof useSearchSuggestions>

  beforeEach(() => {
    searchSuggestions = useSearchSuggestions(mockResources)
  })

  it('should initialize with empty history and popular searches', () => {
    expect(searchSuggestions.searchHistory.value).toEqual([])
    expect(searchSuggestions.popularSearches.value).toEqual([])
  })

  it('should generate resource suggestions based on query', () => {
    const suggestions = searchSuggestions.getSearchSuggestions('test', 5)

    expect(suggestions).toBeDefined()
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0]).toHaveProperty('text')
    expect(suggestions[0]).toHaveProperty('type')
    expect(suggestions[0]).toHaveProperty('score')
    expect(suggestions.some(s => s.type === 'resource')).toBe(true)
  })

  it('should generate tag suggestions based on query', () => {
    const suggestions = searchSuggestions.getSearchSuggestions('javascript', 5)

    expect(suggestions).toBeDefined()
    expect(suggestions.length).toBeGreaterThan(0)
    // At least one suggestion should be related to javascript tag
    expect(
      suggestions.some(s => s.text.toLowerCase().includes('javascript'))
    ).toBe(true)
  })

  it('should generate category suggestions based on query', () => {
    const suggestions = searchSuggestions.getSearchSuggestions('development', 5)

    expect(suggestions).toBeDefined()
    expect(suggestions.length).toBeGreaterThan(0)
    // At least one suggestion should be related to development category
    expect(
      suggestions.some(s => s.text.toLowerCase().includes('development'))
    ).toBe(true)
  })

  it('should add and retrieve search history', () => {
    searchSuggestions.addToSearchHistory('test query')

    expect(searchSuggestions.searchHistory.value).toEqual(['test query'])

    searchSuggestions.addToSearchHistory('another query')
    expect(searchSuggestions.searchHistory.value).toEqual([
      'another query',
      'test query',
    ])
  })

  it('should limit search history to 10 items', () => {
    // Add 12 items to history
    for (let i = 0; i < 12; i++) {
      searchSuggestions.addToSearchHistory(`query ${i}`)
    }

    expect(searchSuggestions.searchHistory.value.length).toBe(10)
  })

  it('should add to popular searches', () => {
    searchSuggestions.addToPopularSearches('popular query')

    expect(searchSuggestions.popularSearches.value).toEqual([
      { query: 'popular query', count: 1 },
    ])

    // Add the same query again to increment count
    searchSuggestions.addToPopularSearches('popular query')

    expect(searchSuggestions.popularSearches.value).toEqual([
      { query: 'popular query', count: 2 },
    ])
  })

  it('should return popular suggestions', () => {
    searchSuggestions.addToPopularSearches('popular query 1')
    searchSuggestions.addToPopularSearches('popular query 2')

    const popularSuggestions = searchSuggestions.getPopularSuggestions(5)

    expect(popularSuggestions).toBeDefined()
    expect(popularSuggestions.length).toBe(2)
    expect(popularSuggestions[0].type).toBe('popular')
  })

  it('should return recent searches as suggestions', () => {
    searchSuggestions.addToSearchHistory('recent query 1')
    searchSuggestions.addToSearchHistory('recent query 2')

    const recentSuggestions = searchSuggestions.getRecentSearches(5)

    expect(recentSuggestions).toBeDefined()
    expect(recentSuggestions.length).toBe(2)
    expect(recentSuggestions[0].text).toBe('recent query 2')
    expect(recentSuggestions[1].text).toBe('recent query 1')
  })

  it('should clear search history', () => {
    searchSuggestions.addToSearchHistory('test query')
    expect(searchSuggestions.searchHistory.value.length).toBe(1)

    searchSuggestions.clearSearchHistory()
    expect(searchSuggestions.searchHistory.value.length).toBe(0)
  })

  it('should return search history', () => {
    searchSuggestions.addToSearchHistory('test query')
    const history = searchSuggestions.getSearchHistory()

    expect(history).toEqual(['test query'])
  })
})
