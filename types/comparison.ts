// Comparison-related TypeScript interfaces

import type { Resource } from './resource'

export interface ComparisonCriteria {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'list'
  weight?: number
  category: string
}

export interface ResourceComparison {
  id: string
  resources: string[] // Resource IDs
  criteria: ComparisonCriteria[]
  scores: Record<string, number>
  createdAt: string
  createdBy?: string
  isPublic: boolean
  slug?: string
}

export interface ComparisonView {
  resource: Resource
  scores: Record<string, number>
  highlights: string[]
  missing: string[]
}

export interface ComparisonData {
  resources: Resource[]
  criteria: ComparisonCriteria[]
  comparisonId?: string
}
