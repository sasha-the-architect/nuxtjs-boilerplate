import { describe, it, expect, beforeEach } from 'vitest'
import { useResourceFilters } from '~/composables/useResourceFilters'
import { filterByAllCriteria } from '~/utils/filter-utils'
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
      pricingModel: 'Free',
      difficulty: 'Beginner',
      technology: ['Vue.js'],
      dateAdded: '2023-01-01',
      popularity: 10,
    },
    {
      id: '2',
      title: 'Paid Resource',
      description: 'This is a paid resource',
      benefits: ['Benefit 3'],
      url: 'https://example2.com',
      category: 'Development',
      tags: ['dev', 'tool'],
      pricingModel: 'Paid',
      difficulty: 'Intermediate',
      technology: ['React'],
      dateAdded: '2023-01-02',
      popularity: 8,
    },
    {
      id: '3',
      title: 'Advanced Resource',
      description: 'This is an advanced resource',
      benefits: ['Benefit 4'],
      url: 'https://example3.com',
      category: 'Testing',
      tags: ['advanced', 'tool'],
      pricingModel: 'Free',
      difficulty: 'Advanced',
      technology: ['Angular'],
      dateAdded: '2023-01-03',
      popularity: 5,
    },
  ]

  let filtersComposable: ReturnType<typeof useResourceFilters>

  beforeEach(() => {
    filtersComposable = useResourceFilters()
  })

  describe('category filtering', () => {
    it('should return resources matching specified category', () => {
      filtersComposable.toggleCategory('Testing')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(2)
      expect(results[0].category).toBe('Testing')
      expect(results[1].category).toBe('Testing')
    })

    it('should return empty array for non-existent category', () => {
      filtersComposable.toggleCategory('NonExistent')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(0)
    })

    it('should return all resources when no category filter is applied', () => {
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(3)
    })
  })

  describe('pricing model filtering', () => {
    it('should return resources matching specified pricing model', () => {
      filtersComposable.togglePricingModel('Free')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(2)
      results.forEach(resource => expect(resource.pricingModel).toBe('Free'))
    })

    it('should return resources with specified pricing model when multiple options provided', () => {
      filtersComposable.togglePricingModel('Paid')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(1)
      expect(results[0].pricingModel).toBe('Paid')
    })

    it('should return all resources when no pricing model filter is applied', () => {
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(3)
    })
  })

  describe('difficulty level filtering', () => {
    it('should return resources matching specified difficulty', () => {
      filtersComposable.toggleDifficultyLevel('Beginner')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(1)
      expect(results[0].difficulty).toBe('Beginner')
    })

    it('should return resources with multiple difficulty levels', () => {
      filtersComposable.toggleDifficultyLevel('Advanced')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(1)
      expect(results[0].difficulty).toBe('Advanced')
    })

    it('should return all resources when no difficulty filter is applied', () => {
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(3)
    })
  })

  describe('tag filtering', () => {
    it('should return resources containing specified tags', () => {
      filtersComposable.toggleTag('test')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(1)
      expect(results[0].tags).toContain('test')
    })

    it('should return resources containing any of specified tags', () => {
      filtersComposable.toggleTag('test')
      filtersComposable.toggleTag('advanced')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(2)
      expect(results.some(r => r.tags.includes('test'))).toBe(true)
      expect(results.some(r => r.tags.includes('advanced'))).toBe(true)
    })

    it('should return all resources when no tag filter is applied', () => {
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(3)
    })
  })

  describe('multiple filter combination', () => {
    it('should apply multiple filters simultaneously', () => {
      filtersComposable.toggleCategory('Testing')
      filtersComposable.togglePricingModel('Free')
      filtersComposable.toggleDifficultyLevel('Advanced')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(1)
      expect(results[0].category).toBe('Testing')
      expect(results[0].pricingModel).toBe('Free')
      expect(results[0].difficulty).toBe('Advanced')
    })

    it('should return resources matching all filter criteria', () => {
      filtersComposable.togglePricingModel('Free')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(2)
      results.forEach(resource => expect(resource.pricingModel).toBe('Free'))
    })

    it('should return empty array when no resources match all criteria', () => {
      filtersComposable.toggleCategory('Testing')
      filtersComposable.togglePricingModel('Paid')
      filtersComposable.toggleDifficultyLevel('Beginner')
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(0)
    })

    it('should return all resources when no filters are applied', () => {
      const results = filterByAllCriteria(
        [...mockResources],
        filtersComposable.filterOptions.value
      )
      expect(results).toHaveLength(3)
    })
  })

  describe('filter options state', () => {
    it('should have initial filter options state', () => {
      expect(filtersComposable.filterOptions.value).toBeDefined()
      expect(filtersComposable.filterOptions.value.categories).toEqual([])
      expect(filtersComposable.filterOptions.value.pricingModels).toEqual([])
      expect(filtersComposable.filterOptions.value.difficultyLevels).toEqual([])
      expect(filtersComposable.filterOptions.value.technologies).toEqual([])
      expect(filtersComposable.filterOptions.value.tags).toEqual([])
      expect(filtersComposable.filterOptions.value.searchQuery).toBe('')
    })

    it('should update filter options when toggling filters', () => {
      filtersComposable.toggleCategory('Testing')
      expect(filtersComposable.filterOptions.value.categories).toContain(
        'Testing'
      )

      filtersComposable.togglePricingModel('Free')
      expect(filtersComposable.filterOptions.value.pricingModels).toContain(
        'Free'
      )

      filtersComposable.toggleDifficultyLevel('Beginner')
      expect(filtersComposable.filterOptions.value.difficultyLevels).toContain(
        'Beginner'
      )

      filtersComposable.toggleTag('test')
      expect(filtersComposable.filterOptions.value.tags).toContain('test')
    })
  })

  describe('reset filters', () => {
    it('should reset all filter options to initial state', () => {
      filtersComposable.toggleCategory('Testing')
      filtersComposable.togglePricingModel('Free')
      filtersComposable.toggleDifficultyLevel('Beginner')
      filtersComposable.toggleTag('test')
      filtersComposable.updateSearchQuery('test query')

      filtersComposable.resetFilters()

      expect(filtersComposable.filterOptions.value.categories).toEqual([])
      expect(filtersComposable.filterOptions.value.pricingModels).toEqual([])
      expect(filtersComposable.filterOptions.value.difficultyLevels).toEqual([])
      expect(filtersComposable.filterOptions.value.technologies).toEqual([])
      expect(filtersComposable.filterOptions.value.tags).toEqual([])
      expect(filtersComposable.filterOptions.value.searchQuery).toBe('')
    })
  })
})
