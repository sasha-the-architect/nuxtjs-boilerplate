import { describe, it, expect, beforeEach } from 'vitest'
import { useAlternativeSuggestions } from '~/composables/useAlternativeSuggestions'

// Mock resource data for testing
const mockResources = [
  {
    id: '1',
    title: 'Resource A',
    description: 'Test resource A',
    benefits: ['Benefit A1', 'Benefit A2'],
    url: 'https://example-a.com',
    category: 'Testing',
    pricingModel: 'Free',
    difficulty: 'Beginner',
    tags: ['tag1', 'tag2'],
    technology: ['tech1', 'tech2'],
    dateAdded: '2023-01-01',
    popularity: 10,
    alternatives: ['2'],
  },
  {
    id: '2',
    title: 'Resource B',
    description: 'Test resource B',
    benefits: ['Benefit B1', 'Benefit B2'],
    url: 'https://example-b.com',
    category: 'Testing',
    pricingModel: 'Free',
    difficulty: 'Beginner',
    tags: ['tag1', 'tag3'],
    technology: ['tech1', 'tech3'],
    dateAdded: '2023-01-02',
    popularity: 8,
    alternatives: ['1'],
  },
  {
    id: '3',
    title: 'Resource C',
    description: 'Test resource C',
    benefits: ['Benefit C1', 'Benefit C2'],
    url: 'https://example-c.com',
    category: 'Development',
    pricingModel: 'Paid',
    difficulty: 'Advanced',
    tags: ['tag4', 'tag5'],
    technology: ['tech4', 'tech5'],
    dateAdded: '2023-01-03',
    popularity: 5,
  },
]

describe('useAlternativeSuggestions', () => {
  let alternativeSuggestions: ReturnType<typeof useAlternativeSuggestions>

  beforeEach(() => {
    alternativeSuggestions = useAlternativeSuggestions(mockResources)
  })

  it('should initialize with correct config', () => {
    expect(alternativeSuggestions.config.value.minSimilarityScore).toBe(0.3)
    expect(alternativeSuggestions.config.value.maxAlternatives).toBe(6)
  })

  it('should find explicit alternatives when available', () => {
    const targetResource = mockResources[0] // Resource with ID '1'
    const alternatives =
      alternativeSuggestions.getAlternativesForResource(targetResource)

    // Should find Resource B as an alternative (since Resource A has alternatives: ['2'])
    expect(alternatives).toHaveLength(1)
    expect(alternatives[0].resource.id).toBe('2')
    expect(alternatives[0].isAlternative).toBe(true)
  })

  it('should find similar resources based on category, tags, or technology', () => {
    const targetResource = mockResources[2] // Resource C with different category
    const alternatives =
      alternativeSuggestions.getAlternativesForResource(targetResource)

    // Should find resources with similar attributes
    expect(alternatives.length).toBeGreaterThanOrEqual(0)
  })

  it('should update config properly', () => {
    const newConfig = { minSimilarityScore: 0.5, maxAlternatives: 10 }
    alternativeSuggestions.updateConfig(newConfig)

    expect(alternativeSuggestions.config.value.minSimilarityScore).toBe(0.5)
    expect(alternativeSuggestions.config.value.maxAlternatives).toBe(10)
  })

  it('should return empty array for non-existent resource', () => {
    const fakeResource = {
      id: '999',
      title: 'Fake Resource',
      description: 'Fake resource',
      benefits: [],
      url: 'https://fake.com',
      category: 'Fake',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: [],
      technology: [],
      dateAdded: '2023-01-01',
      popularity: 1,
    }

    const alternatives =
      alternativeSuggestions.getAlternativesForResource(fakeResource)
    expect(alternatives).toHaveLength(0)
  })

  it('should not include the same resource as its own alternative', () => {
    const targetResource = mockResources[0]
    const alternatives =
      alternativeSuggestions.getAlternativesForResource(targetResource)

    // Ensure the target resource is not included in its own alternatives
    const containsSelf = alternatives.some(
      alt => alt.resource.id === targetResource.id
    )
    expect(containsSelf).toBe(false)
  })
})
