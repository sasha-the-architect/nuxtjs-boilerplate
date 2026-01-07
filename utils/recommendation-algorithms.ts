import type { Resource } from '~/types/resource'

export interface RecommendationConfig {
  collaborativeWeight: number
  contentBasedWeight: number
  popularityWeight: number
  personalizationWeight: number
  maxRecommendations: number
  minSimilarityScore: number
  diversityFactor: number
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
  explanation?: string
}

export interface UserPreferences {
  interests?: string[]
  viewedResources?: string[]
  bookmarkedResources?: string[]
  skillLevel?: string
}

export function calculateSimilarity(
  resourceA: Resource,
  resourceB: Resource
): number {
  if (resourceA.id === resourceB.id) return 1

  let score = 0

  if (resourceA.category === resourceB.category) {
    score += 0.5
  }

  const commonTags = resourceA.tags.filter(tag =>
    resourceB.tags.includes(tag)
  ).length
  if (commonTags > 0) {
    const tagSimilarity =
      commonTags / Math.max(resourceA.tags.length, resourceB.tags.length)
    score += 0.3 * tagSimilarity
  }

  const commonTech = resourceA.technology.filter(tech =>
    resourceB.technology.includes(tech)
  ).length
  if (commonTech > 0) {
    const techSimilarity =
      commonTech /
      Math.max(resourceA.technology.length, resourceB.technology.length)
    score += 0.2 * techSimilarity
  }

  return Math.min(1, score)
}

export function calculateInterestMatch(
  resource: Resource,
  userPreferences?: UserPreferences
): number {
  if (!userPreferences?.interests || userPreferences.interests.length === 0) {
    return 0.5
  }

  let matchScore = 0
  let totalFactors = 0

  if (userPreferences.interests.includes(resource.category)) {
    matchScore += 0.4
    totalFactors += 0.4
  }

  const matchingTags = resource.tags.filter(tag =>
    userPreferences.interests?.includes(tag)
  ).length
  if (matchingTags > 0) {
    const tagMatch = (matchingTags / resource.tags.length) * 0.3
    matchScore += tagMatch
    totalFactors += 0.3
  }

  const matchingTech = resource.technology.filter(tech =>
    userPreferences.interests?.includes(tech)
  ).length
  if (matchingTech > 0) {
    const techMatch = (matchingTech / resource.technology.length) * 0.3
    matchScore += techMatch
    totalFactors += 0.3
  }

  return totalFactors > 0 ? matchScore / totalFactors : 0
}

export function calculateSkillMatch(
  resource: Resource,
  userPreferences?: UserPreferences
): number {
  if (!userPreferences?.skillLevel) return 0.5
  return 0.5
}

export function calculateCollaborativeScore(
  resourceId: string,
  userPreferences?: UserPreferences
): number {
  if (
    !userPreferences?.viewedResources &&
    !userPreferences?.bookmarkedResources
  ) {
    return 0
  }

  const allInteractedResourceIds = [
    ...(userPreferences?.viewedResources || []),
    ...(userPreferences?.bookmarkedResources || []),
  ]

  const interactionCount = allInteractedResourceIds.filter(
    id => id === resourceId
  ).length
  return Math.min(1, interactionCount * 0.5)
}

export function applyDiversity(
  recommendations: RecommendationResult[],
  diversityFactor: number,
  maxRecommendations: number
): RecommendationResult[] {
  if (diversityFactor <= 0) return recommendations

  const diverseRecs: RecommendationResult[] = []
  const categoriesUsed: string[] = []
  const technologiesUsed: string[] = []

  for (const rec of recommendations) {
    const categoryDiversity = !categoriesUsed.includes(rec.resource.category)
    const techDiversity = rec.resource.technology.some(
      tech => !technologiesUsed.includes(tech)
    )

    if (
      diverseRecs.length < 3 ||
      categoryDiversity ||
      techDiversity ||
      Math.random() > 1 - diversityFactor
    ) {
      diverseRecs.push(rec)
      categoriesUsed.push(rec.resource.category)
      technologiesUsed.push(...rec.resource.technology)

      if (diverseRecs.length >= maxRecommendations) break
    }
  }

  return diverseRecs
}
