<template>
  <div
    v-if="isOffline"
    class="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-300 p-2 z-50"
  >
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-yellow-600 mr-2"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="text-yellow-800 text-sm font-medium"
        >You are offline. Some features may be limited.</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const isOffline = ref(false)

// Check initial connection status
if (process.client) {
  isOffline.value = !navigator.onLine

  // Listen for online/offline events
  const handleOnline = () => {
    isOffline.value = false
  }

  const handleOffline = () => {
    isOffline.value = true
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Cleanup event listeners on component unmount
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })
}
</script>
