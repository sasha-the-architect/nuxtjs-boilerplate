// middleware/auth.global.ts
import { verifyJWT } from '~/server/utils/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Define routes that require authentication
  const authRequiredPages = [
    '/user-dashboard',
    '/user-dashboard/',
    '/user-dashboard/profile',
    '/user-dashboard/settings',
    '/user-dashboard/activity',
    '/user-dashboard/admin',
  ]

  // Check if this route requires authentication
  const requiresAuth = authRequiredPages.some(route =>
    to.path.startsWith(route)
  )

  if (requiresAuth) {
    // Get token from cookie
    const token = useCookie('auth_token').value

    if (!token || !verifyJWT(token)) {
      // Redirect to login page
      return navigateTo('/login')
    }
  }
})
