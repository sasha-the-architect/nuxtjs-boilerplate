<template>
  <div v-if="error" class="error-message-container">
    <div class="error-content">
      <div class="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-red-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="error-text">
        <p class="error-message">{{ error.message }}</p>
        <p v-if="showTimestamp" class="error-timestamp text-xs text-gray-500">
          {{ formatTimestamp(error.timestamp) }}
        </p>
      </div>
      <div v-if="showRetry" class="error-actions">
        <button type="button" class="retry-button" @click="handleRetry">
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLoading, type ErrorInfo } from '~/composables/useLoading'

interface Props {
  error?: ErrorInfo | null
  showRetry?: boolean
  showTimestamp?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  error: undefined,
  showRetry: false,
  showTimestamp: true,
})

const emit = defineEmits<{
  retry: []
}>()

const formatTimestamp = (date: Date) => {
  return date.toLocaleTimeString()
}

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.error-message-container {
  @apply bg-red-50 border border-red-200 rounded-md p-4 my-3;
}

.error-content {
  @apply flex items-start;
}

.error-icon {
  @apply flex-shrink-0 mr-3;
}

.error-text {
  @apply flex-1 min-w-0;
}

.error-message {
  @apply text-red-800 text-sm font-medium;
}

.error-timestamp {
  @apply mt-1;
}

.error-actions {
  @apply ml-3 flex-shrink-0;
}

.retry-button {
  @apply inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500;
}
</style>
