import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useAlternatives } from '~/composables/useAlternatives'
import type { Resource } from '~/types/resource'

// Mock the useResourceData composable
vi.mock('~/composables/useResourceData', () => ({
  useResourceData: () => ({
    resources: ref([
      {
        id: '1',
        title: 'Resource 1',
        description: 'Description 1',
        benefits: ['Benefit 1'],
        url: 'https://example.com/1',
        category: 'Test Category',
        pricingModel: 'Free',
        difficulty: 'Beginner',
        tags: ['tag1', 'tag2'],
        technology: ['tech1'],
        dateAdded: '2023-01-01',
        popularity: 10,
        alternatives: ['2', '3'],
      },
      {
        id: '2',
        title: 'Resource 2',
        description: 'Description 2',
        benefits: ['Benefit 2'],
        url: 'https://example.com/2',
        category: 'Test Category',
        pricingModel: 'Free',
        difficulty: 'Beginner',
        tags: ['tag1', 'tag3'],
        technology: ['tech1'],
        dateAdded: '2023-01-02',
        popularity: 8,
      },
      {
        id: '3',
        title: 'Resource 3',
        description: 'Description 3',
        benefits: ['Benefit 3'],
        url: 'https://example.com/3',
        category: 'Test Category',
        pricingModel: 'Paid',
        difficulty: 'Intermediate',
        tags: ['tag2', 'tag4'],
        technology: ['tech2'],
        dateAdded: '2023-01-03',
        popularity: 5,
      },
      {
        id: '4',
        title: 'Resource 4',
        description: 'Description 4',
        benefits: ['Benefit 4'],
        url: 'https://example.com/4',
        category: 'Different Category',
        pricingModel: 'Free',
        difficulty: 'Beginner',
        tags: ['tag5'],
        technology: ['tech3'],
        dateAdded: '2023-01-04',
        popularity: 7,
      },
    ]),
  }),
}))

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

  it('should calculate similarity between resources', () => {
    const alternativesComposable = useAlternatives(mockResources)
    const resourceA: Resource = {
      id: 'a',
      title: 'Resource A',
      description: 'Description A',
      benefits: ['Benefit A'],
      url: 'https://example.com/a',
      category: 'Test Category',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['tag1', 'tag2'],
      technology: ['tech1'],
      dateAdded: '2023-01-01',
      popularity: 10,
    }

    const resourceB: Resource = {
      id: 'b',
      title: 'Resource B',
      description: 'Description B',
      benefits: ['Benefit B'],
      url: 'https://example.com/b',
      category: 'Test Category',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['tag1', 'tag2'],
      technology: ['tech1'],
      dateAdded: '2023-01-01',
      popularity: 8,
    }

    const result = alternativesComposable.calculateAlternativeSimilarity(
      resourceA,
      resourceB
    )
    expect(result.score).toBeGreaterThan(0.7) // High similarity since they share category, tags, and tech
    expect(result.reason).toContain('same category')
  })

  it('should find alternatives based on category, tags, and description', () => {
    const alternativesComposable = useAlternatives(mockResources)
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
    const alternativesComposable = useAlternatives(mockResources)
    const similarity = alternativesComposable.calculateSimilarity(
      mockResources[0], // Resource 1
      mockResources[1] // Resource 2
    )

    // Resources 1 and 2 share category and some tags, so similarity should be > 0
    expect(similarity).toBeGreaterThan(0)
    expect(similarity).toBeLessThanOrEqual(1)
  })

  it('should calculate text similarity correctly', () => {
    const alternativesComposable = useAlternatives(mockResources)
    // This tests the internal text similarity function via the public API
    const similarity = alternativesComposable.calculateSimilarity(
      { ...mockResources[0], description: 'identical text' },
      { ...mockResources[1], description: 'identical text' }
    )

    // When descriptions are identical, similarity should be higher
    expect(similarity).toBeGreaterThan(0.5)
  })

  it('should exclude the same resource from alternatives', () => {
    const alternativesComposable = useAlternatives(mockResources)
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

  it('should return alternative suggestions for a resource', () => {
    const alternativesComposable = useAlternatives(mockResources)
    const targetResource: Resource = {
      id: '1',
      title: 'Resource 1',
      description: 'Description 1',
      benefits: ['Benefit 1'],
      url: 'https://example.com/1',
      category: 'Testing',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['tag1', 'tag2'],
      technology: ['tech1'],
      dateAdded: '2023-01-01',
      popularity: 10,
    }

    const suggestions = alternativesComposable.getAlternativeSuggestions(
      targetResource,
      5
    )

    // Should return resources from the same category
    expect(suggestions.length).toBeGreaterThan(0)
    suggestions.forEach(suggestion => {
      expect(suggestion.resource.category).toBe('Testing')
      expect(suggestion.similarityScore).toBeGreaterThanOrEqual(0)
    })
  })

  it('should return predefined alternatives', () => {
    const alternativesComposable = useAlternatives()
    const targetResource: Resource = {
      id: '1',
      title: 'Resource 1',
      description: 'Description 1',
      benefits: ['Benefit 1'],
      url: 'https://example.com/1',
      category: 'Test Category',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['tag1', 'tag2'],
      technology: ['tech1'],
      dateAdded: '2023-01-01',
      popularity: 10,
      alternatives: ['2', '3'],
    }

    const predefined = alternativesComposable.getPredefinedAlternatives(targetResource)

    expect(predefined.length).toBe(2) // Two predefined alternatives
    expect(predefined[0].resource.id).toBe('2')
    expect(predefined[1].resource.id).toBe('3')
  })

  it('should combine predefined and calculated alternatives', () => {
    const alternativesComposable = useAlternatives()
    const targetResource: Resource = {
      id: '1',
      title: 'Resource 1',
      description: 'Description 1',
      benefits: ['Benefit 1'],
      url: 'https://example.com/1',
      category: 'Test Category',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['tag1', 'tag2'],
      technology: ['tech1'],
      dateAdded: '2023-01-01',
      popularity: 10,
      alternatives: ['2'],
    }

    const allAlternatives = alternativesComposable.getAllAlternatives(targetResource, 5)

    // Should include predefined alternative and calculated ones
    expect(allAlternatives.length).toBeGreaterThan(0)
    const hasPredefined = allAlternatives.some(alt => alt.resource.id === '2')
    expect(hasPredefined).toBe(true)
  })
})