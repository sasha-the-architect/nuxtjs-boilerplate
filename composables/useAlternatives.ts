import { ref, computed, readonly } from 'vue'
import type {
  Resource,
  AlternativeSuggestion,
  AlternativeRelationship,
} from '~/types/resource'
import { useResourceData } from '~/composables/useResourceData'

// Types for alternative suggestions

// Main composable for alternative suggestions
export const useAlternatives = () => {
  const { resources } = useResourceData()

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
    if (!resources.value || resources.value.length === 0) {
      return []
    }

    const alternatives: AlternativeSuggestion[] = []

    for (const resource of resources.value) {
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
          score,
          reason,
          isAlternative: true,
          similarityFactors: [],
        })
      }
    }

    // Sort by similarity score and return top suggestions
    return alternatives
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
  }

  // Get alternatives based on pre-defined relationships in the resource data
  const getPredefinedAlternatives = (
    targetResource: Resource
  ): AlternativeSuggestion[] => {
    if (!targetResource.alternatives || !resources.value) return []

    const alternativeSuggestions: AlternativeSuggestion[] = []

    for (const altId of targetResource.alternatives) {
      const alternativeResource = resources.value.find(r => r.id === altId)
      if (alternativeResource) {
        alternativeSuggestions.push({
          resource: alternativeResource,
          score: targetResource.similarityScore || 0.8, // Default to high score for predefined
          reason: 'predefined alternative',
          isAlternative: true,
          similarityFactors: [],
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
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
  }

  return {
    getAlternativeSuggestions,
    getPredefinedAlternatives,
    getAllAlternatives,
    calculateAlternativeSimilarity,
  }
}
