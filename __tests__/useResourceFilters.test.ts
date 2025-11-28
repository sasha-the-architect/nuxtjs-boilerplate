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
      pricingModel: 'Free',
      difficulty: 'Beginner',
      technology: ['Vue', 'Nuxt'],
      dateAdded: '2023-01-01',
      popularity: 75,
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
      dateAdded: '2023-06-15',
      popularity: 45,
    },
    {
      id: '3',
      title: 'Advanced Resource',
      description: 'This is an advanced resource',
      benefits: ['Benefit 4'],
      url: 'https://example3.com',
      category: 'Testing',
      tags: ['advanced', 'tool'],
      pricingModel: 'Freemium',
      difficulty: 'Advanced',
      technology: ['Angular'],
      dateAdded: '2023-12-20',
      popularity: 92,
    },
  ]

  let filtersComposable: ReturnType<typeof useResourceFilters>

  beforeEach(() => {
    filtersComposable = useResourceFilters(mockResources)
  })

  describe('initialization', () => {
    it('should initialize with default filter options', () => {
      expect(filtersComposable.filterOptions.value).toEqual({
        searchQuery: '',
        categories: [],
        pricingModels: [],
        difficultyLevels: [],
        technologies: [],
        tags: [],
        popularityRange: undefined,
        dateRange: undefined,
      })
    })

    it('should return all resources when no filters are applied', () => {
      expect(filtersComposable.filteredResources.value).toHaveLength(3)
      expect(filtersComposable.filteredResources.value).toEqual(mockResources)
    })
  })

  describe('category filtering', () => {
    it('should filter resources by selected categories', () => {
      filtersComposable.toggleCategory('Testing')
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(2)
      results.forEach(resource => expect(resource.category).toBe('Testing'))
    })

    it('should handle multiple categories', () => {
      filtersComposable.toggleCategory('Testing')
      filtersComposable.toggleCategory('Development')
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(3)
      expect(results.some(r => r.category === 'Testing')).toBe(true)
      expect(results.some(r => r.category === 'Development')).toBe(true)
    })
  })

  describe('pricing model filtering', () => {
    it('should filter resources by selected pricing models', () => {
      filtersComposable.togglePricingModel('Free')
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(1)
      expect(results[0].pricingModel).toBe('Free')
    })
  })

  describe('difficulty level filtering', () => {
    it('should filter resources by selected difficulty levels', () => {
      filtersComposable.toggleDifficultyLevel('Beginner')
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(1)
      expect(results[0].difficulty).toBe('Beginner')
    })
  })

  describe('technology filtering', () => {
    it('should filter resources by selected technologies', () => {
      filtersComposable.toggleTechnology('Vue')
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(1)
      expect(results[0].technology).toContain('Vue')
    })
  })

  describe('tag filtering', () => {
    it('should filter resources by selected tags', () => {
      filtersComposable.toggleTag('test')
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(1)
      expect(results[0].tags).toContain('test')
    })
  })

  describe('popularity range filtering', () => {
    it('should filter resources by popularity range', () => {
      filtersComposable.setPopularityRange(70, 80)
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('1') // popularity: 75
      expect(results[0].popularity).toBe(75)
    })

    it('should return resources with popularity between min and max', () => {
      filtersComposable.setPopularityRange(40, 80)
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(2)
      expect(results.some(r => r.id === '1')).toBe(true) // popularity: 75
      expect(results.some(r => r.id === '2')).toBe(true) // popularity: 45
      expect(results.some(r => r.id === '3')).toBe(false) // popularity: 92 (too high)
    })

    it('should return all resources when range includes all values', () => {
      filtersComposable.setPopularityRange(0, 100)
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(3)
    })
  })

  describe('date range filtering', () => {
    it('should filter resources by date range', () => {
      filtersComposable.setDateRange('2023-05-01', '2023-08-01')
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('2') // dateAdded: '2023-06-15'
    })

    it('should filter with only start date', () => {
      filtersComposable.setDateRange('2023-06-01', undefined)
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(2)
      expect(results.some(r => r.id === '2')).toBe(true) // '2023-06-15'
      expect(results.some(r => r.id === '3')).toBe(true) // '2023-12-20'
      expect(results.some(r => r.id === '1')).toBe(false) // '2023-01-01' (before range)
    })

    it('should filter with only end date', () => {
      filtersComposable.setDateRange(undefined, '2023-06-01')
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('1') // '2023-01-01' (before June 1st)
    })

    it('should return all resources when no date range is specified', () => {
      filtersComposable.setDateRange(undefined, undefined)
      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(3)
    })
  })

  describe('combined filtering', () => {
    it('should apply both popularity and date range filters', () => {
      filtersComposable.setPopularityRange(40, 80)
      filtersComposable.setDateRange('2023-01-01', '2023-07-01')

      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(2)
      // Should include resource 1 (popularity 75, date '2023-01-01')
      // and resource 2 (popularity 45, date '2023-06-15')
      expect(results.some(r => r.id === '1')).toBe(true)
      expect(results.some(r => r.id === '2')).toBe(true)
    })

    it('should combine with other filters', () => {
      filtersComposable.toggleCategory('Testing')
      filtersComposable.setPopularityRange(90, 100)

      const results = filtersComposable.filteredResources.value

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('3') // Testing with popularity 92
    })
  })

  describe('reset filters', () => {
    it('should reset all filters including popularity and date range', () => {
      // Apply some filters
      filtersComposable.toggleCategory('Testing')
      filtersComposable.setPopularityRange(80, 100)
      filtersComposable.setDateRange('2023-01-01', '2023-12-31')

      // Verify filters are applied
      expect(filtersComposable.filteredResources.value).toHaveLength(1) // Only resource 3 matches all
      expect(filtersComposable.filterOptions.value.categories).toContain(
        'Testing'
      )
      expect(filtersComposable.filterOptions.value.popularityRange).toEqual([
        80, 100,
      ])
      expect(filtersComposable.filterOptions.value.dateRange).toEqual({
        start: '2023-01-01',
        end: '2023-12-31',
      })

      // Reset filters
      filtersComposable.resetFilters()

      // Verify all filters are reset
      expect(filtersComposable.filteredResources.value).toHaveLength(3)
      expect(filtersComposable.filterOptions.value).toEqual({
        searchQuery: '',
        categories: [],
        pricingModels: [],
        difficultyLevels: [],
        technologies: [],
        tags: [],
        popularityRange: undefined,
        dateRange: undefined,
      })
    })
  })
})
