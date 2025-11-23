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
        {{ errorMessage }}
      </p>
      <div v-if="showDetails" class="error-details">
        <details class="mt-2 text-xs text-gray-500">
          <summary class="cursor-pointer">Error Details</summary>
          <pre class="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">{{
            error.stack
          }}</pre>
        </details>
      </div>
      <div class="error-actions">
        <button class="retry-button" @click="resetError" :disabled="loading">
          <span v-if="loading" class="flex items-center">
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Retrying...
          </span>
          <span v-else>Try Again</span>
        </button>
        <button class="home-button" @click="goHome">Go Home</button>
        <button
          v-if="error"
          class="details-button"
          @click="toggleDetails"
          :aria-expanded="showDetails"
        >
          {{ showDetails ? 'Hide Details' : 'Show Details' }}
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import { useLoading } from '~/composables/useLoading'

interface ErrorInfo {
  componentStack: string
}

interface Props {
  showDetailsByDefault?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetailsByDefault: false,
})

const error = ref<Error | null>(null)
const showDetails = ref(props.showDetailsByDefault)

const { loading, withLoading } = useLoading()

const emit = defineEmits<{
  error: [error: Error, info: ErrorInfo]
  reset: []
}>()

// Improved error message handling
const errorMessage = computed(() => {
  if (!error.value) return 'An unexpected error occurred'

  // Provide more user-friendly messages based on common error types
  if (error.value.message.includes('Failed to fetch')) {
    return 'Failed to load data. Please check your internet connection and try again.'
  }
  if (error.value.message.includes('Network Error')) {
    return 'Network error. Please check your internet connection.'
  }

  return error.value.message || 'An unexpected error occurred'
})

const throwError = (err: Error, info: ErrorInfo) => {
  error.value = err
  emit('error', err, info)
}

const resetError = async () => {
  await withLoading(async () => {
    error.value = null
    showDetails.value = props.showDetailsByDefault
    emit('reset')
  })
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
  margin: 1rem 0;
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
  border: 1px solid #3b82f6;
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
  background-color: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.details-button:hover {
  background-color: #f3f4f6;
}
</style>
