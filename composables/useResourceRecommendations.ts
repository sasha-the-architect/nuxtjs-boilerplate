/**
 * Composable for resource recommendations
 * Implements a basic recommendation engine using collaborative and content-based filtering
 */

// Since we can't import Vue directly due to TypeScript issues in this environment,
// we'll define the functions without strict typing for now
export const useResourceRecommendations = (
  allResources,
  currentUserInteractions
) => {
  // User's interaction history
  let userInteractions = currentUserInteractions || []

  // Configuration for recommendations
  let config = {
    algorithm: 'hybrid',
    maxResults: 10,
    includeBookmarked: false,
    includeViewed: false,
  }

  // Update configuration
  const updateConfig = newConfig => {
    for (const key in newConfig) {
      config[key] = newConfig[key]
    }
  }

  // Record user interaction with a resource
  const recordInteraction = (resourceId, interaction) => {
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
  const getSimilarResources = (targetResource, limit = 5) => {
    const similar = []

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
    return similar.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  // Get resources based on collaborative filtering (users who viewed this also viewed these)
  const getCollaborativeRecommendations = (targetResourceId, limit = 5) => {
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
  const getPopularRecommendations = (limit = 5) => {
    // Sort by some popularity metric (in this case, just by ID as a placeholder)
    // In a real implementation, this would use actual popularity metrics
    return allResources
      .map(resource => ({
        resource,
        score: Math.random() * 100, // Random score as placeholder
        reason: 'Popular resource',
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // Get trending resources (recently added or viewed)
  const getTrendingRecommendations = (limit = 5) => {
    // Sort by date added (assuming resources have a dateAdded field)
    // In this case, we'll sort by ID as a placeholder
    return allResources
      .map(resource => ({
        resource,
        score: Math.random() * 100, // Random score as placeholder
        reason: 'Trending resource',
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // Generate recommendations based on the configured algorithm
  const generateRecommendations = context => {
    let recommendations = []

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
        const seenIds = {}
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

    // Filter out resources the user has already interacted with if configured
    if (!config.includeViewed) {
      const viewedIds = {}
      userInteractions
        .filter(i => i.interaction !== 'bookmark') // Don't filter out bookmarked items
        .forEach(i => (viewedIds[i.resourceId] = true))

      recommendations = recommendations.filter(
        item => !viewedIds[item.resource.id]
      )
    }

    if (!config.includeBookmarked) {
      const bookmarkedIds = {}
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
  const getRecommendationsForResource = resourceId => {
    const resource = allResources.find(r => r.id === resourceId)
    if (!resource) return []

    return generateRecommendations({ currentResource: resource })
  }

  // Get general recommendations for the user
  const getUserRecommendations = () => {
    // For now, return popular recommendations
    // In a real implementation, this would use user-specific data
    return generateRecommendations()
  }

  // Return the composable functions
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
