import type { Submission } from '~/types/submission'
import { getQuery } from 'h3'

// Mock data for demonstration - in a real application, this would come from a database
let mockSubmissions: Submission[] = [
  {
    id: 'sub_1648729345_abc123',
    resourceData: {
      title: 'Test Resource 1',
      description: 'This is a test resource for moderation',
      url: 'https://example.com/test1',
      category: 'Development',
      tags: ['javascript', 'web'],
      pricingModel: 'Free',
      difficulty: 'Beginner',
      technology: ['JavaScript', 'React'],
    },
    status: 'pending',
    submittedBy: 'user123',
    submittedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'sub_1648815745_def456',
    resourceData: {
      title: 'Another Test Resource',
      description: 'Another test resource for moderation',
      url: 'https://example.com/test2',
      category: 'Design',
      tags: ['ui', 'ux'],
      pricingModel: 'Paid',
      difficulty: 'Intermediate',
      technology: ['Figma', 'Design'],
    },
    status: 'pending',
    submittedBy: 'user456',
    submittedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  },
]

export default defineEventHandler(async event => {
  try {
    // In a real application, this would query the database for pending submissions
    // with additional filtering and pagination options

    // Get query parameters for filtering
    const query = getQuery(event)
    const statusFilter = query.status as string | undefined
    const categoryFilter = query.category as string | undefined
    const limit = query.limit ? parseInt(query.limit as string) : 50
    const offset = query.offset ? parseInt(query.offset as string) : 0

    // Filter submissions based on query parameters
    let filteredSubmissions = [...mockSubmissions]

    if (statusFilter) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => sub.status === statusFilter
      )
    }

    if (categoryFilter) {
      filteredSubmissions = filteredSubmissions.filter(sub =>
        sub.resourceData?.category
          ?.toLowerCase()
          .includes(categoryFilter.toLowerCase())
      )
    }

    // Apply pagination
    const paginatedSubmissions = filteredSubmissions.slice(
      offset,
      offset + limit
    )

    return {
      success: true,
      queue: paginatedSubmissions,
      total: filteredSubmissions.length,
      limit,
      offset,
    }
  } catch (error: any) {
    console.error('Error fetching moderation queue:', error)

    return {
      success: false,
      message: 'An error occurred while fetching the moderation queue',
      queue: [],
      total: 0,
    }
  }
})
