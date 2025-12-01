import { ref, computed, readonly } from 'vue'
import type { Resource } from '~/types/resource'
import { useUserPreferences } from '~/composables/useUserPreferences'

// Recommendation types
export interface RecommendationConfig {
  collaborativeWeight: number
  contentBasedWeight: number
  popularityWeight: number
  personalizationWeight: number
  maxRecommendations: number
  minSimilarityScore: number
  diversityFactor: number // How much to diversify recommendations
}

export interface RecommendationResult {
  resource: Resource
  score: number
  reason:
    | 'collaborative'
    | 'content-based'
    | 'trending'
    | 'popular'
    | 'personalized'
    | 'serendipity'
  explanation?: string // Explanation for why this was recommended
}

// Main composable for the recommendation engine
export const useRecommendationEngine = (
  allResources: readonly Resource[],
  userPreferences?: {
    interests?: string[]
    viewedResources?: string[]
    bookmarkedResources?: string[]
    skillLevel?: string
  }
) => {
  // Configuration for the recommendation engine
  const config = ref<RecommendationConfig>({
    collaborativeWeight: 0.3,
    contentBasedWeight: 0.3,
    popularityWeight: 0.2,
    personalizationWeight: 0.2,
    maxRecommendations: 10,
    minSimilarityScore: 0.3,
    diversityFactor: 0.3, // How much to diversify recommendations
  })

  // Calculate similarity between two resources based on tags, categories, and technology
  const calculateSimilarity = (
    resourceA: Resource,
    resourceB: Resource
  ): number => {
    if (resourceA.id === resourceB.id) return 1 // Same resource should have maximum similarity

    let score = 0

    // Category similarity (highest weight)
    if (resourceA.category === resourceB.category) {
      score += 0.5
    }

    // Tags similarity
    const commonTags = resourceA.tags.filter(tag =>
      resourceB.tags.includes(tag)
    ).length
    if (commonTags > 0) {
      const tagSimilarity =
        commonTags / Math.max(resourceA.tags.length, resourceB.tags.length)
      score += 0.3 * tagSimilarity
    }

    // Technology similarity
    const commonTech = resourceA.technology.filter(tech =>
      resourceB.technology.includes(tech)
    ).length
    if (commonTech > 0) {
      const techSimilarity =
        commonTech /
        Math.max(resourceA.technology.length, resourceB.technology.length)
      score += 0.2 * techSimilarity
    }

    return Math.min(1, score) // Cap at 1
  }

  // Calculate user interest match for a resource
  const calculateInterestMatch = (resource: Resource): number => {
    if (!userPreferences?.interests || userPreferences.interests.length === 0) {
      return 0.5 // Neutral score if no interests
    }

    let matchScore = 0
    let totalFactors = 0

    // Match categories
    if (userPreferences.interests.includes(resource.category)) {
      matchScore += 0.4
      totalFactors += 0.4
    }

    // Match tags
    const matchingTags = resource.tags.filter(tag =>
      userPreferences.interests?.includes(tag)
    ).length
    if (matchingTags > 0) {
      const tagMatch = (matchingTags / resource.tags.length) * 0.3
      matchScore += tagMatch
      totalFactors += 0.3
    }

    // Match technology
    const matchingTech = resource.technology.filter(tech =>
      userPreferences.interests?.includes(tech)
    ).length
    if (matchingTech > 0) {
      const techMatch = (matchingTech / resource.technology.length) * 0.3
      matchScore += techMatch
      totalFactors += 0.3
    }

    // Normalize score
    return totalFactors > 0 ? matchScore / totalFactors : 0
  }

  // Calculate skill level match
  const calculateSkillMatch = (resource: Resource): number => {
    if (!userPreferences?.skillLevel) return 0.5 // Neutral score if no skill level

    // For now, just return a base score, in a real implementation we'd match
    // resource difficulty with user skill level
    return 0.5
  }

  // Calculate collaborative filtering score based on user's past interactions
  const calculateCollaborativeScore = (resourceId: string): number => {
    // In a real implementation, this would use collaborative filtering algorithms
    // For now, we'll return a score based on user's past interactions
    if (
      !userPreferences?.viewedResources &&
      !userPreferences?.bookmarkedResources
    ) {
      return 0
    }

    // This is a simplified version - in real implementation would use
    // collaborative filtering algorithms
    const allInteractedResourceIds = [
      ...(userPreferences?.viewedResources || []),
      ...(userPreferences?.bookmarkedResources || []),
    ]

    // If user interacted with similar resources recently, score higher
    const interactionCount = allInteractedResourceIds.filter(
      id => id === resourceId
    ).length
    return Math.min(1, interactionCount * 0.5) // Cap at 1
  }

  // Get content-based recommendations for a resource
  const getContentBasedRecommendations = (
    targetResource: Resource
  ): RecommendationResult[] => {
    const similarities: RecommendationResult[] = []

    for (const resource of allResources) {
      // Skip the same resource to avoid recommending it to the user
      if (resource.id === targetResource.id) continue

      const similarity = calculateSimilarity(targetResource, resource)
      if (similarity >= config.value.minSimilarityScore) {
        similarities.push({
          resource,
          score: similarity,
          reason: 'content-based',
        })
      }
    }

    // Sort by similarity score and return top recommendations
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, config.value.maxRecommendations)
  }

  // Get trending resources (recently added and popular)
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
      .slice(0, config.value.maxRecommendations)

    return trending
  }

  // Get popular resources based on popularity score
  const getPopularRecommendations = (): RecommendationResult[] => {
    return allResources
      .map(resource => ({
        resource,
        score: resource.popularity,
        reason: 'popular' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.value.maxRecommendations)
  }

  // Get recommendations based on category
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
      .slice(0, config.value.maxRecommendations)

    return categoryResources
  }

  // Get personalized recommendations based on user preferences and behavior
  const getPersonalizedRecommendations = (
    currentResource?: Resource,
    currentCategory?: string
  ): RecommendationResult[] => {
    if (!userPreferences) {
      // If no user preferences, fall back to diverse recommendations
      return getDiverseRecommendations(currentResource, currentCategory)
    }

    const personalizedRecs: RecommendationResult[] = []

    for (const resource of allResources) {
      // Skip current resource to avoid recommending it to itself
      if (currentResource && resource.id === currentResource.id) continue

      // Calculate different scores
      let contentScore = 0
      let interestScore = 0
      let collaborativeScore = 0
      let popularityScore = 0
      let skillScore = 0

      // Content-based score (if we have a current resource)
      if (currentResource) {
        contentScore =
          calculateSimilarity(currentResource, resource) *
          config.value.contentBasedWeight
      }

      // Interest match score
      interestScore =
        calculateInterestMatch(resource) * config.value.personalizationWeight

      // Collaborative filtering score
      collaborativeScore =
        calculateCollaborativeScore(resource.id) *
        config.value.collaborativeWeight

      // Popularity score (normalized)
      popularityScore =
        (resource.popularity / 10) * config.value.popularityWeight // Assuming popularity is 0-10 scale

      // Skill match score
      skillScore = calculateSkillMatch(resource) * 0.1 // Lower weight for skill matching

      // Calculate final score with weights
      const finalScore =
        contentScore +
        interestScore +
        collaborativeScore +
        popularityScore +
        skillScore

      if (finalScore > config.value.minSimilarityScore) {
        // Determine the main reason for recommendation
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

    // Sort by score and apply diversity if needed
    return applyDiversity(personalizedRecs)
      .sort((a, b) => b.score - a.score)
      .slice(0, config.value.maxRecommendations)
  }

  // Apply diversity to recommendations to avoid filter bubbles
  const applyDiversity = (
    recommendations: RecommendationResult[]
  ): RecommendationResult[] => {
    if (config.value.diversityFactor <= 0) return recommendations

    const diverseRecs: RecommendationResult[] = []
    const categoriesUsed: string[] = []
    const technologiesUsed: string[] = []

    for (const rec of recommendations) {
      // Calculate diversity metric
      const categoryDiversity = !categoriesUsed.includes(rec.resource.category)
      const techDiversity = rec.resource.technology.some(
        tech => !technologiesUsed.includes(tech)
      )

      // If diversity threshold is met or we don't have many recommendations yet
      if (
        diverseRecs.length < 3 ||
        categoryDiversity ||
        techDiversity ||
        Math.random() > 1 - config.value.diversityFactor
      ) {
        diverseRecs.push(rec)
        categoriesUsed.push(rec.resource.category)
        technologiesUsed.push(...rec.resource.technology)

        if (diverseRecs.length >= config.value.maxRecommendations) break
      }
    }

    return diverseRecs
  }

  // Get diverse recommendations based on multiple factors
  const getDiverseRecommendations = (
    currentResource?: Resource,
    currentCategory?: string
  ): RecommendationResult[] => {
    const recommendations: RecommendationResult[] = []

    // Add content-based recommendations if we have a current resource
    if (currentResource) {
      const contentBased = getContentBasedRecommendations(currentResource)
      recommendations.push(...contentBased)
    }

    // Add category-based recommendations
    if (currentCategory) {
      const categoryBased = getCategoryBasedRecommendations(
        currentCategory
      ).filter(
        rec => !recommendations.some(r => r.resource.id === rec.resource.id)
      )
      recommendations.push(...categoryBased)
    }

    // Add trending resources to diversify
    const trending = getTrendingRecommendations().filter(
      rec => !recommendations.some(r => r.resource.id === rec.resource.id)
    )
    recommendations.push(...trending.slice(0, Math.min(3, trending.length)))

    // Add popular resources to diversify
    const popular = getPopularRecommendations().filter(
      rec => !recommendations.some(r => r.resource.id === rec.resource.id)
    )
    recommendations.push(...popular.slice(0, Math.min(3, popular.length)))

    // Return top recommendations sorted by score
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, config.value.maxRecommendations)
  }

  // Update configuration
  const updateConfig = (newConfig: Partial<RecommendationConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    get config() {
      return config.value
    },
    calculateSimilarity, // Make this available for testing
    updateConfig,
    getDiverseRecommendations,
    getPersonalizedRecommendations,
    getContentBasedRecommendations,
    getTrendingRecommendations,
    getPopularRecommendations,
    getCategoryBasedRecommendations,
  }
}
