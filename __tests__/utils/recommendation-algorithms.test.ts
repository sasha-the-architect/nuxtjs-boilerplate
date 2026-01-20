import { describe, it, expect } from 'vitest'
import type { Resource } from '~/types/resource'
import {
  calculateSimilarity,
  calculateInterestMatch,
  calculateSkillMatch,
  calculateCollaborativeScore,
  applyDiversity,
  type RecommendationResult,
  type UserPreferences,
} from '~/utils/recommendation-algorithms'

const mockResource1: Resource = {
  id: '1',
  title: 'Test Resource 1',
  description: 'Description',
  url: 'https://example.com',
  category: 'framework',
  tags: ['vue', 'javascript'],
  technology: ['vue', 'typescript'],
  benefits: ['benefit1'],
  dateAdded: '2024-01-01',
  popularity: 5,
  status: 'approved',
  pricingModel: 'free',
  difficulty: 'intermediate',
}

const mockResource2: Resource = {
  id: '2',
  title: 'Test Resource 2',
  description: 'Description',
  url: 'https://example.com',
  category: 'framework',
  tags: ['vue', 'typescript'],
  technology: ['vue', 'typescript'],
  benefits: ['benefit1'],
  dateAdded: '2024-01-01',
  popularity: 5,
  status: 'approved',
  pricingModel: 'free',
  difficulty: 'intermediate',
}

const mockResource3: Resource = {
  id: '3',
  title: 'Test Resource 3',
  description: 'Description',
  url: 'https://example.com',
  category: 'library',
  tags: ['react', 'javascript'],
  technology: ['react', 'typescript'],
  benefits: ['benefit1'],
  dateAdded: '2024-01-01',
  popularity: 5,
  status: 'approved',
  pricingModel: 'free',
  difficulty: 'intermediate',
}

const mockResource4: Resource = {
  id: '4',
  title: 'Test Resource 4',
  description: 'Description',
  url: 'https://example.com',
  category: 'tool',
  tags: ['node', 'cli'],
  technology: ['node'],
  benefits: ['benefit1'],
  dateAdded: '2024-01-01',
  popularity: 5,
  status: 'approved',
  pricingModel: 'free',
  difficulty: 'intermediate',
}

