import { describe, it, expect, beforeEach } from 'vitest'
import { useResourceSort } from '~/composables/useResourceSort'
import type { Resource } from '~/types/resource'

describe('useResourceSort', () => {
  const mockResources: readonly Resource[] = [
    {
      id: '3',
      title: 'Resource C',
      description: 'Third resource',
      benefits: ['Benefit 3'],
      url: 'https://example3.com',
      category: 'Testing',
      tags: ['tag3'],
      pricing: 'Free',
      difficulty: 'Advanced',
      lastUpdated: '2023-03-01',
    },
    {
      id: '1',
      title: 'Resource A',
      description: 'First resource',
      benefits: ['Benefit 1'],
      url: 'https://example1.com',
      category: 'Development',
      tags: ['tag1'],
      pricing: 'Paid',
      difficulty: 'Beginner',
      lastUpdated: '2023-01-01',
    },
    {
      id: '2',
      title: 'Resource B',
      description: 'Second resource',
      benefits: ['Benefit 2'],
      url: 'https://example2.com',
      category: 'Testing',
      tags: ['tag2'],
      pricing: 'Free',
      difficulty: 'Intermediate',
      lastUpdated: '2023-02-01',
    },
  ]

  let sortComposable: ReturnType<typeof useResourceSort>

  beforeEach(() => {
    sortComposable = useResourceSort(mockResources)
  })

  describe('sortByTitle', () => {
    it('should sort resources by title in ascending order', () => {
      const sorted = sortComposable.sortByTitle('asc')
      expect(sorted[0].title).toBe('Resource A')
      expect(sorted[1].title).toBe('Resource B')
      expect(sorted[2].title).toBe('Resource C')
    })

    it('should sort resources by title in descending order', () => {
      const sorted = sortComposable.sortByTitle('desc')
      expect(sorted[0].title).toBe('Resource C')
      expect(sorted[1].title).toBe('Resource B')
      expect(sorted[2].title).toBe('Resource A')
    })
  })

  describe('sortByCategory', () => {
    it('should sort resources by category in ascending order', () => {
      const sorted = sortComposable.sortByCategory('asc')
      // Development comes before Testing alphabetically
      expect(sorted[0].category).toBe('Development')
      expect(sorted[1].category).toBe('Testing')
      expect(sorted[2].category).toBe('Testing')
    })

    it('should sort resources by category in descending order', () => {
      const sorted = sortComposable.sortByCategory('desc')
      // Testing comes after Development alphabetically
      expect(sorted[0].category).toBe('Testing')
      expect(sorted[1].category).toBe('Testing')
      expect(sorted[2].category).toBe('Development')
    })
  })

  describe('sortByLastUpdated', () => {
    it('should sort resources by last updated date in ascending order (oldest first)', () => {
      const sorted = sortComposable.sortByLastUpdated('asc')
      expect(sorted[0].lastUpdated).toBe('2023-01-01')
      expect(sorted[1].lastUpdated).toBe('2023-02-01')
      expect(sorted[2].lastUpdated).toBe('2023-03-01')
    })

    it('should sort resources by last updated date in descending order (newest first)', () => {
      const sorted = sortComposable.sortByLastUpdated('desc')
      expect(sorted[0].lastUpdated).toBe('2023-03-01')
      expect(sorted[1].lastUpdated).toBe('2023-02-01')
      expect(sorted[2].lastUpdated).toBe('2023-01-01')
    })
  })

  describe('sortByPricing', () => {
    it('should sort resources by pricing in ascending order', () => {
      const sorted = sortComposable.sortByPricing('asc')
      // Assuming 'Free' comes before 'Paid' alphabetically
      expect(sorted[0].pricing).toBe('Free')
      expect(sorted[1].pricing).toBe('Free')
      expect(sorted[2].pricing).toBe('Paid')
    })

    it('should sort resources by pricing in descending order', () => {
      const sorted = sortComposable.sortByPricing('desc')
      // Assuming 'Paid' comes after 'Free' alphabetically
      expect(sorted[0].pricing).toBe('Paid')
      expect(sorted[1].pricing).toBe('Free')
      expect(sorted[2].pricing).toBe('Free')
    })
  })

  describe('sortByDifficulty', () => {
    it('should sort resources by difficulty in ascending order', () => {
      const sorted = sortComposable.sortByDifficulty('asc')
      expect(sorted[0].difficulty).toBe('Advanced')
      expect(sorted[1].difficulty).toBe('Beginner')
      expect(sorted[2].difficulty).toBe('Intermediate')
    })

    it('should sort resources by difficulty in descending order', () => {
      const sorted = sortComposable.sortByDifficulty('desc')
      expect(sorted[0].difficulty).toBe('Intermediate')
      expect(sorted[1].difficulty).toBe('Beginner')
      expect(sorted[2].difficulty).toBe('Advanced')
    })
  })

  describe('sortResources', () => {
    it('should sort by title when sortField is "title"', () => {
      const sorted = sortComposable.sortResources('title', 'asc')
      expect(sorted[0].title).toBe('Resource A')
      expect(sorted[1].title).toBe('Resource B')
      expect(sorted[2].title).toBe('Resource C')
    })

    it('should sort by category when sortField is "category"', () => {
      const sorted = sortComposable.sortResources('category', 'asc')
      expect(sorted[0].category).toBe('Development')
      expect(sorted[1].category).toBe('Testing')
      expect(sorted[2].category).toBe('Testing')
    })

    it('should sort by lastUpdated when sortField is "lastUpdated"', () => {
      const sorted = sortComposable.sortResources('lastUpdated', 'desc')
      expect(sorted[0].lastUpdated).toBe('2023-03-01')
      expect(sorted[1].lastUpdated).toBe('2023-02-01')
      expect(sorted[2].lastUpdated).toBe('2023-01-01')
    })

    it('should sort by pricing when sortField is "pricing"', () => {
      const sorted = sortComposable.sortResources('pricing', 'asc')
      expect(sorted[0].pricing).toBe('Free')
      expect(sorted[1].pricing).toBe('Free')
      expect(sorted[2].pricing).toBe('Paid')
    })

    it('should sort by difficulty when sortField is "difficulty"', () => {
      const sorted = sortComposable.sortResources('difficulty', 'asc')
      expect(sorted[0].difficulty).toBe('Advanced')
      expect(sorted[1].difficulty).toBe('Beginner')
      expect(sorted[2].difficulty).toBe('Intermediate')
    })

    it('should return original order when sortField is invalid', () => {
      // @ts-expect-error - Testing invalid sort field
      const sorted = sortComposable.sortResources('invalidField', 'asc')
      expect(sorted).toEqual(mockResources)
    })
  })

  describe('getSortOptions', () => {
    it('should return available sort options', () => {
      const options = sortComposable.getSortOptions()
      expect(options).toEqual([
        { value: 'title', label: 'Title' },
        { value: 'category', label: 'Category' },
        { value: 'lastUpdated', label: 'Last Updated' },
        { value: 'pricing', label: 'Pricing' },
        { value: 'difficulty', label: 'Difficulty' },
      ])
    })
  })
})
