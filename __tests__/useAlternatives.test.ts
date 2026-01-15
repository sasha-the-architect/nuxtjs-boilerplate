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

describe('useAlternatives composable', () => {
  let alternatives: ReturnType<typeof useAlternatives>

  beforeEach(() => {
    alternatives = useAlternatives()
  })

  it('should calculate similarity between resources', () => {
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

    const result = alternatives.calculateAlternativeSimilarity(
      resourceA,
      resourceB
    )
    expect(result.score).toBeGreaterThan(0.7) // High similarity since they share category, tags, and tech
    expect(result.reason).toContain('same category')
  })

  it('should return alternative suggestions for a resource', () => {
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
    }

    const suggestions = alternatives.getAlternativeSuggestions(
      targetResource,
      5
    )

    // Should return resources from the same category
    expect(suggestions.length).toBeGreaterThan(0)
    suggestions.forEach(suggestion => {
      expect(suggestion.resource.category).toBe('Test Category')
      expect(suggestion.score).toBeGreaterThanOrEqual(0)
    })
  })

  it('should return predefined alternatives', () => {
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

    const predefined = alternatives.getPredefinedAlternatives(targetResource)

    expect(predefined.length).toBe(2) // Two predefined alternatives
    expect(predefined[0].resource.id).toBe('2')
    expect(predefined[1].resource.id).toBe('3')
  })

  it('should combine predefined and calculated alternatives', () => {
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

    const allAlternatives = alternatives.getAllAlternatives(targetResource, 5)

    // Should include predefined alternative and calculated ones
    expect(allAlternatives.length).toBeGreaterThan(0)
    const hasPredefined = allAlternatives.some(alt => alt.resource.id === '2')
    expect(hasPredefined).toBe(true)
  })
})
