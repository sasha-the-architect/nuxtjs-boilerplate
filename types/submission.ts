// Define the form data interface
import type { HierarchicalTag } from './tag'
import type { Resource } from './resource'

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
  resourceData: Partial<Resource>
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
  rejectionReason?: string
}
