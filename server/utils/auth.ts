import type { H3Event } from 'h3'
import { createHmac } from 'crypto'

// JWT verification and generation utilities
export function verifyJWT(token: string): boolean {
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

    // Verify the signature (in a real application, use a proper JWT library)
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-dev'
    const expectedSignature = createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url')

    return expectedSignature === signature
  } catch {
    return false
  }
}

export function decodeJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const payloadStr = Buffer.from(payload, 'base64url').toString()
    return JSON.parse(payloadStr)
  } catch {
    return null
  }
}

export function generateJWT(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }

  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url')
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url')

  // Create a signature
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-dev'
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payloadStr}`)
    .digest('base64url')

  return `${header}.${payloadStr}.${signature}`
}

export async function requireUser(event: H3Event) {
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header required',
    })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  // Verify token
  if (!verifyJWT(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }

  const decoded = decodeJWT(token)
  if (!decoded) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    })
  }

  const userId = decoded.id
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

// Helper functions to manage users
export async function getStoredUsers() {
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

export async function saveUsers(users: any[]) {
  await useStorage().setItem('users.json', JSON.stringify(users))
}

// Role-based access control
export async function requireRole(event: H3Event, requiredRole: string) {
  const user = await requireUser(event)

  // In this implementation, we have 'user', 'moderator', 'admin' roles
  const roleHierarchy = {
    user: 1,
    moderator: 2,
    admin: 3,
  }

  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0

  if (userLevel < requiredLevel) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions',
    })
  }

  return user
}
