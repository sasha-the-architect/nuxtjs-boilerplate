<template>
  <div v-if="auth.loading.value" class="flex items-center">
    <span>Loading...</span>
  </div>
  <div
    v-else-if="auth.isAuthenticated.value"
    class="flex items-center space-x-3"
  >
    <img
      :src="auth.user.value?.avatar || '/favicon.ico'"
      :alt="auth.user.value?.name || 'User avatar'"
      class="w-8 h-8 rounded-full"
      width="32"
      height="32"
    />
    <span class="hidden md:inline text-sm font-medium text-gray-700">
      {{ auth.user.value?.name || auth.user.value?.login }}
    </span>
    <button
      class="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
      @click="handleLogout"
    >
      Logout
    </button>
  </div>
  <button
    v-else
    class="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
    @click="handleLogin"
  >
    Login
  </button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

const auth = useAuth()

onMounted(() => {
  auth.initializeAuth()
})

const handleLogin = () => {
  auth.login()
}

const handleLogout = () => {
  auth.logout()
}
</script>
