import type { Resource } from '~/types/resource'
import {
  calculateSimilarity,
  type RecommendationConfig,
  type RecommendationResult,
} from '~/utils/recommendation-algorithms'

export function useContentBasedRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig
) {
  const getContentBasedRecommendations = (
    targetResource: Resource
  ): RecommendationResult[] => {
    const similarities: RecommendationResult[] = []

    for (const resource of allResources) {
      if (resource.id === targetResource.id) continue

      const similarity = calculateSimilarity(targetResource, resource)
      if (similarity >= config.minSimilarityScore) {
        similarities.push({
          resource,
          score: similarity,
          reason: 'content-based',
        })
      }
    }

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxRecommendations)
  }

  return {
    getContentBasedRecommendations,
  }
}
