// server/api/recommendations/index.get.ts
// API endpoint for personalized recommendations

import { useResourceData } from '~/composables/useResourceData'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import type { Resource } from '~/types/resource'
import {
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { defineEventHandler, getQuery } from 'h3'

export interface RecommendationQuery {
  userId?: string
  resourceId?: string // For resource-based recommendations
  category?: string // For category-based recommendations
  limit?: string // Number of recommendations to return
  type?: 'personalized' | 'trending' | 'popular' | 'related' // Type of recommendations
}

export default defineEventHandler(async event => {
  try {
    const query = getQuery<RecommendationQuery>(event)
    const limit = parseInt(query.limit || '10', 10)

    // Get all resources
    const { resources } = useResourceData()
    const allResources = resources.value || []

    // Find specific resource if resourceId is provided
    let targetResource: Resource | undefined
    if (query.resourceId) {
      targetResource = allResources.find(r => r.id === query.resourceId)
      if (!targetResource) {
        sendNotFoundError(event, 'Resource', query.resourceId)
        return
      }
    }

    // Create a mock user profile for demonstration
    // In a real implementation, this would come from authentication
    const mockUserProfile = {
      interests: ['javascript', 'vue', 'nuxt', 'web-development'],
      viewedResources: query.userId ? [] : [], // In real app, get from user profile
      bookmarkedResources: query.userId ? [] : [],
      skillLevel: 'intermediate',
    }

    // Initialize recommendation engine with user preferences
    const engine = useRecommendationEngine(allResources, mockUserProfile)

    // Adjust max recommendations based on query
    engine.updateConfig({ maxRecommendations: Math.min(limit, 50) }) // Cap at 50

    let recommendations

    switch (query.type) {
      case 'personalized':
        recommendations = engine.getPersonalizedRecommendations(
          targetResource,
          query.category
        )
        break
      case 'related':
        recommendations = engine.getContentBasedRecommendations(targetResource!)
        break
      case 'trending':
        recommendations = engine.getTrendingRecommendations()
        break
      case 'popular':
        recommendations = engine.getPopularRecommendations()
        break
      default:
        // Default to personalized if user has preferences, otherwise diverse
        if (mockUserProfile.interests.length > 0) {
          recommendations = engine.getPersonalizedRecommendations(
            targetResource,
            query.category
          )
        } else {
          recommendations = engine.getDiverseRecommendations(
            targetResource,
            query.category
          )
        }
    }

    // Return the recommendations
    sendSuccessResponse(event, {
      recommendations: recommendations.map(r => ({
        id: r.resource.id,
        title: r.resource.title,
        description: r.resource.description,
        url: r.resource.url,
        category: r.resource.category,
        tags: r.resource.tags,
        technology: r.resource.technology,
        popularity: r.resource.popularity,
        score: r.score,
        reason: r.reason,
        explanation: r.explanation,
        dateAdded: r.resource.dateAdded,
      })),
      total: recommendations.length,
      userId: query.userId || null,
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
