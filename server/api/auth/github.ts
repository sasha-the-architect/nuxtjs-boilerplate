import { defineEventHandler, sendRedirect, getQuery } from 'h3'
import { randomBytes } from 'node:crypto'
import { getSession, setSession } from '../../utils/session'

export default defineEventHandler(async event => {
  const config = event.context.runtimeConfig || process.env
  const GITHUB_CLIENT_ID = (config as any).githubClientId
  const GITHUB_CLIENT_SECRET = (config as any).githubClientSecret
  const BASE_URL =
    (config as any).public?.canonicalUrl || 'http://localhost:3000'

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('GitHub OAuth environment variables are not set')
  }

  const query = getQuery(event)
  const code = query.code as string | undefined
  const state = query.state as string | undefined

  // If we have a code, we're in the callback phase
  if (code) {
    try {
      const currentSession = event.context.session || (await getSession(event))

      // Verify the state parameter to prevent CSRF
      if (!state || state !== currentSession.githubState) {
        throw new Error('Invalid state parameter')
      }

      // Exchange the authorization code for an access token
      const tokenResponse = await $fetch<{ access_token: string }>(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            state,
            redirect_uri: `${BASE_URL}/api/auth/github`,
          },
        }
      )

      if (!tokenResponse?.access_token) {
        throw new Error('Failed to get access token from GitHub')
      }

      // Get user information using the access token
      const userResponse = await $fetch<{
        id: number
        login: string
        name: string
        email: string
        avatar_url: string
      }>('https://api.github.com/user', {
        headers: {
          Authorization: `token ${tokenResponse.access_token}`,
          'User-Agent': 'Nuxt-App',
        },
      })

      if (!userResponse?.id) {
        throw new Error('Failed to get user information from GitHub')
      }

      // Get user email if not included in basic profile
      let userEmail = userResponse.email
      if (!userEmail) {
        try {
          const emails = await $fetch<
            { email: string; primary: boolean; verified: boolean }[]
          >('https://api.github.com/user/emails', {
            headers: {
              Authorization: `token ${tokenResponse.access_token}`,
              'User-Agent': 'Nuxt-App',
            },
          })
          const primaryEmail = emails.find(
            email => email.primary && email.verified
          )
          userEmail = primaryEmail?.email || ''
        } catch (emailError) {
          // Silently handle email fetching failure
          userEmail = ''
        }
      }

      // Create user session
      const userSession = {
        id: userResponse.id,
        githubId: userResponse.id,
        login: userResponse.login,
        name: userResponse.name || userResponse.login,
        email: userEmail,
        avatar: userResponse.avatar_url,
        access_token: tokenResponse.access_token,
        createdAt: new Date().toISOString(),
      }

      // Store user session
      await setSession(event, {
        user: userSession,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })

      // Redirect to home page or return success based on the request type
      const redirectUrl = currentSession.returnTo || '/'
      await sendRedirect(event, redirectUrl)
    } catch (error) {
      // Log error appropriately in a production environment
      await sendRedirect(event, '/auth/login?error=oauth_failed')
    }
  } else {
    // This is the initial request - redirect to GitHub OAuth
    const currentSession = event.context.session || (await getSession(event))
    const githubState = randomBytes(32).toString('hex')

    // Store state in session to prevent CSRF
    await setSession(event, {
      ...currentSession,
      githubState,
      returnTo: event.node.req.headers.referer || '/',
    })

    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
    githubAuthUrl.searchParams.append('client_id', GITHUB_CLIENT_ID!)
    githubAuthUrl.searchParams.append(
      'redirect_uri',
      `${BASE_URL}/api/auth/github`
    )
    githubAuthUrl.searchParams.append('scope', 'user:email') // Request basic user info including email
    githubAuthUrl.searchParams.append('state', githubState)

    await sendRedirect(event, githubAuthUrl.toString())
  }
})
