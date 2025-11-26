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
})
