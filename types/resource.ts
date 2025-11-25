// Define TypeScript interfaces for resources
export interface Resource {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: readonly string[] // Keep for backward compatibility
  technology: readonly string[]
  dateAdded: string
  popularity: number
  icon?: string
}

// Extended resource interface for hierarchical tags
export interface ResourceWithHierarchicalTags {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: readonly string[] // Original flat tags
  hierarchicalTags?: readonly string[] // Hierarchical tag identifiers
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
  hierarchicalTags?: string[]
}

export type SortOption =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'popularity-desc'
  | 'date-added-desc'
