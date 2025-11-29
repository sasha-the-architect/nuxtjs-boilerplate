import type { H3Event } from 'h3'
import { getStoredUsers } from '~/server/utils/auth'

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10

  const users = await getStoredUsers()

  // Sort users by reputation (descending)
  const sortedUsers = [...users].sort(
    (a, b) => b.profile.reputation - a.profile.reputation
  )

  // Return top users based on limit
  return sortedUsers.slice(0, limit)
})
