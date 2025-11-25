// Define TypeScript interfaces for hierarchical tags
export interface HierarchicalTag {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  children?: HierarchicalTag[]
  synonyms?: string[]
  aliases?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface TagWithHierarchy extends HierarchicalTag {
  path?: string[] // Full path from root to this tag (e.g., ['programming', 'languages', 'javascript'])
  level?: number // Depth level in the hierarchy
  hasChildren: boolean // Whether this tag has child tags
}

export interface TagFilterOptions {
  includeChildren?: boolean // Whether to include child tags when filtering
  includeParents?: boolean // Whether to include parent tags when filtering
  searchInSynonyms?: boolean // Whether to search in synonyms and aliases
  exactMatch?: boolean // Whether to use exact match for filtering
}

export interface ResourceWithHierarchicalTags {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: readonly (string | TagWithHierarchy)[] // Support both flat tags and hierarchical tags
  technology: readonly string[]
  dateAdded: string
  popularity: number
  icon?: string
}
