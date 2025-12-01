import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearchSuggestions } from '~/composables/useSearchSuggestions'
import type { Resource } from '~/types/resource'

// Import the internal implementation
import type { SearchQuery, SuggestionResult } from '~/types/search'
import Fuse from 'fuse.js'

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
      benefits: ['Fast', 'Easy to use', 'Great performance'],
      technology: ['Vue.js', 'JavaScript'],
      dateAdded: new Date('2023-01-01').toISOString(),
      popularity: 10,
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
      benefits: ['Powerful', 'Scalable', 'Rich ecosystem'],
      technology: ['React', 'JavaScript'],
      dateAdded: new Date('2023-01-02').toISOString(),
      popularity: 8,
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
      benefits: ['Comprehensive', 'Well structured', 'Official source'],
      technology: ['Vue.js', 'Documentation'],
      dateAdded: new Date('2023-01-03').toISOString(),
      popularity: 15,
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
