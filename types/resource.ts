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
  // URL health tracking fields
  lastChecked?: string
  statusCode?: number
  isHealthy?: boolean
  responseTime?: number
  healthCheckError?: string
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
