import type { Resource } from '~/types/resource'
import {
  type RecommendationConfig,
  type RecommendationResult,
} from '~/utils/recommendation-algorithms'

export function usePopularRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig
) {
  const getPopularRecommendations = (): RecommendationResult[] => {
    return allResources
      .map(resource => ({
        resource,
        score: resource.popularity,
        reason: 'popular' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxRecommendations)
  }

  return {
    getPopularRecommendations,
  }
}
