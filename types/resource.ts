// Define TypeScript interfaces for resources
import type { HierarchicalTag } from './tag'

export interface Resource {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: readonly string[] // Maintain backward compatibility with flat tags
  hierarchicalTags?: readonly HierarchicalTag[] // New hierarchical tags support
  technology: readonly string[]
  dateAdded: string
  lastUpdated?: string // When the resource was last updated
  popularity: number
  viewCount?: number // Number of views for analytics
  rating?: number // Average user rating
  screenshots?: readonly string[] // URLs to screenshots/images
  specifications?: Record<string, string> // Detailed specifications
  features?: readonly string[] // Additional features beyond benefits
  limitations?: readonly string[] // Known limitations
  platforms?: readonly string[] // Supported platforms
  license?: string // License type if open source
  icon?: string
  // Alternative resources
  alternatives?: readonly string[] // IDs of alternative resources
  similarityScore?: number // For alternative relationships
  // Moderation fields
  status?: 'pending' | 'approved' | 'rejected' | 'deprecated' // Default is 'approved' for existing resources
  submittedBy?: string // User ID
  reviewedBy?: string // Moderator ID
  reviewedAt?: string
  rejectionReason?: string
  qualityScore?: number
  flags?: Flag[] | readonly Flag[]
}

export interface Flag {
  id: string
  resourceId: string
  reason: string
  reportedBy: string
  createdAt: string
  resolved: boolean
}

export interface StatusChange {
  id: string
  fromStatus: string
  toStatus: string
  changedAt: string
  changedBy: string
  reason?: string
  notes?: string
}

export interface ResourceUpdate {
  id: string
  version: string
  updatedAt: string
  changelog?: string
  changes?: string[]
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  joinedAt: string
  contributions?: number
  reputation?: number
}

export interface Comment {
  id: string
  userId: string
  targetType: string
  targetId: string
  content: string
  createdAt: string
  updatedAt?: string
  isEdited?: boolean
  editedAt?: string
  parentId?: string
  replies?: Comment[]
  likes?: number
}

export interface Vote {
  id: string
  userId: string
  targetType: string
  targetId: string
  voteType: 'up' | 'down'
  timestamp: string
}

export interface FilterOptions {
  searchQuery?: string
  categories?: string[]
  pricingModels?: string[]
  difficultyLevels?: string[]
  technologies?: string[]
  tags?: string[]
}

export type SortOption =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'popularity-desc'
  | 'date-added-desc'

// Alternative suggestion interfaces
export interface AlternativeSuggestion {
  resource: Resource
  similarityScore: number
  reason: string
}
