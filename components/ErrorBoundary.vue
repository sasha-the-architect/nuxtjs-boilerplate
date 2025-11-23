<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
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
        {{ error?.message || 'An unexpected error occurred' }}
      </p>
      <p v-if="showDetails" class="error-details">
        <small>Component: {{ componentStack }}</small>
      </p>
      <div class="error-actions">
        <button class="retry-button" :disabled="retrying" @click="handleRetry">
          <span v-if="retrying">Retrying...</span>
          <span v-else>Try Again</span>
        </button>
        <button class="home-button" @click="goHome">Go Home</button>
        <button
          v-if="error?.stack"
          class="details-button"
          @click="toggleDetails"
        >
          {{ showDetails ? 'Hide Details' : 'Show Details' }}
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useErrorHandling } from '~/composables/useErrorHandling'

interface ErrorInfo {
  componentStack: string
}

const { error, hasError, clearError } = useErrorHandling()
const componentStack = ref('')
const showDetails = ref(false)
const retrying = ref(false)

const emit = defineEmits<{
  error: [error: Error, info: ErrorInfo]
  retry: []
}>()

const throwError = (err: Error, info: ErrorInfo) => {
  error.value = err
  componentStack.value = info.componentStack
  emit('error', err, info)
}

const handleRetry = async () => {
  retrying.value = true
  try {
    clearError()
    // In some cases, we might want to emit a retry event to parent components
    emit('retry')
  } finally {
    retrying.value = false
  }
}

const goHome = () => {
  navigateTo('/')
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
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

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.error-details {
  color: #4b5563;
  margin-bottom: 1rem;
  font-size: 0.75rem;
  font-family: monospace;
  text-align: left;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.25rem;
  overflow: auto;
  max-height: 100px;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.retry-button,
.home-button,
.details-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.retry-button {
  background-color: #3b82f6;
  color: white;
}

.retry-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.retry-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.home-button {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.home-button:hover {
  background-color: #e5e7eb;
}

.details-button {
  background-color: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.details-button:hover {
  background-color: #d1d5db;
}
</style>
