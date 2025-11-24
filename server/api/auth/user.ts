import { defineEventHandler } from 'h3'
import { getSession } from '../../utils/session'

interface ServerUserSession {
  id: number
  githubId: number
  login: string
  name: string
  email: string
  avatar: string
  access_token: string
  createdAt: string
}

export default defineEventHandler(async event => {
  const session = event.context.session || (await getSession(event))

  if (!session.user) {
    // Return 401 if not authenticated
    event.node.res.statusCode = 401
    return { error: 'Not authenticated' }
  }

  // Return user info without sensitive data like access_token
  const { access_token, ...userInfo } = session.user

  return {
    user: userInfo,
  }
})
