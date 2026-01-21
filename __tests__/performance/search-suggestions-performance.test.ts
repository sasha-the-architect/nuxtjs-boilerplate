import { describe, it, expect, beforeEach } from 'vitest'
import { useSearchSuggestions } from '~/composables/useSearchSuggestions'
import type { Resource } from '~/types/resource'

const createMockResource = (
  id: string,
  title: string,
  category: string,
  tags: string[]
): Resource => {
  return {
    id,
    title,
    description: `Description for ${title}`,
    category,
    url: `https://example.com/${id}`,
    pricingModel: 'free',
    difficulty: 'beginner',
    popularity: 5,
    tags,
    technology: ['JavaScript'],
    benefits: [],
    lastUpdated: new Date(Date.now()).toISOString(),
    dateAdded: new Date(Date.now()).toISOString(),
    alternatives: [],
  }
}

const createMockResources = (count: number): Resource[] => {
  const categories = ['AI Tools', 'Web Hosting', 'Design', 'Productivity']
  const tagPool = [
    'machine learning',
    'frontend',
    'backend',
    'api',
    'automation',
    'nlp',
    'database',
    'cloud',
  ]

  return Array.from({ length: count }, (_, i) => {
    const category = categories[i % categories.length]
    const tags = [
      tagPool[i % tagPool.length],
      tagPool[(i + 1) % tagPool.length],
      tagPool[(i + 2) % tagPool.length],
    ]
    return createMockResource(
      `res-${i}`,
      `Resource ${i} - ${category}`,
      category,
      tags
    )
  })
}

describe('Search Suggestions Performance: O(n) Tag/Category Scanning', () => {
  let resources: Resource[]

  beforeEach(() => {
    resources = createMockResources(1000)
  })

  it('should measure baseline performance for short queries', () => {
    const suggestions = useSearchSuggestions(resources)
    const iterations = 100
    const query = 'machine'

    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      suggestions.getSearchSuggestions(query, 5)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(
      `Search suggestions (100 iterations, 1000 resources, short query "${query}"): ${executionTime.toFixed(4)}ms, avg ${(executionTime / iterations).toFixed(4)}ms`
    )

    expect(executionTime).toBeGreaterThan(0)
  })

  it('should measure baseline performance for long queries', () => {
    const suggestions = useSearchSuggestions(resources)
    const iterations = 100
    const query = 'machine learning frontend'

    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      suggestions.getSearchSuggestions(query, 5)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(
      `Search suggestions (100 iterations, 1000 resources, long query "${query}"): ${executionTime.toFixed(4)}ms, avg ${(executionTime / iterations).toFixed(4)}ms`
    )

    expect(executionTime).toBeGreaterThan(0)
  })

  it('should measure baseline performance for exact resource match', () => {
    const suggestions = useSearchSuggestions(resources)
    const iterations = 100
    const query = 'Resource 100 - AI Tools'

    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      suggestions.getSearchSuggestions(query, 5)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(
      `Search suggestions (100 iterations, 1000 resources, exact match "${query}"): ${executionTime.toFixed(4)}ms, avg ${(executionTime / iterations).toFixed(4)}ms`
    )

    expect(executionTime).toBeGreaterThan(0)
  })

  it('should scale with resource count', () => {
    const sizes = [100, 500, 1000, 2000]
    const query = 'machine'
    const iterations = 50

    console.log('Scaling analysis for search suggestions:')

    sizes.forEach(size => {
      const testResources = createMockResources(size)
      const suggestions = useSearchSuggestions(testResources)

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        suggestions.getSearchSuggestions(query, 5)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      console.log(
        `  ${size} resources: ${executionTime.toFixed(4)}ms total, ${(executionTime / iterations).toFixed(4)}ms avg`
      )
    })

    expect(true).toBe(true)
  })
})
