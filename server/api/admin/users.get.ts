import type { H3Event } from 'h3'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event: H3Event) => {
  // Require admin role to access this endpoint
  await requireRole(event, 'admin')

  // Get all users
  const users = await getStoredUsers()

  // Return users (without sensitive data)
  const usersResponse = users.map(user => {
    const { password, ...userResponse } = user
    return userResponse
  })

  return {
    users: usersResponse,
    total: usersResponse.length,
  }
})

// Helper function to manage users
async function getStoredUsers() {
  try {
    const usersFile = await useStorage().getItem('users.json')
    if (usersFile) {
      return JSON.parse(usersFile as string)
    }
    return []
  } catch {
    return []
  }
}
