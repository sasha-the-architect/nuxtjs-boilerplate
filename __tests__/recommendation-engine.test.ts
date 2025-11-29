import { describe, it, expect, beforeEach } from 'vitest'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import type { Resource } from '~/types/resource'

// Mock resources for testing
const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Test Resource 1',
    description: 'A test resource for AI tools',
    benefits: ['Free tier', 'API access'],
    url: 'https://example1.com',
    category: 'AI Tools',
    pricingModel: 'Free',
    difficulty: 'Beginner',
    tags: ['ai', 'machine learning', 'api'],
    technology: ['Python', 'TensorFlow'],
    dateAdded: '2023-01-01',
    popularity: 85,
  },
  {
    id: '2',
    title: 'Test Resource 2',
    description: 'A test resource for hosting',
    benefits: ['Free tier', 'Unlimited bandwidth'],
    url: 'https://example2.com',
    category: 'Web Hosting',
    pricingModel: 'Freemium',
    difficulty: 'Intermediate',
    tags: ['hosting', 'cloud', 'web'],
    technology: ['AWS', 'Docker'],
    dateAdded: '2023-02-01',
    popularity: 90,
  },
  {
    id: '3',
    title: 'Test Resource 3',
    description: 'Another AI tools resource',
    benefits: ['Free tier', 'Community support'],
    url: 'https://example3.com',
    category: 'AI Tools',
    pricingModel: 'Free',
    difficulty: 'Advanced',
    tags: ['ai', 'nlp', 'deep learning'],
    technology: ['Python', 'PyTorch'],
    dateAdded: '2023-03-01',
    popularity: 75,
  },
  {
    id: '4',
    title: 'Test Resource 4',
    description: 'Database hosting service',
    benefits: ['Free tier', 'SSL support'],
    url: 'https://example4.com',
    category: 'Databases',
    pricingModel: 'Free',
    difficulty: 'Intermediate',
    tags: ['database', 'sql', 'postgres'],
    technology: ['PostgreSQL', 'Redis'],
    dateAdded: '2023-04-01',
    popularity: 80,
  },
]

describe('useRecommendationEngine', () => {
  let engine: ReturnType<typeof useRecommendationEngine>

  beforeEach(() => {
    engine = useRecommendationEngine(mockResources)
  })

  describe('calculateSimilarity', () => {
    it('should return 1 for the same resource', () => {
      const similarity = engine.calculateSimilarity(
        mockResources[0],
        mockResources[0]
      )
      expect(similarity).toBe(1) // Same resource should have maximum similarity
    })

    it('should calculate similarity based on category', () => {
      const resourceA = mockResources[0] // AI Tools
      const resourceB = mockResources[2] // AI Tools
      const similarity = engine.calculateSimilarity(resourceA, resourceB)
      expect(similarity).toBeGreaterThan(0.5) // Category match should give high score
    })

    it('should calculate similarity based on tags', () => {
      const resourceA = mockResources[0] // has 'ai' tag
      const resourceB = mockResources[2] // has 'ai' tag
      const similarity = engine.calculateSimilarity(resourceA, resourceB)
      expect(similarity).toBeGreaterThan(0.3) // Tag match should contribute to score
    })

    it('should calculate similarity based on technology', () => {
      const resourceA = mockResources[0] // has 'Python' tech
      const resourceB = mockResources[2] // has 'Python' tech
      const similarity = engine.calculateSimilarity(resourceA, resourceB)
      expect(similarity).toBeGreaterThan(0.2) // Tech match should contribute to score
    })
  })

  describe('getContentBasedRecommendations', () => {
    it('should return content-based recommendations', () => {
      const recommendations = engine.getContentBasedRecommendations(
        mockResources[0]
      )
      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeLessThanOrEqual(10)

      // Should include resources from the same category
      const sameCategoryRecs = recommendations.filter(
        rec => rec.resource.category === mockResources[0].category
      )
      expect(sameCategoryRecs.length).toBeGreaterThan(0)
    })

    it('should return recommendations with content-based reason', () => {
      const recommendations = engine.getContentBasedRecommendations(
        mockResources[0]
      )
      recommendations.forEach(rec => {
        expect(rec.reason).toBe('content-based')
      })
    })
  })

  describe('getTrendingRecommendations', () => {
    it('should return trending recommendations', () => {
      const recommendations = engine.getTrendingRecommendations()
      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeLessThanOrEqual(10)

      // Should be sorted by popularity
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].resource.popularity).toBeGreaterThanOrEqual(
          recommendations[i + 1].resource.popularity
        )
      }
    })

    it('should return recommendations with trending reason', () => {
      const recommendations = engine.getTrendingRecommendations()
      recommendations.forEach(rec => {
        expect(rec.reason).toBe('trending')
      })
    })
  })

  describe('getPopularRecommendations', () => {
    it('should return popular recommendations', () => {
      const recommendations = engine.getPopularRecommendations()
      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeLessThanOrEqual(10)

      // Should be sorted by popularity
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].resource.popularity).toBeGreaterThanOrEqual(
          recommendations[i + 1].resource.popularity
        )
      }
    })

    it('should return recommendations with popular reason', () => {
      const recommendations = engine.getPopularRecommendations()
      recommendations.forEach(rec => {
        expect(rec.reason).toBe('popular')
      })
    })
  })

  describe('getCategoryBasedRecommendations', () => {
    it('should return category-based recommendations', () => {
      const recommendations = engine.getCategoryBasedRecommendations('AI Tools')
      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations)).toBe(true)

      // All recommendations should be from the same category
      recommendations.forEach(rec => {
        expect(rec.resource.category).toBe('AI Tools')
      })
    })

    it('should return recommendations with content-based reason', () => {
      const recommendations = engine.getCategoryBasedRecommendations('AI Tools')
      recommendations.forEach(rec => {
        expect(rec.reason).toBe('content-based')
      })
    })
  })

  describe('getDiverseRecommendations', () => {
    it('should return diverse recommendations', () => {
      const recommendations = engine.getDiverseRecommendations(
        mockResources[0],
        'AI Tools'
      )
      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeLessThanOrEqual(10)
    })

    it('should include content-based recommendations when current resource is provided', () => {
      const recommendations = engine.getDiverseRecommendations(
        mockResources[0],
        'AI Tools'
      )
      const contentBasedRecs = recommendations.filter(
        rec => rec.reason === 'content-based'
      )
      expect(contentBasedRecs.length).toBeGreaterThan(0)
    })

    it('should include category-based recommendations when current category is provided', () => {
      const recommendations = engine.getDiverseRecommendations(
        undefined,
        'AI Tools'
      )
      const categoryBasedRecs = recommendations.filter(
        rec => rec.reason === 'content-based'
      )
      expect(categoryBasedRecs.length).toBeGreaterThan(0)
    })

    it('should include trending and popular recommendations for diversity', () => {
      const recommendations = engine.getDiverseRecommendations()
      const trendingRecs = recommendations.filter(
        rec => rec.reason === 'trending'
      )
      const popularRecs = recommendations.filter(
        rec => rec.reason === 'popular'
      )

      // At least one of these should be included for diversity
      expect(trendingRecs.length + popularRecs.length).toBeGreaterThan(0)
    })
  })

  describe('updateConfig', () => {
    it('should update the configuration', () => {
      const newConfig = {
        maxRecommendations: 5,
        minSimilarityScore: 0.5,
      }

      engine.updateConfig(newConfig)

      // Config should be readonly but updateable through updateConfig
      expect(engine.config.maxRecommendations).toBe(5)
      expect(engine.config.minSimilarityScore).toBe(0.5)
    })
  })
})
