import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { useAdvancedSearch } from '~/composables/useAdvancedSearch'
import type { Resource } from '~/types/resource'

// Mock resources for testing
const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Test Resource 1',
    description: 'This is a test resource with AI tools',
    category: 'AI Tools',
    pricingModel: 'Free',
    difficulty: 'Beginner',
    technology: ['AI', 'Machine Learning'],
    url: 'https://example.com/1',
    benefits: ['Fast', 'Efficient'],
  },
  {
    id: '2',
    title: 'Test Resource 2',
    description: 'This is another resource with web hosting',
    category: 'Web Hosting',
    pricingModel: 'Freemium',
    difficulty: 'Intermediate',
    technology: ['Web', 'Cloud'],
    url: 'https://example.com/2',
    benefits: ['Reliable', 'Scalable'],
  },
  {
    id: '3',
    title: 'Test Resource 3',
    description: 'This resource has database technology',
    category: 'Databases',
    pricingModel: 'Free',
    difficulty: 'Advanced',
    technology: ['SQL', 'NoSQL'],
    url: 'https://example.com/3',
    benefits: ['Powerful', 'Flexible'],
  },
]

describe('Advanced Search Functionality', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should perform basic search correctly', () => {
    const { searchResources } = useAdvancedSearch(
      mockResources as readonly Resource[]
    )
    const results = searchResources('AI')

    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Test Resource 1')
  })

  it('should parse advanced query with AND operator', () => {
    const { searchResources } = useAdvancedSearch(
      mockResources as readonly Resource[]
    )
    // This test will check if the advanced query parsing works
    // Note: The actual implementation might need refinement
    const results = searchResources('AI AND tools')

    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Test Resource 1')
  })

  it('should get faceted counts for categories', () => {
    const { getFacetedCounts } = useAdvancedSearch(
      mockResources as readonly Resource[]
    )
    const counts = getFacetedCounts('', 'category')

    expect(counts).toHaveProperty('AI Tools')
    expect(counts).toHaveProperty('Web Hosting')
    expect(counts).toHaveProperty('Databases')
    expect(counts['AI Tools']).toBe(1)
    expect(counts['Web Hosting']).toBe(1)
    expect(counts['Databases']).toBe(1)
  })

  it('should get all filter counts', () => {
    const { getAllFilterCounts } = useAdvancedSearch(
      mockResources as readonly Resource[]
    )
    const allCounts = getAllFilterCounts('')

    expect(allCounts.categories).toHaveProperty('AI Tools')
    expect(allCounts.pricingModels).toHaveProperty('Free')
    expect(allCounts.difficultyLevels).toHaveProperty('Beginner')
    expect(allCounts.technologies).toHaveProperty('AI')
  })

  it('should perform search with tracking', () => {
    const { searchWithTracking, analyticsData } = useAdvancedSearch(
      mockResources as readonly Resource[]
    )
    const results = searchWithTracking('AI')

    expect(results).toHaveLength(1)
    expect(analyticsData.value).toHaveLength(1)
    expect(analyticsData.value[0].query).toBe('AI')
    expect(analyticsData.value[0].resultsCount).toBe(1)
    expect(typeof analyticsData.value[0].searchTime).toBe('number')
  })
})
