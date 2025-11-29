import { ref, computed, readonly } from 'vue'
import type { Resource } from '~/types/resource'
import { useResourceData } from '~/composables/useResourceData'

// Types for alternative suggestions
export interface AlternativeRelationship {
  id: string
  resourceId: string
  alternativeId: string
  similarityScore: number
  reason: string
  createdAt: string
}

export interface AlternativeSuggestion {
  resource: Resource
  similarityScore: number
  reason: string
}

// Main composable for alternative suggestions
export const useAlternatives = (resources: Resource[] = []) => {
  const { resources: resourceData } = useResourceData()

  /**
   * Calculate text similarity using a simple Jaccard similarity approach
   */
  const calculateTextSimilarity = (text1: string, text2: string): number => {
    if (!text1 || !text2) return 0
    if (text1 === text2) return 1

    // Tokenize text into words
    const words1 = text1.split(/\s+/).filter(word => word.length > 2)
    const words2 = text2.split(/\s+/).filter(word => word.length > 2)

    // Find intersection and union of words
    const intersection = words1.filter(word => words2.includes(word)).length
    const union = [...new Set([...words1, ...words2])].length

    return union > 0 ? intersection / union : 0
  }

  // Calculate similarity between two resources for alternative suggestions
  const calculateAlternativeSimilarity = (
    resourceA: Resource,
    resourceB: Resource
  ): { score: number; reason: string } => {
    if (resourceA.id === resourceB.id)
      return { score: 0, reason: 'same resource' }

    let score = 0
    let reasons: string[] = []

    // Category similarity (high weight for alternatives)
    if (resourceA.category === resourceB.category) {
      score += 0.4
      reasons.push('same category')
    }

    // Tags similarity
    const commonTags = resourceA.tags.filter(tag =>
      resourceB.tags.includes(tag)
    ).length
    if (commonTags > 0) {
      const tagSimilarity =
        commonTags / Math.max(resourceA.tags.length, resourceB.tags.length)
      score += 0.3 * tagSimilarity
      reasons.push(`${commonTags} common tags`)
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
      reasons.push(`${commonTech} common technologies`)
    }

    // Pricing model similarity
    if (resourceA.pricingModel === resourceB.pricingModel) {
      score += 0.1
      reasons.push('same pricing model')
    }

    return {
      score: Math.min(1, score),
      reason: reasons.join(', '),
    }
  }

  // Get alternative suggestions for a resource
  const getAlternativeSuggestions = (
    targetResource: Resource,
    maxSuggestions: number = 6
  ): AlternativeSuggestion[] => {
    // Use provided resources array if available, otherwise fall back to resourceData
    const availableResources = resources.length > 0 ? resources : resourceData.value || []
    
    if (!availableResources || availableResources.length === 0) {
      return []
    }

    const alternatives: AlternativeSuggestion[] = []

    for (const resource of availableResources) {
      // Skip if it's the same resource
      if (resource.id === targetResource.id) continue

      // Skip if they're in different categories (for alternatives, we typically want same category)
      if (resource.category !== targetResource.category) continue

      const { score, reason } = calculateAlternativeSimilarity(
        targetResource,
        resource
      )

      // Only include if similarity is above threshold
      if (score >= 0.3) {
        alternatives.push({
          resource,
          similarityScore: score,
          reason,
        })
      }
    }

    // Sort by similarity score and return top suggestions
    return alternatives
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, maxSuggestions)
  }

  // Get alternatives based on pre-defined relationships in the resource data
  const getPredefinedAlternatives = (
    targetResource: Resource
  ): AlternativeSuggestion[] => {
    if (!targetResource.alternatives || !resourceData.value) return []

    const alternativeSuggestions: AlternativeSuggestion[] = []

    for (const altId of targetResource.alternatives) {
      const alternativeResource = resourceData.value.find(r => r.id === altId)
      if (alternativeResource) {
        alternativeSuggestions.push({
          resource: alternativeResource,
          similarityScore: targetResource.similarityScore || 0.8, // Default to high score for predefined
          reason: 'predefined alternative',
        })
      }
    }

    return alternativeSuggestions
  }

  // Combine both predefined and calculated alternatives
  const getAllAlternatives = (
    targetResource: Resource,
    maxSuggestions: number = 6
  ): AlternativeSuggestion[] => {
    const predefined = getPredefinedAlternatives(targetResource)
    const calculated = getAlternativeSuggestions(targetResource, maxSuggestions)

    // Combine and deduplicate
    const allAlternatives = [...predefined, ...calculated]

    // Remove duplicates by resource ID
    const uniqueAlternatives = allAlternatives.filter(
      (alt, index, self) =>
        index === self.findIndex(a => a.resource.id === alt.resource.id)
    )

    // Sort by similarity score and return top suggestions
    return uniqueAlternatives
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, maxSuggestions)
  }

  /**
   * Find alternative resources based on category, tags, and description similarity
   */
  const findAlternatives = (
    currentResource: Resource,
    limit: number = 6
  ): AlternativeSuggestion[] => {
    // Use provided resources array if available, otherwise fall back to resourceData
    const availableResources = resources.length > 0 ? resources : resourceData.value || []
    
    if (!availableResources || availableResources.length === 0) return []

    return availableResources
      .filter(resource => resource.id !== currentResource.id) // Exclude current resource
      .map(resource => ({
        resource,
        similarityScore: calculateAlternativeSimilarity(currentResource, resource).score,
        reason: calculateAlternativeSimilarity(currentResource, resource).reason
      }))
      .filter(alt => alt.similarityScore > 0.1) // Filter out very low similarity
      .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity
      .slice(0, limit) // Limit results
  }

  /**
   * Get alternatives for a resource from the API
   */
  const getAlternativesForResource = async (
    resourceId: string,
    limit: number = 6
  ): Promise<AlternativeSuggestion[]> => {
    try {
      const response = await $fetch(
        `/api/v1/resources/${resourceId}/alternatives`,
        {
          method: 'GET',
          params: { limit },
        }
      )

      if (response && response.success && response.data) {
        return response.data
      }

      return []
    } catch (error) {
      return []
    }
  }

  return {
    getAlternativeSuggestions,
    getPredefinedAlternatives,
    getAllAlternatives,
    calculateAlternativeSimilarity,
    findAlternatives,
    getAlternativesForResource,
  }
}