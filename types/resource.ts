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
  // Similar resources
  similarResources?: readonly string[] // IDs of similar resources
  // Resource Status and Lifecycle Management
  status?: 'active' | 'deprecated' | 'discontinued' | 'updated' | 'pending' // Default is 'active'
  statusHistory?: StatusChange[]
  lastHealthCheck?: string
  healthScore?: number
  deprecationDate?: string
  migrationPath?: string
  version?: string
  updateHistory?: ResourceUpdate[]
}

// Status change tracking
export interface StatusChange {
  id: string
  fromStatus: string
  toStatus: string
  reason: string
  changedBy: string // User ID or 'system'
  changedAt: string
  notes?: string
}

// Resource update tracking
export interface ResourceUpdate {
  id: string
  version: string
  changes: string[]
  updatedAt: string
  updatedBy: string
  changelog?: string
}

// Health check tracking
export interface HealthCheck {
  resourceId: string
  status: 'healthy' | 'warning' | 'error'
  responseTime?: number
  checkedAt: string
  error?: string
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
