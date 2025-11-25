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
  // Link validation properties
  linkHealth?: LinkHealth
}

export interface LinkHealth {
  status: 'valid' | 'invalid' | 'unknown' | 'checking'
  lastChecked: string
  statusCode?: number
  responseTime?: number
  error?: string
}

export interface FilterOptions {
  searchQuery?: string
  categories?: string[]
  pricingModels?: string[]
  difficultyLevels?: string[]
  technologies?: string[]
}

export type SortOption =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'popularity-desc'
  | 'date-added-desc'
