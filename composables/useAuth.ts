import { ref, computed } from 'vue'
import type { UserSession } from '../types/auth'

interface AuthState {
  user: UserSession | null
  loading: boolean
  error: string | null
}

const authState = ref<AuthState>({
  user: null,
  loading: true,
  error: null,
})

export const useAuth = () => {
  const initializeAuth = async () => {
    authState.value.loading = true
    authState.value.error = null

    try {
      const response: { user?: UserSession; error?: string } =
        await $fetch('/api/auth/user')
      if (response && response.user) {
        authState.value.user = response.user
      } else {
        authState.value.user = null
      }
    } catch (error: any) {
      authState.value.error =
        error.data?.message || error.message || 'Authentication error'
      authState.value.user = null
    } finally {
      authState.value.loading = false
    }
  }

  const login = async () => {
    // Store current path to return after login
    const currentPath = window.location.pathname
    if (currentPath !== '/' && currentPath !== '/auth/login') {
      sessionStorage.setItem('returnTo', currentPath)
    }

    // Redirect to GitHub OAuth
    window.location.href = '/api/auth/github'
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      authState.value.user = null

      // Refresh the page to update UI
      window.location.reload()
    } catch (error: any) {
      authState.value.error =
        error.data?.message || error.message || 'Logout error'
    }
  }

  const setUserReturnTo = (path: string) => {
    sessionStorage.setItem('returnTo', path)
  }

  const getReturnTo = (): string => {
    return sessionStorage.getItem('returnTo') || '/'
  }

  const clearReturnTo = () => {
    sessionStorage.removeItem('returnTo')
  }

  return {
    user: computed(() => authState.value.user),
    loading: computed(() => authState.value.loading),
    error: computed(() => authState.value.error),
    isAuthenticated: computed(() => !!authState.value.user),
    initializeAuth,
    login,
    logout,
    setUserReturnTo,
    getReturnTo,
    clearReturnTo,
  }
}
