import type { Submission } from '~/types/submission'
import { getQuery } from 'h3'

// Mock data for demonstration - in a real application, this would come from a database
let mockSubmissions: Submission[] = []

export default defineEventHandler(async event => {
  try {
    // Get query parameters for filtering
    const query = getQuery(event)
    const statusFilter = query.status as string | undefined
    const submittedByFilter = query.submittedBy as string | undefined
    const limit = query.limit ? parseInt(query.limit as string) : 50
    const offset = query.offset ? parseInt(query.offset as string) : 0

    // Filter submissions based on query parameters
    let filteredSubmissions = [...mockSubmissions]

    if (statusFilter) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => sub.status === statusFilter
      )
    }

    if (submittedByFilter) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => sub.submittedBy === submittedByFilter
      )
    }

    // Apply pagination
    const paginatedSubmissions = filteredSubmissions.slice(
      offset,
      offset + limit
    )

    return {
      success: true,
      submissions: paginatedSubmissions,
      total: filteredSubmissions.length,
      limit,
      offset,
    }
  } catch (error: any) {
    console.error('Error fetching submissions:', error)

    return {
      success: false,
      message: 'An error occurred while fetching submissions',
      submissions: [],
      total: 0,
    }
  }
})
