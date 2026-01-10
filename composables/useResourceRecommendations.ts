/**
 * Composable for resource recommendations
 * Implements a basic recommendation engine using collaborative and content-based filtering
 */
import type { Resource } from '~/types/resource'

interface UserInteraction {
  resourceId: string
  timestamp: Date
  interaction: 'view' | 'bookmark' | 'like'
}

interface Recommendation {
  resource: Resource
  score: number
  reason: string
}

interface RecommendationConfig {
  algorithm: string
  maxResults: number
  includeBookmarked: boolean
  includeViewed: boolean
}

interface RecommendationContext {
  currentResource?: Resource
}

export const useResourceRecommendations = (
  allResources: Resource[],
  currentUserInteractions: UserInteraction[] = []
) => {
  // User's interaction history
  let userInteractions = currentUserInteractions || []

  // Configuration for recommendations
  let config: RecommendationConfig = {
    algorithm: 'hybrid',
    maxResults: 10,
    includeBookmarked: false,
    includeViewed: false,
  }

  // Update configuration
  const updateConfig = (newConfig: Partial<RecommendationConfig>) => {
    for (const key in newConfig) {
      config[key as keyof RecommendationConfig] = newConfig[
        key as keyof RecommendationConfig
      ] as any
    }
  }

  // Record user interaction with a resource
  const recordInteraction = (
    resourceId: string,
    interaction: 'view' | 'bookmark' | 'like'
  ) => {
    userInteractions.push({
      resourceId,
      timestamp: new Date(),
      interaction,
    })

    // Keep only recent interactions (last 30 days)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)
    userInteractions = userInteractions.filter(
      interaction => interaction.timestamp > cutoffDate
    )
  }

  // Get resources similar to a given resource based on tags and categories
  const getSimilarResources = (
    targetResource: Resource,
    limit: number = 5
  ): Recommendation[] => {
    const similar: Recommendation[] = []

    allResources.forEach(resource => {
      if (resource.id === targetResource.id) return // Skip the target resource itself

      let score = 0

      // Calculate similarity based on tags
      if (targetResource.tags && resource.tags) {
        const commonTags = targetResource.tags.filter(tag =>
          resource.tags?.includes(tag)
        )
        score += (commonTags.length / targetResource.tags.length) * 50
      }

      // Calculate similarity based on category
      if (targetResource.category === resource.category) {
        score += 30
      }

      // Calculate similarity based on benefits
      if (targetResource.benefits && resource.benefits) {
        const commonBenefits = targetResource.benefits.filter(benefit =>
          resource.benefits?.includes(benefit)
        )
        score += (commonBenefits.length / targetResource.benefits.length) * 20
      }

      if (score > 0) {
        similar.push({
          resource,
          score,
          reason: 'Similar tags, category, or benefits',
        })
      }
    })

    // Sort by score descending and limit results
    return similar
      .sort((a: Recommendation, b: Recommendation) => b.score - a.score)
      .slice(0, limit)
  }

  // Get resources based on collaborative filtering (users who viewed this also viewed these)
  const getCollaborativeRecommendations = (
    targetResourceId: string,
    limit: number = 5
  ): Recommendation[] => {
    // In a real implementation, this would use actual user behavior data
    // For now, we'll simulate this with resources in the same category
    const targetResource = allResources.find(r => r.id === targetResourceId)
    if (!targetResource) return []

    const sameCategory = allResources
      .filter(
        resource =>
          resource.category === targetResource.category &&
          resource.id !== targetResourceId
      )
      .map(resource => ({
        resource,
        score: 70, // High score for same category
        reason:
          'Users who viewed this also viewed similar resources in the same category',
      }))

    return sameCategory.slice(0, limit)
  }

  // Get popular resources (trending or highly rated)
  const getPopularRecommendations = (limit: number = 5): Recommendation[] => {
    // Sort by some popularity metric (in this case, just by ID as a placeholder)
    // In a real implementation, this would use actual popularity metrics
    return allResources
      .map(resource => ({
        resource,
        score: Math.random() * 100, // Random score as placeholder
        reason: 'Popular resource',
      }))
      .sort((a: Recommendation, b: Recommendation) => b.score - a.score)
      .slice(0, limit)
  }

  // Get trending resources (recently added or viewed)
  const getTrendingRecommendations = (limit: number = 5): Recommendation[] => {
    // Sort by date added (assuming resources have a dateAdded field)
    // In this case, we'll sort by ID as a placeholder
    return allResources
      .map(resource => ({
        resource,
        score: Math.random() * 100, // Random score as placeholder
        reason: 'Trending resource',
      }))
      .sort((a: Recommendation, b: Recommendation) => b.score - a.score)
      .slice(0, limit)
  }

  // Generate recommendations based on configured algorithm
  const generateRecommendations = (
    context?: RecommendationContext
  ): Recommendation[] => {
    let recommendations: Recommendation[] = []

    switch (config.algorithm) {
      case 'collaborative':
        if (context?.currentResource) {
          recommendations = getCollaborativeRecommendations(
            context.currentResource.id
          )
        }
        break
      case 'content-based': {
        if (context?.currentResource) {
          recommendations = getSimilarResources(context.currentResource)
        }
        break
      }
      case 'hybrid': {
        // Combine multiple approaches
        const collaborative = context?.currentResource
          ? getCollaborativeRecommendations(context.currentResource.id, 3)
          : []

        const contentBased = context?.currentResource
          ? getSimilarResources(context.currentResource, 3)
          : []

        const popular = getPopularRecommendations(4)

        // Combine and deduplicate
        const combined = [...collaborative, ...contentBased, ...popular]
        const seenIds: Record<string, boolean> = {}
        recommendations = combined.filter(item => {
          if (seenIds[item.resource.id]) {
            return false
          }
          seenIds[item.resource.id] = true
          return true
        })
        break
      }
      case 'popular': {
        recommendations = getPopularRecommendations()
        break
      }
      case 'trending': {
        recommendations = getTrendingRecommendations()
        break
      }
    }

    // Filter out resources that user has already interacted with if configured
    if (!config.includeViewed) {
      const viewedIds: Record<string, boolean> = {}
      userInteractions
        .filter(i => i.interaction !== 'bookmark') // Don't filter out bookmarked items
        .forEach(i => (viewedIds[i.resourceId] = true))

      recommendations = recommendations.filter(
        item => !viewedIds[item.resource.id]
      )
    }

    if (!config.includeBookmarked) {
      const bookmarkedIds: Record<string, boolean> = {}
      userInteractions
        .filter(i => i.interaction === 'bookmark')
        .forEach(i => (bookmarkedIds[i.resourceId] = true))

      recommendations = recommendations.filter(
        item => !bookmarkedIds[item.resource.id]
      )
    }

    // Limit results
    return recommendations.slice(0, config.maxResults)
  }

  // Get recommendations for a specific resource
  const getRecommendationsForResource = (
    resourceId: string
  ): Recommendation[] => {
    const resource = allResources.find(r => r.id === resourceId)
    if (!resource) return []

    return generateRecommendations({ currentResource: resource })
  }

  // Get general recommendations for user
  const getUserRecommendations = (): Recommendation[] => {
    // For now, return popular recommendations
    // In a real implementation, this would use user-specific data
    return generateRecommendations()
  }

  // Return composable functions
  return {
    config,
    userInteractions,
    updateConfig,
    recordInteraction,
    getSimilarResources,
    getCollaborativeRecommendations,
    getPopularRecommendations,
    getTrendingRecommendations,
    generateRecommendations,
    getRecommendationsForResource,
    getUserRecommendations,
  }
}
