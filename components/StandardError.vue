<template>
  <div class="standard-error">
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
      <h2 class="error-title">{{ title }}</h2>
      <p class="error-message">{{ message }}</p>
      <div class="error-actions">
        <button v-if="showRetry" class="retry-button" @click="handleRetry">
          {{ retryText }}
        </button>
        <button v-if="showHome" class="home-button" @click="goHome">
          {{ homeText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  showRetry?: boolean
  showHome?: boolean
  retryText?: string
  homeText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Something went wrong',
  message: 'An unexpected error occurred',
  showRetry: true,
  showHome: true,
  retryText: 'Try Again',
  homeText: 'Go Home',
})

const emit = defineEmits<{
  retry: []
  home: []
}>()

const handleRetry = () => {
  emit('retry')
}

const goHome = () => {
  emit('home')
}
</script>

<style scoped>
.standard-error {
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

.error-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.retry-button,
.home-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button {
  background-color: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.retry-button:hover {
  background-color: #2563eb;
}

.home-button {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.home-button:hover {
  background-color: #e5e7eb;
}
</style>
