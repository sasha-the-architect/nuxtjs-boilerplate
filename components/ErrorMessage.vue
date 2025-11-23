<template>
  <div class="error-message" :class="`error-message--${type}`">
    <div class="error-message__icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
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
    <div class="error-message__content">
      <p class="error-message__text">{{ message }}</p>
      <div v-if="showRetry" class="error-message__actions">
        <button class="error-message__retry-btn" @click="handleRetry">
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  message: string
  type?: 'error' | 'warning' | 'info'
  showRetry?: boolean
  showRetryProp?: boolean // This is for the hyphenated version
}

interface Emits {
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
  showRetry: undefined,
  showRetryProp: undefined,
})

// Use either showRetry or show-retry (hyphenated version)
const showRetry = computed(
  () => props.showRetry ?? props.showRetryProp ?? false
)

const emit = defineEmits<Emits>()

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: #fef2f2; /* Tailwind red-50 */
  border: 1px solid #fecaca; /* Tailwind red-200 */
}

.error-message--warning {
  background-color: #fffbeb; /* Tailwind yellow-50 */
  border-color: #fbbf24; /* Tailwind yellow-300 */
}

.error-message--info {
  background-color: #eff6ff; /* Tailwind blue-50 */
  border-color: #93c5fd; /* Tailwind blue-300 */
}

.error-message__icon {
  margin-right: 0.5rem;
  color: #dc2626; /* Tailwind red-600 */
  flex-shrink: 0;
}

.error-message--warning .error-message__icon {
  color: #d97706; /* Tailwind yellow-600 */
}

.error-message--info .error-message__icon {
  color: #2563eb; /* Tailwind blue-600 */
}

.error-message__content {
  flex: 1;
}

.error-message__text {
  color: #dc2626; /* Tailwind red-600 */
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.error-message--warning .error-message__text {
  color: #d97706; /* Tailwind yellow-600 */
}

.error-message--info .error-message__text {
  color: #2563eb; /* Tailwind blue-600 */
}

.error-message__actions {
  margin-top: 0.5rem;
}

.error-message__retry-btn {
  background-color: #dc2626; /* Tailwind red-600 */
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.error-message__retry-btn:hover {
  background-color: #b91c1c; /* Tailwind red-700 */
}

.error-message--warning .error-message__retry-btn {
  background-color: #d97706; /* Tailwind yellow-600 */
}

.error-message--warning .error-message__retry-btn:hover {
  background-color: #b45309; /* Tailwind yellow-700 */
}

.error-message--info .error-message__retry-btn {
  background-color: #2563eb; /* Tailwind blue-600 */
}

.error-message--info .error-message__retry-btn:hover {
  background-color: #1d4ed8; /* Tailwind blue-700 */
}
</style>
