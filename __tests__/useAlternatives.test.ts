import { describe, it, expect, beforeEach } from 'vitest'
import { useAlternatives } from '~/composables/useAlternatives'
import type { Resource } from '~/types/resource'

describe('useAlternatives', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Resource 1',
      description: 'A great tool for testing',
      benefits: ['Fast', 'Reliable'],
      url: 'https://example1.com',
      category: 'Testing',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['testing', 'tool'],
      technology: ['JavaScript', 'TypeScript'],
      dateAdded: '2023-01-01',
      popularity: 90,
      alternatives: ['2', '3'],
    },
    {
      id: '2',
      title: 'Resource 2',
      description: 'Another great tool for testing',
      benefits: ['Fast', 'Reliable'],
      url: 'https://example2.com',
      category: 'Testing',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['testing', 'tool', 'automation'],
      technology: ['JavaScript'],
      dateAdded: '2023-01-02',
      popularity: 85,
      alternatives: ['1'],
    },
    {
      id: '3',
      title: 'Resource 3',
      description: 'A different category tool',
      benefits: ['Powerful', 'Flexible'],
      url: 'https://example3.com',
      category: 'Development',
      pricingModel: 'Paid',
      difficulty: 'Advanced',
      tags: ['development', 'framework'],
      technology: ['React', 'Node.js'],
      dateAdded: '2023-01-03',
      popularity: 75,
      alternatives: ['1'],
    },
  ]

  let alternativesComposable: ReturnType<typeof useAlternatives>

  beforeEach(() => {
    alternativesComposable = useAlternatives(mockResources)
  })

  it('should find alternatives based on category, tags, and description', () => {
    const currentResource = mockResources[0] // Resource 1
    const alternatives = alternativesComposable.findAlternatives(
      currentResource,
      5
    )

    // Should find Resource 2 as an alternative (same category and overlapping tags)
    expect(alternatives).toHaveLength(1)
    expect(alternatives[0].resource.id).toBe('2')
    expect(alternatives[0].similarityScore).toBeGreaterThan(0)
  })

  it('should return empty array when no resources provided', () => {
    const emptyComposable = useAlternatives([])
    const alternatives = emptyComposable.findAlternatives(mockResources[0])

    expect(alternatives).toHaveLength(0)
  })

  it('should calculate similarity correctly', () => {
    const similarity = alternativesComposable.calculateSimilarity(
      mockResources[0], // Resource 1
      mockResources[1] // Resource 2
    )

    // Resources 1 and 2 share category and some tags, so similarity should be > 0
    expect(similarity).toBeGreaterThan(0)
    expect(similarity).toBeLessThanOrEqual(1)
  })

  it('should calculate text similarity correctly', () => {
    // This tests the internal text similarity function via the public API
    const similarity = alternativesComposable.calculateSimilarity(
      { ...mockResources[0], description: 'identical text' },
      { ...mockResources[1], description: 'identical text' }
    )

    // When descriptions are identical, similarity should be higher
    expect(similarity).toBeGreaterThan(0.5)
  })

  it('should exclude the same resource from alternatives', () => {
    const alternatives = alternativesComposable.findAlternatives(
      mockResources[0],
      5
    )

    // Should not include the same resource in alternatives
    const sameResourceFound = alternatives.some(
      alt => alt.resource.id === mockResources[0].id
    )
    expect(sameResourceFound).toBe(false)
  })
})
