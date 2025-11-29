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

  const users = await getStoredUsers()
  const user = users.find(u => u.id === userId)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Return user profile (without sensitive data)
  const { password, ...userResponse } = user
  return userResponse
})
