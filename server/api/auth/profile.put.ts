import type { H3Event } from 'h3'
import { requireUser, getStoredUsers, saveUsers } from '~/server/utils/auth'

interface UpdateProfileRequestBody {
  name?: string
  username?: string
  bio?: string
  avatar?: string
  privacy?: {
    showEmail?: boolean
    showActivity?: boolean
  }
}

export default defineEventHandler(async (event: H3Event) => {
  // Get authenticated user
  const user = await requireUser(event)
  
  const body = await readBody(event) as UpdateProfileRequestBody
  
  // Validate username if provided
  if (body.username) {
    const users = await getStoredUsers()
    const existingUser = users.find(u => u.username === body.username && u.id !== user.id)
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username already taken'
      })
    }
  }
  
  // Update user profile
  if (body.name) user.name = body.name
  if (body.username) user.username = body.username
  if (body.bio !== undefined) user.profile.bio = body.bio
  if (body.avatar !== undefined) user.profile.avatar = body.avatar
  if (body.privacy) {
    if (body.privacy.showEmail !== undefined) user.profile.privacy.showEmail = body.privacy.showEmail
    if (body.privacy.showActivity !== undefined) user.profile.privacy.showActivity = body.privacy.showActivity
  }
  
  user.updatedAt = new Date().toISOString()
  
  // Save updated user
  await saveUsers(users)
  
  // Return updated profile (without sensitive data)
  const { password, ...userResponse } = user
  return userResponse
})
}

export default defineEventHandler(async (event: H3Event) => {
  // Get authenticated user
  const user = await requireUser(event)

  const body = (await readBody(event)) as UpdateProfileRequestBody

  // Validate username if provided
  if (body.username) {
    const users = await getStoredUsers()
    const existingUser = users.find(
      u => u.username === body.username && u.id !== user.id
    )
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username already taken',
      })
    }
  }

  // Update user profile
  if (body.name) user.name = body.name
  if (body.username) user.username = body.username
  if (body.bio !== undefined) user.profile.bio = body.bio
  if (body.avatar !== undefined) user.profile.avatar = body.avatar
  if (body.privacy) {
    if (body.privacy.showEmail !== undefined)
      user.profile.privacy.showEmail = body.privacy.showEmail
    if (body.privacy.showActivity !== undefined)
      user.profile.privacy.showActivity = body.privacy.showActivity
  }

  user.updatedAt = new Date().toISOString()

  // Save updated user
  await saveUsers(users)

  // Return updated profile (without sensitive data)
  const { password, ...userResponse } = user
  return userResponse
})

// Helper function to get authenticated user
async function requireUser(event: H3Event) {
  // In a real application, you would verify the JWT token here
  // For now, we'll implement a basic token verification
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header required',
    })
  }

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

async function saveUsers(users: any[]) {
  await useStorage().setItem('users.json', JSON.stringify(users))
}
