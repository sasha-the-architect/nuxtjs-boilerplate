import { ref } from 'vue'
import type { Resource } from '~/types/resource'
import {
  calculateSimilarity,
  type RecommendationConfig,
  type RecommendationResult,
  type UserPreferences,
} from '~/utils/recommendation-algorithms'
import { useContentBasedRecommendations } from './recommendation-strategies/useContentBasedRecommendations'
import { useTrendingRecommendations } from './recommendation-strategies/useTrendingRecommendations'
import { usePopularRecommendations } from './recommendation-strategies/usePopularRecommendations'
import { useCategoryBasedRecommendations } from './recommendation-strategies/useCategoryBasedRecommendations'
import { usePersonalizedRecommendations } from './recommendation-strategies/usePersonalizedRecommendations'

export const useRecommendationEngine = (
  allResources: readonly Resource[],
  userPreferences?: {
    interests?: string[]
    viewedResources?: string[]
    bookmarkedResources?: string[]
    skillLevel?: string
  }
) => {
  const config = ref<RecommendationConfig>({
    collaborativeWeight: 0.3,
    contentBasedWeight: 0.3,
    popularityWeight: 0.2,
    personalizationWeight: 0.2,
    maxRecommendations: 10,
    minSimilarityScore: 0.3,
    diversityFactor: 0.3,
  })

  const contentBased = useContentBasedRecommendations(
    allResources,
    config.value
  )
  const trending = useTrendingRecommendations(allResources, config.value)
  const popular = usePopularRecommendations(allResources, config.value)
  const categoryBased = useCategoryBasedRecommendations(
    allResources,
    config.value
  )
  const personalized = usePersonalizedRecommendations(
    allResources,
    config.value,
    userPreferences as UserPreferences,
    undefined
  )

  const getDiverseRecommendations = (
    currentResource?: Resource,
    currentCategory?: string
  ): RecommendationResult[] => {
    const recommendations: RecommendationResult[] = []
    const seenResourceIds = new Set<string>()

    if (currentResource) {
      const contentBasedRecs =
        contentBased.getContentBasedRecommendations(currentResource)
      recommendations.push(...contentBasedRecs)
      contentBasedRecs.forEach(rec => seenResourceIds.add(rec.resource.id))
    }

    if (currentCategory) {
      const categoryBasedRecs =
        categoryBased.getCategoryBasedRecommendations(currentCategory)
      const uniqueCategoryRecs = categoryBasedRecs.filter(
        rec => !seenResourceIds.has(rec.resource.id)
      )
      recommendations.push(...uniqueCategoryRecs)
      uniqueCategoryRecs.forEach(rec => seenResourceIds.add(rec.resource.id))
    }

    const trendingRecs = trending.getTrendingRecommendations()
    const uniqueTrendingRecs = trendingRecs
      .filter(rec => !seenResourceIds.has(rec.resource.id))
      .slice(0, Math.min(3, trendingRecs.length))
    recommendations.push(...uniqueTrendingRecs)
    uniqueTrendingRecs.forEach(rec => seenResourceIds.add(rec.resource.id))

    const popularRecs = popular.getPopularRecommendations()
    const uniquePopularRecs = popularRecs
      .filter(rec => !seenResourceIds.has(rec.resource.id))
      .slice(0, Math.min(3, popularRecs.length))
    recommendations.push(...uniquePopularRecs)
    uniquePopularRecs.forEach(rec => seenResourceIds.add(rec.resource.id))

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, config.value.maxRecommendations)
  }

  const updateConfig = (newConfig: Partial<RecommendationConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    get config() {
      return config.value
    },
    calculateSimilarity,
    updateConfig,
    getDiverseRecommendations,
    getPersonalizedRecommendations: personalized.getPersonalizedRecommendations,
    getContentBasedRecommendations: contentBased.getContentBasedRecommendations,
    getTrendingRecommendations: trending.getTrendingRecommendations,
    getPopularRecommendations: popular.getPopularRecommendations,
    getCategoryBasedRecommendations:
      categoryBased.getCategoryBasedRecommendations,
  }
}
