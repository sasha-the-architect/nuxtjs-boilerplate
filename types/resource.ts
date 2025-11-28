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
  popularity: number
  icon?: string
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
