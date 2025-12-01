// types/user.ts
// User profile and preference types for the recommendation system

export interface UserPreferences {
  categories: string[]
  technologies: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  interests: string[]
  notificationSettings: {
    resourceUpdates: boolean
    newContent: boolean
    weeklyDigest: boolean
  }
  privacySettings: {
    allowPersonalization: boolean
    allowDataCollection: boolean
    allowRecommendationExplanations: boolean
  }
}

export interface UserInteraction {
  userId?: string
  resourceId: string
  interactionType:
    | 'view'
    | 'click'
    | 'bookmark'
    | 'like'
    | 'share'
    | 'submit'
    | 'comment'
  timestamp: number
  score?: number // For ratings (1-5 scale)
  duration?: number // Time spent viewing
  context?: {
    page?: string
    referrer?: string
    device?: string
    location?: string
  }
}

export interface UserProfile {
  id: string
  preferences: UserPreferences
  interactions: UserInteraction[]
  createdAt: string
  lastActive: string
  skillProgression?: {
    [category: string]: 'beginner' | 'intermediate' | 'advanced'
  }
  learningPaths?: string[] // IDs of resources in learning paths
}

export interface UserBehaviorData {
  userId: string
  views: UserInteraction[]
  bookmarks: UserInteraction[]
  ratings: UserInteraction[]
  searchHistory: Array<{
    query: string
    timestamp: number
    resultsCount: number
    clickedResource?: string
  }>
}
