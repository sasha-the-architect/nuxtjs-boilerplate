// Define search-related TypeScript types

// Suggestion result interface as specified in the issue
export interface SuggestionResult {
  text: string
  type: 'resource' | 'category' | 'tag' | 'popular'
  score: number
  resourceId?: string
  metadata?: Record<string, unknown>
}

// Search query structure
export interface SearchQuery {
  terms: string[]
  operators: ('AND' | 'OR' | 'NOT')[]
  filters: Record<string, string[]>
}

// Search analytics event
export interface SearchAnalyticsEvent {
  query: string
  resultsCount: number
  timestamp: number
  duration: number
  userId?: string
  sessionId: string
}

// Search facet counts
export interface FacetCounts {
  [key: string]: number
}

// Search configuration options
export interface SearchConfig {
  debounceTime?: number
  maxSuggestions?: number
  enableFuzzySearch?: boolean
  enableFacetedSearch?: boolean
  maxResults?: number
}

// Saved search interface
export interface SavedSearch {
  name: string
  query: string
  createdAt: Date
}
