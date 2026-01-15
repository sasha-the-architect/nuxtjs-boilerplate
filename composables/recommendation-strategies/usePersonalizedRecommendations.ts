import type { Resource } from '~/types/resource'
import {
  calculateSimilarity,
  calculateInterestMatch,
  calculateSkillMatch,
  calculateCollaborativeScore,
  applyDiversity,
  type RecommendationConfig,
  type RecommendationResult,
  type UserPreferences,
} from '~/utils/recommendation-algorithms'

export function usePersonalizedRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig,
  userPreferences?: UserPreferences,
  getDiverseRecommendations?: (
     
    _currentResource?: Resource,
     
    _currentCategory?: string
  ) => RecommendationResult[]
) {
  const getPersonalizedRecommendations = (
    currentResource?: Resource,
    currentCategory?: string
  ): RecommendationResult[] => {
    if (!userPreferences && getDiverseRecommendations) {
      return getDiverseRecommendations(currentResource, currentCategory)
    }

    const personalizedRecs: RecommendationResult[] = []

    for (const resource of allResources) {
      if (currentResource && resource.id === currentResource.id) continue

      let contentScore = 0
      let interestScore = 0
      let collaborativeScore = 0
      let popularityScore = 0
      let skillScore = 0

      if (currentResource) {
        contentScore =
          calculateSimilarity(currentResource, resource) *
          config.contentBasedWeight
      }

      interestScore =
        calculateInterestMatch(resource, userPreferences) *
        config.personalizationWeight

      collaborativeScore =
        calculateCollaborativeScore(resource.id, userPreferences) *
        config.collaborativeWeight

      popularityScore = (resource.popularity / 10) * config.popularityWeight

      skillScore = calculateSkillMatch(resource, userPreferences) * 0.1

      const finalScore =
        contentScore +
        interestScore +
        collaborativeScore +
        popularityScore +
        skillScore

      if (finalScore > config.minSimilarityScore) {
        let reason:
          | 'collaborative'
          | 'content-based'
          | 'trending'
          | 'popular'
          | 'personalized'
          | 'serendipity' = 'personalized'
        let explanation = 'Recommended based on your interests and preferences'

        if (
          interestScore > contentScore &&
          interestScore > collaborativeScore
        ) {
          reason = 'personalized'
          explanation = `This resource matches your interests in ${resource.category} and related technologies`
        } else if (
          contentScore > interestScore &&
          contentScore > collaborativeScore
        ) {
          reason = 'content-based'
          explanation = currentResource
            ? `Similar to ${currentResource.title} based on category, tags, and technology`
            : 'Based on similarity to resources you might like'
        } else if (
          collaborativeScore > interestScore &&
          collaborativeScore > contentScore
        ) {
          reason = 'collaborative'
          explanation = 'Users with similar interests also liked this'
        } else if (popularityScore > 0.5) {
          reason = 'popular'
          explanation = 'Popular among all users'
        }

        personalizedRecs.push({
          resource,
          score: finalScore,
          reason,
          explanation,
        })
      }
    }

    return applyDiversity(
      personalizedRecs,
      config.diversityFactor,
      config.maxRecommendations
    )
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxRecommendations)
  }

  return {
    getPersonalizedRecommendations,
  }
}
