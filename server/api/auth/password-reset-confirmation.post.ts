import { hash } from 'bcrypt'
import type { H3Event } from 'h3'
import { getStoredUsers, saveUsers } from '~/server/utils/auth'

interface PasswordResetConfirmationRequestBody {
  token: string
  newPassword: string
}

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as PasswordResetConfirmationRequestBody

  // Validate input
  if (!body.token || !body.newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token and new password are required',
    })
  }

  if (body.newPassword.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'New password must be at least 8 characters long',
    })
  }

  const users = await getStoredUsers()

  // Find user with the reset token
  const userIndex = users.findIndex(u => u.resetToken === body.token)

  if (userIndex === -1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired reset token',
    })
  }

  const user = users[userIndex]

  // Check if token is expired
  const tokenExpiry = new Date(user.resetTokenExpiry)
  if (tokenExpiry < new Date()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Reset token has expired',
    })
  }

  // Hash new password
  const hashedPassword = await hash(body.newPassword, 10)

  // Update user with new password and clear reset token
  user.password = hashedPassword
  delete user.resetToken
  delete user.resetTokenExpiry
  user.updatedAt = new Date().toISOString()

  await saveUsers(users)

  return {
    success: true,
    message: 'Password has been reset successfully',
  }
})
