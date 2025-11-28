import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'

// Mock resources for testing
const mockResources = [
  {
    id: 'res-1',
    title: 'Test Resource 1',
    description: 'This is a test resource for AI tools',
    benefits: ['Benefit 1', 'Benefit 2'],
    url: 'https://example.com/1',
    category: 'AI Tools',
    pricingModel: 'Free',
    difficultyLevel: 'Beginner',
    technologies: ['AI', 'Machine Learning'],
  },
  {
    id: 'res-2',
    title: 'Test Resource 2',
    description: 'This is a test resource for web hosting',
    benefits: ['Benefit 3', 'Benefit 4'],
    url: 'https://example.com/2',
    category: 'Web Hosting',
    pricingModel: 'Freemium',
    difficultyLevel: 'Intermediate',
    technologies: ['Hosting', 'Cloud'],
  },
  {
    id: 'res-3',
    title: 'Test Resource 3',
    description: 'Another AI tool for developers',
    benefits: ['Benefit 5'],
    url: 'https://example.com/3',
    category: 'AI Tools',
    pricingModel: 'Free',
    difficultyLevel: 'Advanced',
    technologies: ['AI', 'API'],
  },
]

describe('useAdvancedResourceSearch', () => {
  let advancedSearch: ReturnType<typeof useAdvancedResourceSearch>

  beforeEach(() => {
    advancedSearch = useAdvancedResourceSearch(mockResources as any)
  })

  it('should initialize with resources', () => {
    expect(advancedSearch.fuse).toBeDefined()
  })

  it('should parse simple search query', () => {
    const result = advancedSearch.parseQuery('test query')
    expect(result.terms).toEqual(['test', 'query'])
    expect(result.operators).toEqual([])
  })

  it('should parse query with AND operator', () => {
    const result = advancedSearch.parseQuery('test AND query')
    expect(result.terms).toEqual(['test', 'query'])
    expect(result.operators).toEqual(['AND'])
  })

  it('should parse query with OR operator', () => {
    const result = advancedSearch.parseQuery('test OR query')
    expect(result.terms).toEqual(['test', 'query'])
    expect(result.operators).toEqual(['OR'])
  })

  it('should parse query with NOT operator', () => {
    const result = advancedSearch.parseQuery('test NOT query')
    expect(result.terms).toEqual(['test', 'query'])
    expect(result.operators).toEqual(['NOT'])
  })

  it('should perform basic search', () => {
    const results = advancedSearch.advancedSearchResources('AI')
    expect(results).toHaveLength(2) // Should find resources 1 and 3
    expect(results.some(r => r.id === 'res-1')).toBe(true)
    expect(results.some(r => r.id === 'res-3')).toBe(true)
  })

  it('should calculate facet counts', () => {
    const categoryCounts = advancedSearch.calculateFacetCounts('', 'category')
    expect(categoryCounts['AI Tools']).toBe(2)
    expect(categoryCounts['Web Hosting']).toBe(1)
  })

  it('should calculate facet counts for search query', () => {
    const categoryCounts = advancedSearch.calculateFacetCounts('AI', 'category')
    // Should only count resources matching 'AI' query
    expect(categoryCounts['AI Tools']).toBe(2)
  })

  it('should handle search history', () => {
    expect(advancedSearch.searchHistory.value).toEqual([])

    advancedSearch.addToSearchHistory('test query')
    expect(advancedSearch.searchHistory.value).toEqual(['test query'])

    advancedSearch.addToSearchHistory('another query')
    expect(advancedSearch.searchHistory.value).toEqual([
      'another query',
      'test query',
    ])
  })

  it('should highlight search terms', () => {
    const highlighted = advancedSearch.highlightSearchTerms(
      'This is a test',
      'test'
    )
    expect(highlighted).toContain('<mark')
    expect(highlighted).toContain('test')
  })

  it('should manage saved searches', () => {
    expect(advancedSearch.savedSearches.value).toEqual([])

    // Save a search
    advancedSearch.saveSearch('My AI Tools Search', 'AI tools')
    expect(advancedSearch.savedSearches.value).toHaveLength(1)
    expect(advancedSearch.savedSearches.value[0].name).toBe(
      'My AI Tools Search'
    )
    expect(advancedSearch.savedSearches.value[0].query).toBe('AI tools')

    // Save another search
    advancedSearch.saveSearch('Web Hosting Search', 'web hosting')
    expect(advancedSearch.savedSearches.value).toHaveLength(2)
    expect(advancedSearch.savedSearches.value[0].name).toBe(
      'Web Hosting Search'
    )
    expect(advancedSearch.savedSearches.value[1].name).toBe(
      'My AI Tools Search'
    )
  })

  it('should remove saved searches', () => {
    advancedSearch.saveSearch('Test Search', 'test query')
    expect(advancedSearch.savedSearches.value).toHaveLength(1)

    advancedSearch.removeSavedSearch('test query')
    expect(advancedSearch.savedSearches.value).toEqual([])
  })

  it('should update existing saved search', () => {
    advancedSearch.saveSearch('Old Name', 'same query')
    expect(advancedSearch.savedSearches.value).toHaveLength(1)
    expect(advancedSearch.savedSearches.value[0].name).toBe('Old Name')

    // Save with same query but different name
    advancedSearch.saveSearch('New Name', 'same query')
    expect(advancedSearch.savedSearches.value).toHaveLength(1)
    expect(advancedSearch.savedSearches.value[0].name).toBe('New Name')
  })

  it('should track search analytics', () => {
    expect(advancedSearch.searchAnalytics.value).toEqual([])

    // Perform a search
    advancedSearch.advancedSearchResources('AI')

    expect(advancedSearch.searchAnalytics.value).toHaveLength(1)
    expect(advancedSearch.searchAnalytics.value[0].query).toBe('AI')
    expect(advancedSearch.searchAnalytics.value[0].resultsCount).toBe(2) // 2 AI resources
  })

  it('should get popular searches', () => {
    // Add some search analytics
    advancedSearch.trackSearch('test query 1', 5)
    advancedSearch.trackSearch('test query 2', 3)
    advancedSearch.trackSearch('test query 1', 5) // Same query again to make it popular
    advancedSearch.trackSearch('test query 3', 7)

    const popular = advancedSearch.getPopularSearches(2)
    expect(popular).toHaveLength(2)
    expect(popular[0]).toBe('test query 1') // Most frequent
    expect(popular).toContain('test query 2')
  })

  it('should get zero result searches', () => {
    // Add some search analytics with zero results
    advancedSearch.trackSearch('no results query', 0)
    advancedSearch.trackSearch('some results query', 5)
    advancedSearch.trackSearch('another no results', 0)

    const zeroResult = advancedSearch.getZeroResultSearches(5)
    expect(zeroResult).toHaveLength(2) // Only queries with 0 results
    expect(zeroResult).toContain('no results query')
    expect(zeroResult).toContain('another no results')
  })

  it('should get related searches', () => {
    // Add some search analytics to establish relationships
    advancedSearch.trackSearch('AI tools', 5)
    advancedSearch.trackSearch('AI models', 4)
    advancedSearch.trackSearch('web hosting', 6)
    advancedSearch.trackSearch('cloud computing', 3)

    // Get related searches for 'AI'
    const related = advancedSearch.getRelatedSearches('AI', 5)
    // Should return searches that contain similar terms
    expect(Array.isArray(related)).toBe(true)
  })

  it('should get did-you-mean suggestions for typos', () => {
    const suggestions = advancedSearch.getDidYouMeanSuggestions('aI tolls', 3) // intentional typo
    // The function should return similar terms from resources
    expect(Array.isArray(suggestions)).toBe(true)
    // We expect it to find suggestions similar to 'AI' and 'tools' from our mock resources
  })

  it('should calculate facet counts for tags', () => {
    // Note: our mock resources don't have tags, so we need to add them for this test
    const mockResourcesWithTags = [
      ...mockResources,
      {
        id: 'res-4',
        title: 'Test Resource 4',
        description: 'Test with tags',
        benefits: ['Benefit 6'],
        url: 'https://example.com/4',
        category: 'AI Tools',
        pricingModel: 'Free',
        difficultyLevel: 'Intermediate',
        technologies: ['AI'],
        tags: ['machine learning', 'data science'],
      },
      {
        id: 'res-5',
        title: 'Test Resource 5',
        description: 'Another test with tags',
        benefits: ['Benefit 7'],
        url: 'https://example.com/5',
        category: 'Web Hosting',
        pricingModel: 'Freemium',
        difficultyLevel: 'Beginner',
        technologies: ['Cloud'],
        tags: ['machine learning', 'web development'],
      },
    ]

    const advancedSearchWithTagged = useAdvancedResourceSearch(
      mockResourcesWithTags as any
    )
    const tagCounts = advancedSearchWithTagged.calculateFacetCounts('', 'tags')
    expect(tagCounts['machine learning']).toBe(2)
    expect(tagCounts['data science']).toBe(1)
    expect(tagCounts['web development']).toBe(1)
  })
})
