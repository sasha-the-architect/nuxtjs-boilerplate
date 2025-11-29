import { ref, computed, readonly } from 'vue'
import type { Resource } from '~/types/resource'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'

// Interface for alternative suggestions
export interface AlternativeSuggestion {
  resource: Resource
  score: number
  reason: string
  isAlternative: boolean
  similarityFactors: string[]
}

// Configuration for alternative suggestions
export interface AlternativeConfig {
  minSimilarityScore: number
  maxAlternatives: number
  includeSimilar: boolean
  similarityThresholds: {
    high: number
    medium: number
    low: number
  }
}

// Main composable for alternative suggestions
export const useAlternativeSuggestions = (
  allResources: readonly Resource[]
) => {
  // Configuration for the alternative suggestions system
  const config = ref<AlternativeConfig>({
    minSimilarityScore: 0.3,
    maxAlternatives: 6,
    includeSimilar: true,
    similarityThresholds: {
      high: 0.7,
      medium: 0.5,
      low: 0.3,
    },
  })

  // Get alternatives for a specific resource
  const getAlternativesForResource = (
    targetResource: Resource
  ): AlternativeSuggestion[] => {
    if (!allResources || allResources.length === 0) return []

    const alternatives: AlternativeSuggestion[] = []
    const engine = useRecommendationEngine(allResources)

    for (const resource of allResources) {
      if (resource.id === targetResource.id) continue

      // Check if this resource is explicitly marked as an alternative
      const isExplicitAlternative =
        targetResource.alternatives?.includes(resource.id) ||
        resource.alternatives?.includes(targetResource.id)

      // Calculate similarity score
      const similarityScore = engine.calculateSimilarity(
        targetResource,
        resource
      )

      if (
        isExplicitAlternative ||
        similarityScore >= config.value.minSimilarityScore
      ) {
        // Determine similarity factors for the reason description
        const factors: string[] = []

        if (targetResource.category === resource.category) {
          factors.push('Same category')
        }

        if (targetResource.tags.some(tag => resource.tags.includes(tag))) {
          factors.push('Shared tags')
        }

        if (
          targetResource.technology.some(tech =>
            resource.technology.includes(tech)
          )
        ) {
          factors.push('Similar technology')
        }

        // Determine the reason based on whether it's explicitly an alternative
        const reason = isExplicitAlternative
          ? 'Marked as alternative'
          : getSimilarityReason(similarityScore)

        alternatives.push({
          resource,
          score: isExplicitAlternative ? 1 : similarityScore,
          reason,
          isAlternative: isExplicitAlternative || true, // Consider all similar resources as alternatives
          similarityFactors: factors,
        })
      }
    }

    // Sort by score descending and limit results
    return alternatives
      .sort((a, b) => b.score - a.score)
      .slice(0, config.value.maxAlternatives)
  }

  // Get similarity reason based on score
  const getSimilarityReason = (score: number): string => {
    if (score >= config.value.similarityThresholds.high) {
      return 'High similarity'
    } else if (score >= config.value.similarityThresholds.medium) {
      return 'Medium similarity'
    } else {
      return 'Low similarity'
    }
  }

  // Get alternatives with specific criteria
  const getAlternativesWithCriteria = (
    targetResource: Resource,
    criteria: Partial<AlternativeConfig>
  ): AlternativeSuggestion[] => {
    // Temporarily update config for this request
    const originalConfig = { ...config.value }
    config.value = { ...config.value, ...criteria }

    const results = getAlternativesForResource(targetResource)

    // Restore original config
    config.value = originalConfig

    return results
  }

  // Update configuration
  const updateConfig = (newConfig: Partial<AlternativeConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  // Get resource by ID helper
  const getResourceById = (id: string): Resource | undefined => {
    return allResources.find(resource => resource.id === id)
  }

  return {
    config: readonly(config),
    getAlternativesForResource,
    getAlternativesWithCriteria,
    updateConfig,
    getResourceById,
  }
}
