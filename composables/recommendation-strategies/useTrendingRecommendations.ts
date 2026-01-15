import type { Resource } from '~/types/resource'
import {
  type RecommendationConfig,
  type RecommendationResult,
} from '~/utils/recommendation-algorithms'

export function useTrendingRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig
) {
  const getTrendingRecommendations = (): RecommendationResult[] => {
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const trending = allResources
      .filter(resource => {
        const addedDate = new Date(resource.dateAdded)
        return addedDate >= thirtyDaysAgo && resource.popularity > 5
      })
      .map(resource => ({
        resource,
        score: resource.popularity,
        reason: 'trending' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxRecommendations)

    return trending
  }

  return {
    getTrendingRecommendations,
  }
}
