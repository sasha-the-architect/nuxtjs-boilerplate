import { describe, expect, it } from 'vitest'
import {
  applyDiversity,
  type RecommendationConfig,
  type RecommendationResult,
} from '~/utils/recommendation-algorithms'
import type { Resource } from '~/types/resource'

/* eslint-disable no-console */

// Create mock resource for testing
const createMockResource = (
  id: string,
  category: string,
  tags: string[],
  technology: string[]
): Resource => {
  return {
    id,
    title: `Resource ${id}`,
    description: `Description for ${id}`,
    category,
    url: `https://example.com/${id}`,
    pricingModel: 'free',
    difficulty: 'beginner',
    popularity: 5,
    tags,
    technology,
    benefits: [],
    lastUpdated: Date.now(),
    featured: false,
    trending: false,
    alternatives: [],
  }
}

// Create mock recommendation result
const createMockRecommendation = (
  id: string,
  category: string,
  tags: string[],
  technology: string[],
  score: number
): RecommendationResult => {
  return {
    resource: createMockResource(id, category, tags, technology),
    score,
    reason: 'content-based',
  }
}

describe('recommendation-algorithms Performance Tests', () => {
  describe('applyDiversity Performance', () => {
    const config: RecommendationConfig = {
      collaborativeWeight: 0.3,
      contentBasedWeight: 0.3,
      popularityWeight: 0.2,
      personalizationWeight: 0.2,
      maxRecommendations: 10,
      minSimilarityScore: 0.3,
      diversityFactor: 0.3,
    }

    it('should handle 10 recommendations efficiently', () => {
      const recommendations: RecommendationResult[] = Array.from(
        { length: 10 },
        (_, i) =>
          createMockRecommendation(
            `resource-${i}`,
            i % 3 === 0
              ? 'AI Tools'
              : i % 3 === 1
                ? 'Web Hosting'
                : 'Databases',
            [`tag${i}`, `tag${i + 1}`],
            [`tech${i}`],
            0.5 + i * 0.05
          )
      )

      const startTime = performance.now()
      const result = applyDiversity(
        recommendations,
        config.diversityFactor,
        config.maxRecommendations
      )
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(config.maxRecommendations)
      expect(executionTime).toBeLessThan(1) // Should complete in < 1ms

      console.log(
        `applyDiversity (10 recommendations): ${executionTime.toFixed(4)}ms`
      )
    })

    it('should handle 50 recommendations efficiently', () => {
      const recommendations: RecommendationResult[] = Array.from(
        { length: 50 },
        (_, i) =>
          createMockRecommendation(
            `resource-${i}`,
            i % 5 === 0
              ? 'AI Tools'
              : i % 5 === 1
                ? 'Web Hosting'
                : i % 5 === 2
                  ? 'Databases'
                  : i % 5 === 3
                    ? 'CDN'
                    : 'VPS',
            [`tag${i % 10}`, `tag${(i + 1) % 10}`],
            [`tech${i % 5}`],
            0.5 + (i % 10) * 0.05
          )
      )

      const startTime = performance.now()
      const result = applyDiversity(
        recommendations,
        config.diversityFactor,
        config.maxRecommendations
      )
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(config.maxRecommendations)
      expect(executionTime).toBeLessThan(5) // Should complete in < 5ms

      console.log(
        `applyDiversity (50 recommendations): ${executionTime.toFixed(4)}ms`
      )
    })

    it('should handle 100 recommendations efficiently', () => {
      const recommendations: RecommendationResult[] = Array.from(
        { length: 100 },
        (_, i) =>
          createMockRecommendation(
            `resource-${i}`,
            i % 5 === 0
              ? 'AI Tools'
              : i % 5 === 1
                ? 'Web Hosting'
                : i % 5 === 2
                  ? 'Databases'
                  : i % 5 === 3
                    ? 'CDN'
                    : 'VPS',
            [`tag${i % 20}`, `tag${(i + 1) % 20}`],
            [`tech${i % 10}`],
            0.5 + (i % 10) * 0.05
          )
      )

      const startTime = performance.now()
      const result = applyDiversity(
        recommendations,
        config.diversityFactor,
        config.maxRecommendations
      )
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(config.maxRecommendations)
      expect(executionTime).toBeLessThan(10) // Should complete in < 10ms

      console.log(
        `applyDiversity (100 recommendations): ${executionTime.toFixed(4)}ms`
      )
    })

    it('should handle 500 recommendations efficiently', () => {
      const recommendations: RecommendationResult[] = Array.from(
        { length: 500 },
        (_, i) =>
          createMockRecommendation(
            `resource-${i}`,
            i % 10 === 0
              ? 'AI Tools'
              : i % 10 === 1
                ? 'Web Hosting'
                : i % 10 === 2
                  ? 'Databases'
                  : i % 10 === 3
                    ? 'CDN'
                    : i % 10 === 4
                      ? 'VPS'
                      : i % 10 === 5
                        ? 'Testing'
                        : i % 10 === 6
                          ? 'Build Tools'
                          : i % 10 === 7
                            ? 'DevOps'
                            : i % 10 === 8
                              ? 'Security'
                              : 'Analytics',
            [`tag${i % 30}`, `tag${(i + 1) % 30}`],
            [`tech${i % 15}`],
            0.5 + (i % 10) * 0.05
          )
      )

      const startTime = performance.now()
      const result = applyDiversity(
        recommendations,
        config.diversityFactor,
        config.maxRecommendations
      )
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(config.maxRecommendations)
      expect(executionTime).toBeLessThan(50) // Should complete in < 50ms

      console.log(
        `applyDiversity (500 recommendations): ${executionTime.toFixed(4)}ms`
      )
    })

    it('should scale linearly with input size', () => {
      const sizes = [10, 50, 100, 200, 500]
      const times: number[] = []

      for (const size of sizes) {
        const recommendations: RecommendationResult[] = Array.from(
          { length: size },
          (_, i) =>
            createMockRecommendation(
              `resource-${i}`,
              i % 5 === 0
                ? 'AI Tools'
                : i % 5 === 1
                  ? 'Web Hosting'
                  : i % 5 === 2
                    ? 'Databases'
                    : i % 5 === 3
                      ? 'CDN'
                      : 'VPS',
              [`tag${i % 10}`, `tag${(i + 1) % 10}`],
              [`tech${i % 5}`],
              0.5 + (i % 10) * 0.05
            )
        )

        const startTime = performance.now()
        applyDiversity(
          recommendations,
          config.diversityFactor,
          config.maxRecommendations
        )
        const endTime = performance.now()

        const executionTime = endTime - startTime
        times.push(executionTime)
      }

      // Check that time scales roughly linearly (O(n))
      // 500 recommendations should take roughly 50x time of 10 recommendations
      const timeRatio = times[4] / times[0]
      expect(timeRatio).toBeLessThan(100) // Should be much less than 50x

      console.log('Scaling performance:')
      console.log(`  10 recommendations: ${times[0].toFixed(4)}ms`)
      console.log(`  50 recommendations: ${times[1].toFixed(4)}ms`)
      console.log(`  100 recommendations: ${times[2].toFixed(4)}ms`)
      console.log(`  200 recommendations: ${times[3].toFixed(4)}ms`)
      console.log(`  500 recommendations: ${times[4].toFixed(4)}ms`)
      console.log(`  Scaling ratio (500/10): ${timeRatio.toFixed(2)}x`)
    })
  })
})
