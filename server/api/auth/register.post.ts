import { hash } from 'bcrypt'
import { randomUUID } from 'crypto'
import type { H3Event } from 'h3'

interface RegisterRequestBody {
  email: string
  password: string
  username: string
  name?: string
}

export default defineEventHandler(async (event: H3Event) => {
  // Rate limiting is handled by middleware
  const body = (await readBody(event)) as RegisterRequestBody

  // Validate input
  if (!body.email || !body.password || !body.username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email, password, and username are required',
    })
  }

  // Basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email format',
    })
  }

  if (body.password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters long',
    })
  }

  // Check if user already exists
  const users = await getStoredUsers()
  const existingUser = users.find(
    u => u.email === body.email || u.username === body.username
  )
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User with this email or username already exists',
    })
  }

  // Hash password
  const hashedPassword = await hash(body.password, 10)

  // Create new user
  const newUser = {
    id: randomUUID(),
    email: body.email,
    username: body.username,
    name: body.name || body.username,
    password: hashedPassword,
    role: 'user', // Default role
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    emailVerified: false,
    profile: {
      bio: '',
      avatar: '',
      joinDate: new Date().toISOString(),
      reputation: 0,
      contributions: {
        comments: 0,
        resources: 0,
        votes: 0,
      },
      privacy: {
        showEmail: false,
        showActivity: true,
      },
    },
  }

  // Save user
  users.push(newUser)
  await saveUsers(users)

  // Return success response (without password)
  const { password, ...userResponse } = newUser
  return {
    success: true,
    user: userResponse,
  }
})

// Helper functions to manage users
async function getStoredUsers() {
  // In a real application, you'd use a database
  // For now, we'll use a simple file-based storage
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
