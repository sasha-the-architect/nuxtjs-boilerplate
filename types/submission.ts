// Define the form data interface
import type { HierarchicalTag } from './tag'
import type { Resource, Flag } from './resource'

export interface FormData {
  title: string
  description: string
  url: string
  category: string
  tags: string[] // Maintain backward compatibility
  hierarchicalTags?: readonly HierarchicalTag[] // New hierarchical tags support
}

export interface Submission {
  id: string
  resourceData: Partial<Resource>
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

export interface Submission {
  id: string
  resourceData: Partial<Resource>
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

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
  // Similar resources
  similarResources?: readonly string[] // IDs of similar resources
  // Moderation fields
  status?: 'pending' | 'approved' | 'rejected' | 'deprecated' // Default is 'approved' for existing resources
  submittedBy?: string // User ID
  reviewedBy?: string // Moderator ID
  reviewedAt?: string
  rejectionReason?: string
  qualityScore?: number
  flags?: Flag[]
}

export interface Flag {
  id: string
  resourceId: string
  reason: string
  reportedBy: string
  createdAt: string
  resolved: boolean
}
