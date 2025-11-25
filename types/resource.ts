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
  tags: readonly string[]
  technology: readonly string[]
  dateAdded: string
  popularity: number
  icon?: string
}

// Define the hierarchical tag structure
export interface HierarchicalTag {
  id: string
  name: string
  description?: string
  parentId?: string
  children?: HierarchicalTag[]
  synonyms?: string[]
  aliases?: string[]
  metadata?: Record<string, any>
}

export interface FilterOptions {
  searchQuery?: string
  categories?: string[]
  pricingModels?: string[]
  difficultyLevels?: string[]
  technologies?: string[]
  tags?: string[] // Add tags to filter options
}

export type SortOption =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'popularity-desc'
  | 'date-added-desc'
