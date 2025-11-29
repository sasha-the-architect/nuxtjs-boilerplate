import { compare } from 'bcrypt'
import type { H3Event } from 'h3'
import { generateJWT, getStoredUsers, saveUsers } from '~/server/utils/auth'

interface LoginRequestBody {
  email: string
  password: string
}

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as LoginRequestBody

  // Validate input
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  // Find user
  const users = await getStoredUsers()
  const user = users.find(u => u.email === body.email)

  if (!user) {
    // Don't reveal if user exists to prevent email enumeration
    await compare(body.password, '$2b$10$invalid') // Always run compare to prevent timing attacks
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // Check if user is active
  if (!user.isActive) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Account is deactivated',
    })
  }

  // Compare password
  const isPasswordValid = await compare(body.password, user.password)
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // Generate JWT token
  const token = generateJWT(user)

  // Update last login
  user.lastLoginAt = new Date().toISOString()
  user.updatedAt = new Date().toISOString()
  await saveUsers(users)

  // Return success response (without sensitive data)
  const { password, ...userResponse } = user
  return {
    success: true,
    token,
    user: userResponse,
  }
})

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as LoginRequestBody

  // Validate input
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  // Find user
  const users = await getStoredUsers()
  const user = users.find(u => u.email === body.email)

  if (!user) {
    // Don't reveal if user exists to prevent email enumeration
    await compare(body.password, '$2b$10$invalid') // Always run compare to prevent timing attacks
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // Check if user is active
  if (!user.isActive) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Account is deactivated',
    })
  }

  // Compare password
  const isPasswordValid = await compare(body.password, user.password)
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // Generate JWT token
  const token = generateJWT(user)

  // Update last login
  user.lastLoginAt = new Date().toISOString()
  user.updatedAt = new Date().toISOString()
  await saveUsers(users)

  // Return success response (without sensitive data)
  const { password, ...userResponse } = user
  return {
    success: true,
    token,
    user: userResponse,
  }
})

// JWT generation (simplified for this example)
function generateJWT(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }

  // In production, use a proper JWT library and secret from environment variables
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url')
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url')

  // Create a signature (in production, use a proper secret from environment)
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-dev'
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payloadStr}`)
    .digest('base64url')

  return `${header}.${payloadStr}.${signature}`
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
