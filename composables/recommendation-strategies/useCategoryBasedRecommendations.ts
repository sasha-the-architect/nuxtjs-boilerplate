import type { Resource } from '~/types/resource'
import {
  type RecommendationConfig,
  type RecommendationResult,
} from '~/utils/recommendation-algorithms'

export function useCategoryBasedRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig
) {
  const getCategoryBasedRecommendations = (
    category: string
  ): RecommendationResult[] => {
    const categoryResources = allResources
      .filter(resource => resource.category === category)
      .map(resource => ({
        resource,
        score: resource.popularity,
        reason: 'content-based' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxRecommendations)

    return categoryResources
  }

  return {
    getCategoryBasedRecommendations,
  }
}
