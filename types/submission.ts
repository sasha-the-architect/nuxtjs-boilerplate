// Define the form data interface
import type { HierarchicalTag } from './tag'

export interface FormData {
  title: string
  description: string
  url: string
  category: string
  tags: string[] // Maintain backward compatibility
  hierarchicalTags?: readonly HierarchicalTag[] // New hierarchical tags support
}

export interface Submission {
  id: string
  title: string
  description: string
  url: string
  category: string
  tags: string[] // Maintain backward compatibility
  hierarchicalTags?: readonly HierarchicalTag[] // New hierarchical tags support
  status: string
  submittedAt: string
  submittedBy: string
  approvedAt: string | null
  approvedBy: string | null
  source?: string
}
