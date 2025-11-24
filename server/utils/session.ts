import { H3Event } from 'h3'
import { parse, serialize } from 'cookie'
import { createHmac } from 'node:crypto'

export interface UserSession {
  id: number
  githubId: number
  login: string
  name: string
  email: string
  avatar: string
  access_token: string
  createdAt: string
  expiresAt: string
}

export interface SessionData {
  user?: UserSession
  githubState?: string
  returnTo?: string
}

// Simple session management using signed cookies
const SESSION_COOKIE_NAME = 'nuxt_auth_session'

// Sign data to prevent tampering
function sign(data: string, secret: string): string {
  const signature = createHmac('sha256', secret).update(data).digest('hex')
  return `${data}.${signature}`
}

// Verify signature and return data if valid
function unsign(signedData: string, secret: string): string | false {
  const lastDotIndex = signedData.lastIndexOf('.')
  if (lastDotIndex === -1) return false

  const data = signedData.slice(0, lastDotIndex)
  const expectedSignature = signedData.slice(lastDotIndex + 1)

  const actualSignature = createHmac('sha256', secret)
    .update(data)
    .digest('hex')

  if (actualSignature !== expectedSignature) {
    return false
  }

  return data
}

export async function getSession(event: H3Event): Promise<SessionData> {
  const config = event.context.runtimeConfig || process.env
  const SESSION_SECRET =
    (config as any).sessionSecret || 'fallback_session_secret_for_dev'

  const cookies = parse(event.node.req.headers.cookie || '')
  const signedSessionData = cookies[SESSION_COOKIE_NAME]

  if (!signedSessionData) {
    return {}
  }

  const sessionData = unsign(signedSessionData, SESSION_SECRET)
  if (!sessionData) {
    return {}
  }

  try {
    return JSON.parse(sessionData)
  } catch {
    return {}
  }
}

export async function setSession(event: H3Event, sessionData: SessionData) {
  const config = event.context.runtimeConfig || process.env
  const SESSION_SECRET =
    (config as any).sessionSecret || 'fallback_session_secret_for_dev'

  const sessionString = JSON.stringify(sessionData)
  const signedSessionData = sign(sessionString, SESSION_SECRET)

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: true as const,
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  }

  event.node.res.setHeader(
    'Set-Cookie',
    serialize(SESSION_COOKIE_NAME, signedSessionData, cookieOptions)
  )
}

export async function clearSession(event: H3Event) {
  event.node.res.setHeader(
    'Set-Cookie',
    serialize(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: true as const,
      maxAge: 0,
      path: '/',
    })
  )
}
