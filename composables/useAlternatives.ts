import type { Resource } from '~/types/resource'

export interface Alternative {
  resource: Resource
  similarityScore: number
}

export const useAlternatives = (resources: Resource[]) => {
  /**
   * Find alternative resources based on category, tags, and description similarity
   */
  const findAlternatives = (
    currentResource: Resource,
    limit: number = 6
  ): Alternative[] => {
    if (!resources || resources.length === 0) return []

    return resources
      .filter(resource => resource.id !== currentResource.id) // Exclude current resource
      .map(resource => ({
        resource,
        similarityScore: calculateSimilarity(currentResource, resource),
      }))
      .filter(alt => alt.similarityScore > 0.1) // Filter out very low similarity
      .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity
      .slice(0, limit) // Limit results
  }

  /**
   * Calculate similarity score between two resources (0-1)
   */
  const calculateSimilarity = (
    resource1: Resource,
    resource2: Resource
  ): number => {
    let score = 0
    let totalWeight = 0

    // Category similarity (weight: 0.4)
    if (resource1.category === resource2.category) {
      score += 0.4
    }
    totalWeight += 0.4

    // Tag overlap (weight: 0.3)
    const tagIntersection = resource1.tags.filter(tag =>
      resource2.tags.includes(tag)
    ).length
    const tagUnion = [...new Set([...resource1.tags, ...resource2.tags])].length
    const tagSimilarity = tagUnion > 0 ? tagIntersection / tagUnion : 0
    score += tagSimilarity * 0.3
    totalWeight += 0.3

    // Description similarity (weight: 0.2)
    const descSimilarity = calculateTextSimilarity(
      resource1.description.toLowerCase(),
      resource2.description.toLowerCase()
    )
    score += descSimilarity * 0.2
    totalWeight += 0.2

    // Technology overlap (weight: 0.1)
    const techIntersection = resource1.technology.filter(tech =>
      resource2.technology.includes(tech)
    ).length
    const techUnion = [
      ...new Set([...resource1.technology, ...resource2.technology]),
    ].length
    const techSimilarity = techUnion > 0 ? techIntersection / techUnion : 0
    score += techSimilarity * 0.1
    totalWeight += 0.1

    // Normalize score based on actual weights applied
    return totalWeight > 0 ? score / totalWeight : 0
  }

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

  /**
   * Get alternatives for a resource from the API
   */
  const getAlternativesForResource = async (
    resourceId: string,
    limit: number = 6
  ): Promise<Alternative[]> => {
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
    findAlternatives,
    calculateSimilarity,
    getAlternativesForResource,
  }
}
