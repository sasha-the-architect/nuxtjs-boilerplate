import { describe, it, expect, beforeEach } from 'vitest'
import { useResourceFilters } from '~/composables/useResourceFilters'
import type { Resource } from '~/types/resource'

describe('useResourceFilters', () => {
  const mockResources: readonly Resource[] = [
    {
      id: '1',
      title: 'Test Resource',
      description: 'This is a test resource',
      benefits: ['Benefit 1', 'Benefit 2'],
      url: 'https://example.com',
      category: 'Testing',
      tags: ['test', 'resource'],
      pricing: 'Free',
      difficulty: 'Beginner',
      lastUpdated: '2023-01-01',
    },
    {
      id: '2',
      title: 'Paid Resource',
      description: 'This is a paid resource',
      benefits: ['Benefit 3'],
      url: 'https://example2.com',
      category: 'Development',
      tags: ['dev', 'tool'],
      pricing: 'Paid',
      difficulty: 'Intermediate',
      lastUpdated: '2023-01-02',
    },
    {
      id: '3',
      title: 'Advanced Resource',
      description: 'This is an advanced resource',
      benefits: ['Benefit 4'],
      url: 'https://example3.com',
      category: 'Testing',
      tags: ['advanced', 'tool'],
      pricing: 'Free',
      difficulty: 'Advanced',
      lastUpdated: '2023-01-03',
    },
  ]

  let filtersComposable: ReturnType<typeof useResourceFilters>

  beforeEach(() => {
    filtersComposable = useResourceFilters(mockResources)
  })

  describe('filterByCategory', () => {
    it('should return resources matching the specified category', () => {
      const results = filtersComposable.filterByCategory('Testing')
      expect(results).toHaveLength(2)
      expect(results[0].category).toBe('Testing')
      expect(results[1].category).toBe('Testing')
    })

    it('should return empty array for non-existent category', () => {
      const results = filtersComposable.filterByCategory('NonExistent')
      expect(results).toHaveLength(0)
    })

    it('should return all resources when category is empty', () => {
      const results = filtersComposable.filterByCategory('')
      expect(results).toHaveLength(3)
    })
  })

  describe('filterByPricing', () => {
    it('should return resources matching the specified pricing', () => {
      const results = filtersComposable.filterByPricing('Free')
      expect(results).toHaveLength(2)
      results.forEach(resource => expect(resource.pricing).toBe('Free'))
    })

    it('should return resources with specified pricing when multiple options provided', () => {
      const results = filtersComposable.filterByPricing('Paid')
      expect(results).toHaveLength(1)
      expect(results[0].pricing).toBe('Paid')
    })

    it('should return all resources when pricing is empty', () => {
      const results = filtersComposable.filterByPricing('')
      expect(results).toHaveLength(3)
    })
  })

  describe('filterByDifficulty', () => {
    it('should return resources matching the specified difficulty', () => {
      const results = filtersComposable.filterByDifficulty('Beginner')
      expect(results).toHaveLength(1)
      expect(results[0].difficulty).toBe('Beginner')
    })

    it('should return resources with multiple difficulty levels', () => {
      const results = filtersComposable.filterByDifficulty('Advanced')
      expect(results).toHaveLength(1)
      expect(results[0].difficulty).toBe('Advanced')
    })

    it('should return all resources when difficulty is empty', () => {
      const results = filtersComposable.filterByDifficulty('')
      expect(results).toHaveLength(3)
    })
  })

  describe('filterByTags', () => {
    it('should return resources containing specified tags', () => {
      const results = filtersComposable.filterByTags(['test'])
      expect(results).toHaveLength(1)
      expect(results[0].tags).toContain('test')
    })

    it('should return resources containing any of the specified tags', () => {
      const results = filtersComposable.filterByTags(['test', 'advanced'])
      expect(results).toHaveLength(2)
      expect(results.some(r => r.tags.includes('test'))).toBe(true)
      expect(results.some(r => r.tags.includes('advanced'))).toBe(true)
    })

    it('should return all resources when no tags specified', () => {
      const results = filtersComposable.filterByTags([])
      expect(results).toHaveLength(3)
    })
  })

  describe('filterResources', () => {
    it('should apply multiple filters simultaneously', () => {
      const results = filtersComposable.filterResources({
        category: 'Testing',
        pricing: 'Free',
        difficulty: 'Advanced',
        tags: [],
      })
      expect(results).toHaveLength(1)
      expect(results[0].category).toBe('Testing')
      expect(results[0].pricing).toBe('Free')
      expect(results[0].difficulty).toBe('Advanced')
    })

    it('should return resources matching all filter criteria', () => {
      const results = filtersComposable.filterResources({
        category: '',
        pricing: 'Free',
        difficulty: '',
        tags: [],
      })
      expect(results).toHaveLength(2)
      results.forEach(resource => expect(resource.pricing).toBe('Free'))
    })

    it('should return empty array when no resources match all criteria', () => {
      const results = filtersComposable.filterResources({
        category: 'Testing',
        pricing: 'Paid',
        difficulty: 'Beginner',
        tags: [],
      })
      expect(results).toHaveLength(0)
    })

    it('should return all resources when no filters are applied', () => {
      const results = filtersComposable.filterResources({
        category: '',
        pricing: '',
        difficulty: '',
        tags: [],
      })
      expect(results).toHaveLength(3)
    })
  })

  describe('getFilterOptions', () => {
    it('should return unique categories', () => {
      const options = filtersComposable.getFilterOptions()
      expect(options.categories).toContain('Testing')
      expect(options.categories).toContain('Development')
      expect(options.categories).not.toContain('NonExistent')
    })

    it('should return unique pricing options', () => {
      const options = filtersComposable.getFilterOptions()
      expect(options.pricingOptions).toContain('Free')
      expect(options.pricingOptions).toContain('Paid')
    })

    it('should return unique difficulty levels', () => {
      const options = filtersComposable.getFilterOptions()
      expect(options.difficultyLevels).toContain('Beginner')
      expect(options.difficultyLevels).toContain('Intermediate')
      expect(options.difficultyLevels).toContain('Advanced')
    })

    it('should return unique tags', () => {
      const options = filtersComposable.getFilterOptions()
      expect(options.tags).toContain('test')
      expect(options.tags).toContain('resource')
      expect(options.tags).toContain('dev')
      expect(options.tags).toContain('tool')
      expect(options.tags).toContain('advanced')
    })
  })
})
