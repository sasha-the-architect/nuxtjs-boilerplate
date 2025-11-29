import { ref, computed, readonly } from 'vue'
import type { Resource } from '~/types/resource'

// Recommendation types
export interface RecommendationConfig {
  collaborativeWeight: number
  contentBasedWeight: number
  maxRecommendations: number
  minSimilarityScore: number
}

export interface RecommendationResult {
  resource: Resource
  score: number
  reason: 'collaborative' | 'content-based' | 'trending' | 'popular'
}

// Main composable for the recommendation engine
export const useRecommendationEngine = (allResources: readonly Resource[]) => {
  // Configuration for the recommendation engine
  const config = ref<RecommendationConfig>({
    collaborativeWeight: 0.4,
    contentBasedWeight: 0.4,
    maxRecommendations: 10,
    minSimilarityScore: 0.3,
  })

  // Calculate similarity between two resources based on tags, categories, and technology
  const calculateSimilarity = (
    resourceA: Resource,
    resourceB: Resource
  ): number => {
    if (resourceA.id === resourceB.id) return 0 // Don't recommend the same resource

    let score = 0
    const totalFactors = 3 // category, tags, technology

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

  // Get content-based recommendations for a resource
  const getContentBasedRecommendations = (
    targetResource: Resource
  ): RecommendationResult[] => {
    const similarities: RecommendationResult[] = []

    for (const resource of allResources) {
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
    config: readonly(config),
    calculateSimilarity, // Make this available for testing
    updateConfig,
    getDiverseRecommendations,
    getContentBasedRecommendations,
    getTrendingRecommendations,
    getPopularRecommendations,
    getCategoryBasedRecommendations,
  }
}
