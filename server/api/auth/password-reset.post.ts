import { hash } from 'bcrypt'
import { randomUUID } from 'crypto'
import type { H3Event } from 'h3'
import { getStoredUsers, saveUsers } from '~/server/utils/auth'

interface PasswordResetRequestBody {
  email: string
}

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as PasswordResetRequestBody

  // Validate input
  if (!body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required',
    })
  }

  // Find user
  const users = await getStoredUsers()
  const user = users.find(u => u.email === body.email)

  if (!user) {
    // Don't reveal if user exists to prevent email enumeration
    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent',
    }
  }

  // Generate reset token
  const resetToken = randomUUID()
  const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours from now

  // Update user with reset token
  user.resetToken = resetToken
  user.resetTokenExpiry = resetTokenExpiry.toISOString()
  user.updatedAt = new Date().toISOString()

  await saveUsers(users)

  // In a real application, you'd send an email here with the reset token
  // For this example, we'll just return the token (in a real scenario, never return this to client)
  console.log(`Password reset token for ${user.email}: ${resetToken}`)

  return {
    success: true,
    message:
      'If an account with that email exists, a password reset link has been sent',
  }
})
