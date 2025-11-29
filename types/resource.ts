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
