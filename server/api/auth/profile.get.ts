import type { H3Event } from 'h3'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event: H3Event) => {
  // Get user from event context (requires authentication middleware)
  const user = await requireUser(event)
  
  // Return user profile (without sensitive data)
  const { password, ...userResponse } = user
  return userResponse
})

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  // Verify token (simplified for this example)
  if (!verifyJWT(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }

  // In a real application, the decoded user ID would come from the token
  // For this example, we'll simulate getting the user from storage
  const userId = getDecodedUserId(token)
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    })
  }

  const users = await getStoredUsers()
  const user = users.find(u => u.id === userId)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    })
  }

  return user
}

// JWT verification (simplified for this example)
function verifyJWT(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [header, payload, signature] = parts

    // Decode payload to check expiration
    const payloadStr = Buffer.from(payload, 'base64url').toString()
    const parsedPayload = JSON.parse(payloadStr)

    // Check expiration
    if (parsedPayload.exp < Math.floor(Date.now() / 1000)) {
      return false
    }

    // In production, verify the signature properly
    // For now, we'll just return true as a placeholder
    return true
  } catch {
    return false
  }
}

// Extract user ID from token (simplified for this example)
function getDecodedUserId(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const payloadStr = Buffer.from(payload, 'base64url').toString()
    const parsedPayload = JSON.parse(payloadStr)

    return parsedPayload.id || null
  } catch {
    return null
  }
}

// Helper functions to manage users
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
