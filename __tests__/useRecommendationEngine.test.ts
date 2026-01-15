import { describe, it, expect, beforeEach } from 'vitest'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import type { Resource } from '~/types/resource'

describe('useRecommendationEngine', () => {
  const mockResources: readonly Resource[] = [
    {
      id: '1',
      title: 'Vue.js Guide',
      description: 'Comprehensive Vue.js guide',
      benefits: ['Comprehensive', 'Beginner-friendly'],
      url: 'https://vuejs.org',
      category: 'Framework',
      tags: ['vue', 'javascript', 'frontend'],
      pricingModel: 'Free',
      difficulty: 'Beginner',
      technology: ['Vue.js'],
      dateAdded: '2023-01-01',
      popularity: 10,
    },
    {
      id: '2',
      title: 'React Tutorial',
      description: 'Learn React from scratch',
      benefits: ['Step-by-step', 'Practical examples'],
      url: 'https://reactjs.org',
      category: 'Framework',
      tags: ['react', 'javascript', 'frontend'],
      pricingModel: 'Free',
      difficulty: 'Beginner',
      technology: ['React'],
      dateAdded: '2023-01-02',
      popularity: 8,
    },
    {
      id: '3',
      title: 'Advanced Vue Patterns',
      description: 'Advanced Vue.js patterns',
      benefits: ['Advanced patterns', 'Best practices'],
      url: 'https://vue-patterns.com',
      category: 'Framework',
      tags: ['vue', 'advanced', 'frontend'],
      pricingModel: 'Free',
      difficulty: 'Advanced',
      technology: ['Vue.js'],
      dateAdded: '2023-01-03',
      popularity: 15,
    },
    {
      id: '4',
      title: 'TypeScript Best Practices',
      description: 'TypeScript best practices',
      benefits: ['Type safety', 'Better DX'],
      url: 'https://typescript-lang.org',
      category: 'Language',
      tags: ['typescript', 'javascript'],
      pricingModel: 'Free',
      difficulty: 'Intermediate',
      technology: ['TypeScript'],
      dateAdded: '2023-01-04',
      popularity: 12,
    },
    {
      id: '5',
      title: 'Testing with Vitest',
      description: 'Learn Vitest testing',
      benefits: ['Fast testing', 'Modern tools'],
      url: 'https://vitest.dev',
      category: 'Testing',
      tags: ['testing', 'vitest', 'javascript'],
      pricingModel: 'Free',
      difficulty: 'Intermediate',
      technology: ['Vitest'],
      dateAdded: '2023-01-05',
      popularity: 20,
    },
  ]

  let engine: ReturnType<typeof useRecommendationEngine>

  beforeEach(() => {
    engine = useRecommendationEngine(mockResources)
  })

  describe('initialization', () => {
    it('should initialize with default config', () => {
      expect(engine.config.collaborativeWeight).toBe(0.3)
      expect(engine.config.contentBasedWeight).toBe(0.3)
      expect(engine.config.popularityWeight).toBe(0.2)
      expect(engine.config.personalizationWeight).toBe(0.2)
      expect(engine.config.maxRecommendations).toBe(10)
      expect(engine.config.minSimilarityScore).toBe(0.3)
      expect(engine.config.diversityFactor).toBe(0.3)
    })

    it('should provide calculateSimilarity function', () => {
      expect(typeof engine.calculateSimilarity).toBe('function')
    })

    it('should provide updateConfig function', () => {
      expect(typeof engine.updateConfig).toBe('function')
    })

    it('should provide getDiverseRecommendations function', () => {
      expect(typeof engine.getDiverseRecommendations).toBe('function')
    })

    it('should provide getPersonalizedRecommendations function', () => {
      expect(typeof engine.getPersonalizedRecommendations).toBe('function')
    })

    it('should provide strategy-specific recommendation functions', () => {
      expect(typeof engine.getContentBasedRecommendations).toBe('function')
      expect(typeof engine.getTrendingRecommendations).toBe('function')
      expect(typeof engine.getPopularRecommendations).toBe('function')
      expect(typeof engine.getCategoryBasedRecommendations).toBe('function')
    })
  })

  describe('calculateSimilarity', () => {
    it('should return 1 for same resource', () => {
      const similarity = engine.calculateSimilarity(
        mockResources[0],
        mockResources[0]
      )
      expect(similarity).toBe(1)
    })

    it('should calculate similarity based on category', () => {
      const similarity = engine.calculateSimilarity(
        mockResources[0],
        mockResources[1]
      )
      expect(similarity).toBeGreaterThan(0)
      expect(similarity).toBeLessThanOrEqual(1)
    })

    it('should calculate similarity based on tags', () => {
      const similarity = engine.calculateSimilarity(
        mockResources[0],
        mockResources[2]
      )
      expect(similarity).toBeGreaterThan(0.5)
      expect(similarity).toBeLessThanOrEqual(1)
    })

    it('should calculate similarity based on technology', () => {
      const similarity = engine.calculateSimilarity(
        mockResources[0],
        mockResources[2]
      )
      expect(similarity).toBeGreaterThan(0)
    })

    it('should return 0 for completely different resources', () => {
      const differentResource: Resource = {
        id: '999',
        title: 'Different Resource',
        description: 'No similarity',
        benefits: ['Database', 'SQL'],
        url: 'https://different.com',
        category: 'Database',
        tags: ['database', 'sql'],
        pricingModel: 'Paid',
        difficulty: 'Expert',
        technology: ['PostgreSQL'],
        dateAdded: '2023-01-01',
        popularity: 5,
      }
      const similarity = engine.calculateSimilarity(
        mockResources[0],
        differentResource
      )
      expect(similarity).toBe(0)
    })

    it('should cap similarity at 1', () => {
      const similarity = engine.calculateSimilarity(
        mockResources[0],
        mockResources[0]
      )
      expect(similarity).toBeLessThanOrEqual(1)
    })
  })

  describe('getContentBasedRecommendations', () => {
    it('should return recommendations for a target resource', () => {
      const recommendations = engine.getContentBasedRecommendations(
        mockResources[0]
      )
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)
    })

    it('should exclude target resource from recommendations', () => {
      const recommendations = engine.getContentBasedRecommendations(
        mockResources[0]
      )
      const hasSelf = recommendations.some(
        rec => rec.resource.id === mockResources[0].id
      )
      expect(hasSelf).toBe(false)
    })

    it('should only include resources above minSimilarityScore', () => {
      const recommendations = engine.getContentBasedRecommendations(
        mockResources[0]
      )
      recommendations.forEach(rec => {
        expect(rec.score).toBeGreaterThanOrEqual(
          engine.config.minSimilarityScore
        )
      })
    })

    it('should return recommendations with correct structure', () => {
      const recommendations = engine.getContentBasedRecommendations(
        mockResources[0]
      )
      if (recommendations.length > 0) {
        const firstRec = recommendations[0]
        expect(firstRec).toHaveProperty('resource')
        expect(firstRec).toHaveProperty('score')
        expect(firstRec).toHaveProperty('reason')
        expect(firstRec.reason).toBe('content-based')
      }
    })

    it('should sort recommendations by score descending', () => {
      const recommendations = engine.getContentBasedRecommendations(
        mockResources[0]
      )
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(
          recommendations[i].score
        )
      }
    })

    it('should limit recommendations to maxRecommendations', () => {
      const recommendations = engine.getContentBasedRecommendations(
        mockResources[0]
      )
      expect(recommendations.length).toBeLessThanOrEqual(
        engine.config.maxRecommendations
      )
    })

    it('should return empty array for resource with no similar resources', () => {
      const isolatedResource: Resource = {
        id: 'isolated',
        title: 'Isolated',
        description: 'No similar resources',
        benefits: ['Unique'],
        url: 'https://isolated.com',
        category: 'Unique',
        tags: ['unique-tag'],
        pricingModel: 'Free',
        difficulty: 'Beginner',
        technology: ['UniqueTech'],
        dateAdded: '2023-01-01',
        popularity: 1,
      }
      const recommendations =
        engine.getContentBasedRecommendations(isolatedResource)
      expect(recommendations.length).toBe(0)
    })
  })

  describe('getTrendingRecommendations', () => {
    it('should return trending resources', () => {
      const recommendations = engine.getTrendingRecommendations()
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThanOrEqual(0)
    })

    it('should include resources with high popularity', () => {
      const recommendations = engine.getTrendingRecommendations()
      recommendations.forEach(rec => {
        expect(rec.resource.popularity).toBeGreaterThan(0)
      })
    })

    it('should return recommendations with correct structure', () => {
      const recommendations =
        engine.getCategoryBasedRecommendations('Framework')
      if (recommendations.length > 0) {
        const firstRec = recommendations[0]
        expect(firstRec).toHaveProperty('resource')
        expect(firstRec).toHaveProperty('score')
        expect(firstRec).toHaveProperty('reason')
      }
    })
  })

  describe('getPopularRecommendations', () => {
    it('should return popular resources', () => {
      const recommendations = engine.getPopularRecommendations()
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)
    })

    it('should sort by popularity', () => {
      const recommendations = engine.getPopularRecommendations()
      for (let i = 1; i < recommendations.length; i++) {
        expect(
          recommendations[i - 1].resource.popularity
        ).toBeGreaterThanOrEqual(recommendations[i].resource.popularity)
      }
    })

    it('should return recommendations with correct structure', () => {
      const recommendations =
        engine.getCategoryBasedRecommendations('Framework')
      if (recommendations.length > 0) {
        const firstRec = recommendations[0]
        expect(firstRec).toHaveProperty('resource')
        expect(firstRec).toHaveProperty('score')
        expect(firstRec).toHaveProperty('reason')
        expect(['category-based', 'content-based']).toContain(firstRec.reason)
      }
    })
  })

  describe('getCategoryBasedRecommendations', () => {
    it('should return resources for a category', () => {
      const recommendations =
        engine.getCategoryBasedRecommendations('Framework')
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)
    })

    it('should only include resources from specified category', () => {
      const recommendations =
        engine.getCategoryBasedRecommendations('Framework')
      recommendations.forEach(rec => {
        expect(rec.resource.category).toBe('Framework')
      })
    })

    it('should return empty array for non-existent category', () => {
      const recommendations =
        engine.getCategoryBasedRecommendations('NonExistent')
      expect(recommendations.length).toBe(0)
    })

    it('should return recommendations with correct structure', () => {
      const recommendations =
        engine.getCategoryBasedRecommendations('Framework')
      if (recommendations.length > 0) {
        const firstRec = recommendations[0]
        expect(firstRec).toHaveProperty('resource')
        expect(firstRec).toHaveProperty('score')
        expect(firstRec).toHaveProperty('reason')
      }
    })
  })

  describe('getDiverseRecommendations', () => {
    it('should return recommendations without parameters', () => {
      const recommendations = engine.getDiverseRecommendations()
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should return recommendations with current resource', () => {
      const recommendations = engine.getDiverseRecommendations(mockResources[0])
      expect(Array.isArray(recommendations)).toBe(true)
      if (recommendations.length > 0) {
        expect(recommendations[0].resource.id).not.toBe(mockResources[0].id)
      }
    })

    it('should return recommendations with current category', () => {
      const recommendations = engine.getDiverseRecommendations(
        undefined,
        'Framework'
      )
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should combine recommendations from multiple strategies', () => {
      const recommendations = engine.getDiverseRecommendations(
        mockResources[0],
        'Framework'
      )
      const reasons = new Set(recommendations.map(rec => rec.reason))
      expect(reasons.size).toBeGreaterThan(1)
    })

    it('should remove duplicate resources', () => {
      const recommendations = engine.getDiverseRecommendations(mockResources[0])
      const ids = recommendations.map(rec => rec.resource.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should sort by score descending', () => {
      const recommendations = engine.getDiverseRecommendations(mockResources[0])
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(
          recommendations[i].score
        )
      }
    })

    it('should limit to maxRecommendations', () => {
      const recommendations = engine.getDiverseRecommendations(mockResources[0])
      expect(recommendations.length).toBeLessThanOrEqual(
        engine.config.maxRecommendations
      )
    })

    it('should handle both currentResource and category parameters', () => {
      const recommendations = engine.getDiverseRecommendations(
        mockResources[0],
        'Framework'
      )
      expect(Array.isArray(recommendations)).toBe(true)
      if (recommendations.length > 0) {
        expect(recommendations[0].resource.id).not.toBe(mockResources[0].id)
      }
    })
  })

  describe('getPersonalizedRecommendations', () => {
    it('should return recommendations with current resource', () => {
      const recommendations = engine.getPersonalizedRecommendations(
        mockResources[0]
      )
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should return recommendations without current resource', () => {
      const recommendations = engine.getPersonalizedRecommendations(undefined)
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should use current resource if provided', () => {
      const recommendations = engine.getPersonalizedRecommendations(
        mockResources[0]
      )
      if (recommendations.length > 0) {
        expect(recommendations[0].resource.id).not.toBe(mockResources[0].id)
      }
    })
  })

  describe('updateConfig', () => {
    it('should update config values', () => {
      engine.updateConfig({ maxRecommendations: 20 })
      expect(engine.config.maxRecommendations).toBe(20)
    })

    it('should update multiple config values', () => {
      engine.updateConfig({
        maxRecommendations: 15,
        minSimilarityScore: 0.5,
        diversityFactor: 0.5,
      })
      expect(engine.config.maxRecommendations).toBe(15)
      expect(engine.config.minSimilarityScore).toBe(0.5)
      expect(engine.config.diversityFactor).toBe(0.5)
    })

    it('should preserve unchanged config values', () => {
      const originalCollaborativeWeight = engine.config.collaborativeWeight
      engine.updateConfig({ maxRecommendations: 20 })
      expect(engine.config.collaborativeWeight).toBe(
        originalCollaborativeWeight
      )
    })

    it('should update weights correctly', () => {
      engine.updateConfig({
        collaborativeWeight: 0.4,
        contentBasedWeight: 0.4,
        popularityWeight: 0.1,
        personalizationWeight: 0.1,
      })
      expect(engine.config.collaborativeWeight).toBe(0.4)
      expect(engine.config.contentBasedWeight).toBe(0.4)
      expect(engine.config.popularityWeight).toBe(0.1)
      expect(engine.config.personalizationWeight).toBe(0.1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty resources array', () => {
      const emptyEngine = useRecommendationEngine([])
      const recommendations = emptyEngine.getDiverseRecommendations()
      expect(recommendations.length).toBe(0)
    })

    it('should handle single resource', () => {
      const singleResource: readonly Resource[] = [mockResources[0]]
      const singleEngine = useRecommendationEngine(singleResource)
      const recommendations = singleEngine.getPopularRecommendations()
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should handle resource without tags', () => {
      const resourceWithoutTags: Resource = {
        id: 'no-tags',
        title: 'No Tags',
        description: 'No tags resource',
        benefits: ['Simple'],
        url: 'https://no-tags.com',
        category: 'Framework',
        tags: [],
        pricingModel: 'Free',
        difficulty: 'Beginner',
        technology: [],
        dateAdded: '2023-01-01',
        popularity: 5,
      }
      const recommendations =
        engine.getContentBasedRecommendations(resourceWithoutTags)
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should handle resource without technology', () => {
      const resourceWithoutTech: Resource = {
        id: 'no-tech',
        title: 'No Tech',
        description: 'No technology resource',
        benefits: ['Basic'],
        url: 'https://no-tech.com',
        category: 'Framework',
        tags: ['vue'],
        pricingModel: 'Free',
        difficulty: 'Beginner',
        technology: [],
        dateAdded: '2023-01-01',
        popularity: 5,
      }
      const recommendations =
        engine.getContentBasedRecommendations(resourceWithoutTech)
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should handle minSimilarityScore change', () => {
      engine.updateConfig({ minSimilarityScore: 0.8 })
      const recommendations = engine.getContentBasedRecommendations(
        mockResources[0]
      )
      if (recommendations.length > 0) {
        expect(recommendations[0].score).toBeGreaterThanOrEqual(0.8)
      }
    })

    it('should handle maxRecommendations change', () => {
      engine.updateConfig({ maxRecommendations: 2 })
      const recommendations = engine.getDiverseRecommendations(mockResources[0])
      expect(recommendations.length).toBeLessThanOrEqual(2)
    })
  })
})