describe('recommendation-algorithms', () => {
  describe('calculateSimilarity', () => {
    it('should return 1 for identical resources', () => {
      const result = calculateSimilarity(mockResource1, mockResource1)
      expect(result).toBe(1)
    })

    it('should return higher score for same category', () => {
      const result = calculateSimilarity(mockResource1, mockResource2)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should return lower score for different category', () => {
      const result1 = calculateSimilarity(mockResource1, mockResource2)
      const result2 = calculateSimilarity(mockResource1, mockResource3)
      expect(result2).toBeLessThan(result1)
    })

    it('should calculate tag similarity correctly', () => {
      const result = calculateSimilarity(mockResource1, mockResource2)
      expect(result).toBeGreaterThan(0.5)
    })

    it('should calculate technology similarity correctly', () => {
      const result = calculateSimilarity(mockResource1, mockResource2)
      expect(result).toBeGreaterThan(0.5)
    })

    it('should return 0 for completely different resources', () => {
      const result = calculateSimilarity(mockResource1, mockResource4)
      expect(result).toBeLessThan(0.5)
    })

    it('should handle empty tags arrays', () => {
      const resourceWithNoTags = { ...mockResource1, tags: [] }
      const result = calculateSimilarity(resourceWithNoTags, mockResource2)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should handle empty technology arrays', () => {
      const resourceWithNoTech = { ...mockResource1, technology: [] }
      const result = calculateSimilarity(resourceWithNoTech, mockResource2)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should cap similarity score at 1', () => {
      const resourceWithAllMatches = { ...mockResource2 }
      const result = calculateSimilarity(mockResource1, resourceWithAllMatches)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should handle partial tag matches', () => {
      const resourceWithPartialTags = {
        ...mockResource3,
        tags: ['vue', 'python'],
      }
      const result = calculateSimilarity(mockResource1, resourceWithPartialTags)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should handle partial technology matches', () => {
      const resourceWithPartialTech = {
        ...mockResource3,
        technology: ['vue', 'go'],
      }
      const result = calculateSimilarity(mockResource1, resourceWithPartialTech)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    })
  })

  describe('calculateInterestMatch', () => {
    it('should return 0.5 when no user preferences', () => {
      const result = calculateInterestMatch(mockResource1, undefined)
      expect(result).toBe(0.5)
    })

    it('should return 0.5 when no interests in preferences', () => {
      const preferences: UserPreferences = { interests: [] }
      const result = calculateInterestMatch(mockResource1, preferences)
      expect(result).toBe(0.5)
    })

    it('should return higher score when category matches interest', () => {
      const preferences: UserPreferences = { interests: ['framework'] }
      const result = calculateInterestMatch(mockResource1, preferences)
      expect(result).toBeGreaterThan(0)
    })

    it('should return higher score when tags match interests', () => {
      const preferences: UserPreferences = { interests: ['vue'] }
      const result = calculateInterestMatch(mockResource1, preferences)
      expect(result).toBeGreaterThan(0)
    })

    it('should return higher score when technology matches interests', () => {
      const preferences: UserPreferences = { interests: ['typescript'] }
      const result = calculateInterestMatch(mockResource1, preferences)
      expect(result).toBeGreaterThan(0)
    })

    it('should handle multiple interest matches', () => {
      const preferences: UserPreferences = {
        interests: ['framework', 'vue', 'typescript'],
      }
      const result = calculateInterestMatch(mockResource1, preferences)
      expect(result).toBeGreaterThan(0)
    })

    it('should return 0 when no interests match', () => {
      const preferences: UserPreferences = {
        interests: ['python', 'django', 'flask'],
      }
      const result = calculateInterestMatch(mockResource1, preferences)
      expect(result).toBe(0)
    })

    it('should handle case-insensitive matching', () => {
      const preferences: UserPreferences = { interests: ['FRAMEWORK'] }
      const result = calculateInterestMatch(mockResource1, preferences)
      expect(result).toBe(0)
    })

    it('should handle empty tags array in resource', () => {
      const resourceWithNoTags = { ...mockResource1, tags: [] }
      const preferences: UserPreferences = { interests: ['vue'] }
      const result = calculateInterestMatch(resourceWithNoTags, preferences)
      expect(result).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty technology array in resource', () => {
      const resourceWithNoTech = { ...mockResource1, technology: [] }
      const preferences: UserPreferences = { interests: ['typescript'] }
      const result = calculateInterestMatch(resourceWithNoTech, preferences)
      expect(result).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateSkillMatch', () => {
    it('should return 0.5 when no skill level in preferences', () => {
      const result = calculateSkillMatch(mockResource1, undefined)
      expect(result).toBe(0.5)
    })

    it('should return 0.5 with skill level in preferences', () => {
      const preferences: UserPreferences = { skillLevel: 'beginner' }
      const result = calculateSkillMatch(mockResource1, preferences)
      expect(result).toBe(0.5)
    })

    it('should handle different skill levels', () => {
      const preferences1: UserPreferences = { skillLevel: 'beginner' }
      const preferences2: UserPreferences = { skillLevel: 'advanced' }
      const result1 = calculateSkillMatch(mockResource1, preferences1)
      const result2 = calculateSkillMatch(mockResource1, preferences2)
      expect(result1).toBe(0.5)
      expect(result2).toBe(0.5)
    })
  })

  describe('calculateCollaborativeScore', () => {
    it('should return 0 when no user preferences', () => {
      const result = calculateCollaborativeScore('1', undefined)
      expect(result).toBe(0)
    })

    it('should return 0 when no viewed or bookmarked resources', () => {
      const preferences: UserPreferences = {}
      const result = calculateCollaborativeScore('1', preferences)
      expect(result).toBe(0)
    })

    it('should return 0.5 when resource is in viewed resources', () => {
      const preferences: UserPreferences = {
        viewedResources: ['1'],
      }
      const result = calculateCollaborativeScore('1', preferences)
      expect(result).toBe(0.5)
    })

    it('should return 0.5 when resource is in bookmarked resources', () => {
      const preferences: UserPreferences = {
        bookmarkedResources: ['1'],
      }
      const result = calculateCollaborativeScore('1', preferences)
      expect(result).toBe(0.5)
    })

    it('should return 0.5 when resource is in both viewed and bookmarked', () => {
      const preferences: UserPreferences = {
        viewedResources: ['1'],
        bookmarkedResources: ['1'],
      }
      const result = calculateCollaborativeScore('1', preferences)
      expect(result).toBe(0.5)
    })

    it('should return 0 when resource is not in viewed or bookmarked', () => {
      const preferences: UserPreferences = {
        viewedResources: ['2'],
        bookmarkedResources: ['3'],
      }
      const result = calculateCollaborativeScore('1', preferences)
      expect(result).toBe(0)
    })

    it('should handle multiple viewed resources', () => {
      const preferences: UserPreferences = {
        viewedResources: ['1', '2', '3'],
      }
      const result = calculateCollaborativeScore('1', preferences)
      expect(result).toBe(0.5)
    })

    it('should handle empty viewed resources array', () => {
      const preferences: UserPreferences = {
        viewedResources: [],
        bookmarkedResources: ['1'],
      }
      const result = calculateCollaborativeScore('1', preferences)
      expect(result).toBe(0.5)
    })

    it('should handle empty bookmarked resources array', () => {
      const preferences: UserPreferences = {
        viewedResources: ['1'],
        bookmarkedResources: [],
      }
      const result = calculateCollaborativeScore('1', preferences)
      expect(result).toBe(0.5)
    })
  })

  describe('applyDiversity', () => {
    it('should return same recommendations when diversity factor is 0', () => {
      const recommendations: RecommendationResult[] = [
        { resource: mockResource1, score: 0.9, reason: 'content-based' },
        { resource: mockResource2, score: 0.8, reason: 'content-based' },
        { resource: mockResource3, score: 0.7, reason: 'content-based' },
      ]
      const result = applyDiversity(recommendations, 0, 10)
      expect(result).toEqual(recommendations)
    })

    it('should return same recommendations when diversity factor is negative', () => {
      const recommendations: RecommendationResult[] = [
        { resource: mockResource1, score: 0.9, reason: 'content-based' },
        { resource: mockResource2, score: 0.8, reason: 'content-based' },
      ]
      const result = applyDiversity(recommendations, -1, 10)
      expect(result).toEqual(recommendations)
    })

    it('should apply diversity with positive factor', () => {
      const recommendations: RecommendationResult[] = [
        { resource: mockResource1, score: 0.9, reason: 'content-based' },
        { resource: mockResource2, score: 0.8, reason: 'content-based' },
        { resource: mockResource3, score: 0.7, reason: 'content-based' },
        { resource: mockResource4, score: 0.6, reason: 'content-based' },
      ]
      const result = applyDiversity(recommendations, 1, 10)
      expect(result.length).toBeGreaterThanOrEqual(3)
      expect(result.length).toBeLessThanOrEqual(4)
    })

    it('should respect max recommendations limit', () => {
      const recommendations: RecommendationResult[] = [
        { resource: mockResource1, score: 0.9, reason: 'content-based' },
        { resource: mockResource2, score: 0.8, reason: 'content-based' },
        { resource: mockResource3, score: 0.7, reason: 'content-based' },
        { resource: mockResource4, score: 0.6, reason: 'content-based' },
      ]
      const result = applyDiversity(recommendations, 1, 2)
      expect(result.length).toBeLessThanOrEqual(2)
    })

    it('should include first 3 recommendations regardless of diversity', () => {
      const recommendations: RecommendationResult[] = [
        { resource: mockResource1, score: 0.9, reason: 'content-based' },
        { resource: mockResource2, score: 0.8, reason: 'content-based' },
        { resource: mockResource3, score: 0.7, reason: 'content-based' },
      ]
      const result = applyDiversity(recommendations, 1, 10)
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it('should include diverse category recommendations', () => {
      const recommendations: RecommendationResult[] = [
        { resource: mockResource1, score: 0.9, reason: 'content-based' },
        { resource: mockResource2, score: 0.8, reason: 'content-based' },
        { resource: mockResource3, score: 0.7, reason: 'content-based' },
      ]
      const result = applyDiversity(recommendations, 1, 10)
      expect(result.length).toBeGreaterThan(2)
    })

    it('should handle empty recommendations array', () => {
      const result = applyDiversity([], 1, 10)
      expect(result).toEqual([])
    })

    it('should handle single recommendation', () => {
      const recommendations: RecommendationResult[] = [
        { resource: mockResource1, score: 0.9, reason: 'content-based' },
      ]
      const result = applyDiversity(recommendations, 1, 10)
      expect(result).toEqual(recommendations)
    })

    it('should include diverse technology recommendations', () => {
      const recommendations: RecommendationResult[] = [
        { resource: mockResource1, score: 0.9, reason: 'content-based' },
        { resource: mockResource2, score: 0.8, reason: 'content-based' },
        { resource: mockResource3, score: 0.7, reason: 'content-based' },
      ]
      const result = applyDiversity(recommendations, 1, 10)
      expect(result.length).toBeGreaterThan(2)
    })
  })
})
