import type { H3Event } from 'h3'
import { getStoredUsers } from '~/server/utils/auth'

export default defineEventHandler(async (event: H3Event) => {
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    })
  }

  // In a real application, you'd fetch user activity from a database
  // For this example, we'll return mock activity data
  const activity = [
    {
      id: '1',
      type: 'comment',
      content: 'Added a comment to Resource A',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: '2',
      type: 'resource',
      content: 'Submitted a new resource',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
    {
      id: '3',
      type: 'vote',
      content: 'Upvoted a resource',
      timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    },
  ]

  return activity
})
