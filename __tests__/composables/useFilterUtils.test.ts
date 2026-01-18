import { describe, it, expect } from 'vitest'
import type { Resource } from '~/types/resource'
import {
  hasActiveFilter,
  matchesCategory,
  matchesPricingModel,
  matchesDifficultyLevel,
  matchesTechnology,
  matchesTag,
  filterByAllCriteria,
  parseDate,
} from '~/utils/filter-utils'

describe('filter-utils', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Test Resource 1',
      description: 'Description 1',
      benefits: ['benefit1', 'benefit2'],
      url: 'https://example.com/1',
      category: 'Framework',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      technology: ['TypeScript', 'Vue'],
      tags: ['frontend', 'web'],
      dateAdded: '2024-01-01',
      popularity: 100,
      rating: 4.5,
      viewCount: 100,
    },
    {
      id: '2',
      title: 'Test Resource 2',
      description: 'Description 2',
      benefits: ['benefit1'],
      url: 'https://example.com/2',
      category: 'Library',
      pricingModel: 'Paid',
      difficulty: 'Intermediate',
      technology: ['JavaScript', 'React'],
      tags: ['backend', 'api'],
      dateAdded: '2024-02-01',
      popularity: 200,
      rating: 3.5,
      viewCount: 200,
    },
    {
      id: '3',
      title: 'Test Resource 3',
      description: 'Description 3',
      benefits: ['benefit1', 'benefit2', 'benefit3'],
      url: 'https://example.com/3',
      category: 'Tool',
      pricingModel: 'Freemium',
      difficulty: 'Advanced',
      technology: ['Python', 'Django'],
      tags: ['data', 'machine-learning'],
      dateAdded: '2024-03-01',
      popularity: 300,
      rating: 5,
      viewCount: 300,
    },
  ]

  describe('hasActiveFilter', () => {
    it('should return false for undefined filters', () => {
      expect(hasActiveFilter(undefined)).toBe(false)
    })

    it('should return false for empty array', () => {
      expect(hasActiveFilter([])).toBe(false)
    })

    it('should return true for array with items', () => {
      expect(hasActiveFilter(['Framework', 'Library'])).toBe(true)
    })

    it('should return true for single item array', () => {
      expect(hasActiveFilter(['Framework'])).toBe(true)
    })
  })

  describe('matchesCategory', () => {
    it('should return true when no categories filter is active', () => {
      const resource = mockResources[0]
      expect(matchesCategory(resource, undefined)).toBe(true)
    })

    it('should return true when resource category matches filter', () => {
      const resource = mockResources[0]
      expect(matchesCategory(resource, ['Framework', 'Library'])).toBe(true)
    })

    it('should return false when resource category does not match filter', () => {
      const resource = mockResources[0]
      expect(matchesCategory(resource, ['Library', 'Tool'])).toBe(false)
    })

    it('should handle single category filter', () => {
      const resource = mockResources[1]
      expect(matchesCategory(resource, ['Library'])).toBe(true)
      expect(matchesCategory(resource, ['Framework'])).toBe(false)
    })

    it('should be case-sensitive', () => {
      const resource = mockResources[0]
      expect(matchesCategory(resource, ['framework'])).toBe(false)
    })
  })

  describe('matchesPricingModel', () => {
    it('should return true when no pricing models filter is active', () => {
      const resource = mockResources[0]
      expect(matchesPricingModel(resource, undefined)).toBe(true)
    })

    it('should return true when resource pricing model matches filter', () => {
      const resource = mockResources[0]
      expect(matchesPricingModel(resource, ['Free', 'Paid'])).toBe(true)
    })

    it('should return false when resource pricing model does not match filter', () => {
      const resource = mockResources[0]
      expect(matchesPricingModel(resource, ['Paid', 'Freemium'])).toBe(false)
    })

    it('should handle all pricing model options', () => {
      expect(matchesPricingModel(mockResources[0], ['Free'])).toBe(true)
      expect(matchesPricingModel(mockResources[1], ['Paid'])).toBe(true)
      expect(matchesPricingModel(mockResources[2], ['Freemium'])).toBe(true)
    })

    it('should be case-sensitive', () => {
      const resource = mockResources[0]
      expect(matchesPricingModel(resource, ['free'])).toBe(false)
    })
  })

  describe('matchesDifficultyLevel', () => {
    it('should return true when no difficulty filter is active', () => {
      const resource = mockResources[0]
      expect(matchesDifficultyLevel(resource, undefined)).toBe(true)
    })

    it('should return true when resource difficulty matches filter', () => {
      const resource = mockResources[0]
      expect(
        matchesDifficultyLevel(resource, ['Beginner', 'Intermediate'])
      ).toBe(true)
    })

    it('should return false when resource difficulty does not match filter', () => {
      const resource = mockResources[0]
      expect(
        matchesDifficultyLevel(resource, ['Intermediate', 'Advanced'])
      ).toBe(false)
    })

    it('should handle all difficulty levels', () => {
      expect(matchesDifficultyLevel(mockResources[0], ['Beginner'])).toBe(true)
      expect(matchesDifficultyLevel(mockResources[1], ['Intermediate'])).toBe(
        true
      )
      expect(matchesDifficultyLevel(mockResources[2], ['Advanced'])).toBe(true)
    })

    it('should be case-sensitive', () => {
      const resource = mockResources[0]
      expect(matchesDifficultyLevel(resource, ['beginner'])).toBe(false)
    })
  })

  describe('matchesTechnology', () => {
    it('should return true when no technology filter is active', () => {
      const resource = mockResources[0]
      expect(matchesTechnology(resource, undefined)).toBe(true)
    })

    it('should return true when resource has matching technology', () => {
      const resource = mockResources[0]
      expect(matchesTechnology(resource, ['TypeScript', 'Python'])).toBe(true)
    })

    it('should return false when resource has no matching technology', () => {
      const resource = mockResources[0]
      expect(matchesTechnology(resource, ['Python', 'Django'])).toBe(false)
    })

    it('should match any technology in array', () => {
      const resource = mockResources[0]
      expect(matchesTechnology(resource, ['Vue'])).toBe(true)
      expect(matchesTechnology(resource, ['TypeScript'])).toBe(true)
    })

    it('should handle empty technology array in resource', () => {
      const resource: Resource = { ...mockResources[0], technology: [] }
      expect(matchesTechnology(resource, ['TypeScript'])).toBe(false)
    })

    it('should handle single technology filter', () => {
      const resource = mockResources[0]
      expect(matchesTechnology(resource, ['TypeScript'])).toBe(true)
      expect(matchesTechnology(resource, ['React'])).toBe(false)
    })

    it('should match multiple technologies in filter', () => {
      const resource = mockResources[0]
      expect(matchesTechnology(resource, ['React', 'TypeScript', 'Vue'])).toBe(
        true
      )
    })
  })

  describe('matchesTag', () => {
    it('should return true when no tags filter is active', () => {
      const resource = mockResources[0]
      expect(matchesTag(resource, undefined)).toBe(true)
    })

    it('should return true when resource has matching tag', () => {
      const resource = mockResources[0]
      expect(matchesTag(resource, ['frontend', 'backend'])).toBe(true)
    })

    it('should return false when resource has no matching tag', () => {
      const resource = mockResources[0]
      expect(matchesTag(resource, ['backend', 'api'])).toBe(false)
    })

    it('should match any tag in array', () => {
      const resource = mockResources[0]
      expect(matchesTag(resource, ['frontend'])).toBe(true)
      expect(matchesTag(resource, ['web'])).toBe(true)
    })

    it('should handle empty tags array in resource', () => {
      const resource: Resource = { ...mockResources[0], tags: [] }
      expect(matchesTag(resource, ['frontend'])).toBe(false)
    })

    it('should handle single tag filter', () => {
      const resource = mockResources[0]
      expect(matchesTag(resource, ['frontend'])).toBe(true)
      expect(matchesTag(resource, ['backend'])).toBe(false)
    })

    it('should match multiple tags in filter', () => {
      const resource = mockResources[0]
      expect(matchesTag(resource, ['backend', 'api', 'frontend'])).toBe(true)
    })
  })

  describe('filterByAllCriteria', () => {
    it('should return all resources when no filters are active', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: undefined,
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(3)
      expect(result).toEqual(mockResources)
    })

    it('should filter by category only', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: ['Framework'],
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter by pricing model only', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: undefined,
        pricingModels: ['Paid'],
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('should filter by difficulty only', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: undefined,
        pricingModels: undefined,
        difficultyLevels: ['Intermediate'],
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('should filter by technology only', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: undefined,
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: ['TypeScript'],
        tags: undefined,
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter by tags only', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: undefined,
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: undefined,
        tags: ['frontend'],
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter by multiple criteria', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: ['Framework', 'Library'],
        pricingModels: ['Free'],
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter by all criteria', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: ['Framework'],
        pricingModels: ['Free'],
        difficultyLevels: ['Beginner'],
        technologies: ['TypeScript'],
        tags: ['frontend'],
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should return empty array when no resources match', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: ['NonExistent'],
        pricingModels: ['Free'],
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(0)
    })

    it('should handle multiple matching resources', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: ['Framework', 'Library'],
        pricingModels: ['Free', 'Paid'],
        difficultyLevels: ['Beginner', 'Intermediate'],
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(2)
    })

    it('should filter with multiple categories', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: ['Framework', 'Library'],
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(2)
    })

    it('should filter with multiple technologies', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: undefined,
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: ['TypeScript', 'React'],
        tags: undefined,
      })

      expect(result).toHaveLength(2)
    })

    it('should filter with multiple tags', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: undefined,
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: undefined,
        tags: ['frontend', 'backend'],
      })

      expect(result).toHaveLength(2)
    })

    it('should handle mixed matching criteria', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: ['Framework'],
        pricingModels: ['Free', 'Paid'],
        difficultyLevels: ['Beginner'],
        technologies: ['TypeScript', 'React'],
        tags: ['frontend', 'web'],
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should maintain original order of resources', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: undefined,
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      })

      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
      expect(result[2].id).toBe('3')
    })
  })

  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const timestamp = parseDate('2024-01-15')
      expect(timestamp).toBeGreaterThan(0)
    })

    it('should parse ISO date string', () => {
      const timestamp = parseDate('2024-01-15T10:30:00Z')
      expect(timestamp).toBeGreaterThan(0)
    })

    it('should return 0 for empty string', () => {
      const timestamp = parseDate('')
      expect(timestamp).toBe(0)
    })

    it('should return 0 for undefined', () => {
      const timestamp = parseDate(undefined as any)
      expect(timestamp).toBe(0)
    })

    it('should return 0 for invalid date string', () => {
      const timestamp = parseDate('invalid-date')
      expect(timestamp).toBe(0)
    })

    it('should return 0 for null', () => {
      const timestamp = parseDate(null as any)
      expect(timestamp).toBe(0)
    })

    it('should return consistent timestamp for same date', () => {
      const timestamp1 = parseDate('2024-01-15')
      const timestamp2 = parseDate('2024-01-15')
      expect(timestamp1).toBe(timestamp2)
    })

    it('should handle different date formats', () => {
      const timestamp1 = parseDate('2024-01-15')
      const timestamp2 = parseDate('01/15/2024')
      expect(timestamp1).toBeGreaterThan(0)
      expect(timestamp2).toBeGreaterThan(0)
    })

    it('should compare dates correctly', () => {
      const timestamp1 = parseDate('2024-01-01')
      const timestamp2 = parseDate('2024-02-01')
      expect(timestamp1).toBeLessThan(timestamp2)
    })

    it('should handle dates with time components', () => {
      const timestamp1 = parseDate('2024-01-15T00:00:00Z')
      const timestamp2 = parseDate('2024-01-15T12:00:00Z')
      expect(timestamp2).toBeGreaterThan(timestamp1)
    })

    it('should return number type', () => {
      const timestamp = parseDate('2024-01-15')
      expect(typeof timestamp).toBe('number')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty resources array', () => {
      const result = filterByAllCriteria([], {
        categories: ['Framework'],
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(0)
    })

    it('should handle resource with missing optional fields', () => {
      const incompleteResource: Resource = {
        id: '4',
        title: 'Incomplete',
        description: 'No category',
        benefits: [],
        url: 'https://example.com/4',
        category: 'Framework',
        pricingModel: 'Free',
        difficulty: 'Beginner',
        technology: [],
        tags: [],
        dateAdded: '2024-01-01',
        popularity: 0,
      }

      const result = filterByAllCriteria([incompleteResource], {
        categories: ['Framework'],
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      })

      expect(result).toHaveLength(1)
    })

    it('should handle filter with empty arrays', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: [],
        pricingModels: [],
        difficultyLevels: [],
        technologies: [],
        tags: [],
      })

      expect(result).toHaveLength(3)
    })

    it('should handle partial filter options', () => {
      const result = filterByAllCriteria(mockResources, {
        categories: ['Framework'],
        pricingModels: undefined,
        difficultyLevels: undefined,
        technologies: undefined,
        tags: undefined,
      } as any)

      expect(result).toHaveLength(1)
    })
  })
})
