<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">
        {{ error.message || 'An unexpected error occurred' }}
      </p>
      <details
        v-if="process.dev && error.stack"
        class="text-xs text-left text-gray-500 bg-gray-100 p-3 rounded mt-2"
      >
        <summary class="cursor-pointer">Show Error Details</summary>
        <pre class="mt-2 overflow-x-auto">{{ error.stack }}</pre>
      </details>
      <div class="error-actions">
        <button :disabled="retrying" class="retry-button" @click="handleRetry">
          <span v-if="retrying">Retrying...</span>
          <span v-else>Try Again</span>
        </button>
        <button class="home-button" @click="goHome">Go Home</button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { navigateTo } from '#app'
import { logError } from '~/utils/errorLogger'

interface ErrorInfo {
  componentStack: string
}

const error = ref<Error | null>(null)
const retrying = ref(false)

const emit = defineEmits<{
  error: [error: Error, info: ErrorInfo]
}>()

const throwError = (err: Error, info: ErrorInfo) => {
  error.value = err
  logError(`ErrorBoundary caught error: ${err.message}`, err, 'ErrorBoundary')
  emit('error', err, info)
}

const resetError = () => {
  error.value = null
  retrying.value = false
}

const handleRetry = async () => {
  retrying.value = true
  try {
    // Reset the error and allow re-rendering
    resetError()
    // We can't directly re-render the component that threw the error,
    // so we'll just reset the error boundary state and let Vue re-render
  } finally {
    retrying.value = false
  }
}

const goHome = () => {
  navigateTo('/')
}

onErrorCaptured((err, instance, info) => {
  throwError(err, { componentStack: info })
  return false // Prevent the error from propagating further
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 1rem;
}
</style>
