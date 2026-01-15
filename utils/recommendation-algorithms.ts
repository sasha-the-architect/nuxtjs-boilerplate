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

  const tagsB = new Set(resourceB.tags)
  const commonTags = resourceA.tags.filter(tag => tagsB.has(tag)).length
  if (commonTags > 0) {
    const tagSimilarity =
      commonTags / Math.max(resourceA.tags.length, resourceB.tags.length)
    score += 0.3 * tagSimilarity
  }

  const techB = new Set(resourceB.technology)
  const commonTech = resourceA.technology.filter(tech => techB.has(tech)).length
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

  const interestsSet = new Set(userPreferences.interests)

  if (interestsSet.has(resource.category)) {
    matchScore += 0.4
    totalFactors += 0.4
  }

  const matchingTags = resource.tags.filter(tag => interestsSet.has(tag)).length
  if (matchingTags > 0) {
    const tagMatch = (matchingTags / resource.tags.length) * 0.3
    matchScore += tagMatch
    totalFactors += 0.3
  }

  const matchingTech = resource.technology.filter(tech =>
    interestsSet.has(tech)
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

  const interactedSet = new Set(allInteractedResourceIds)
  const interactionCount = interactedSet.has(resourceId) ? 1 : 0
  return Math.min(1, interactionCount * 0.5)
}

export function applyDiversity(
  recommendations: RecommendationResult[],
  diversityFactor: number,
  maxRecommendations: number
): RecommendationResult[] {
  if (diversityFactor <= 0) return recommendations

  const diverseRecs: RecommendationResult[] = []
  const categoriesUsed = new Set<string>()
  const technologiesUsed = new Set<string>()

  for (const rec of recommendations) {
    const categoryDiversity = !categoriesUsed.has(rec.resource.category)
    const techDiversity = rec.resource.technology.some(
      tech => !technologiesUsed.has(tech)
    )

    if (
      diverseRecs.length < 3 ||
      categoryDiversity ||
      techDiversity ||
      Math.random() > 1 - diversityFactor
    ) {
      diverseRecs.push(rec)
      categoriesUsed.add(rec.resource.category)
      rec.resource.technology.forEach(tech => technologiesUsed.add(tech))

      if (diverseRecs.length >= maxRecommendations) break
    }
  }

  return diverseRecs
}
