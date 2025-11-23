<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div" class="toast-wrapper">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        role="alert"
        aria-live="polite"
      >
        <div class="toast__icon">
          <svg
            v-if="toast.type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="toast.type === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="toast.type === 'warning'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="toast__content">
          <p class="toast__title">{{ toast.title }}</p>
          <p v-if="toast.message" class="toast__message">{{ toast.message }}</p>
        </div>
        <button
          class="toast__close"
          aria-label="Close notification"
          @click="removeToast(toast.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface Toast {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const toasts = ref<Toast[]>([])

// Add a new toast
const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast = {
    id,
    ...toast,
    duration: toast.duration || 5000, // Default to 5 seconds
  }

  toasts.value.push(newToast)

  // Auto remove toast after duration
  if (newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }
}

// Remove a toast by ID
const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose the addToast function to parent components
defineExpose({ addToast })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  max-width: 320px;
}

.toast-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: white;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-left-width: 4px;
  border-left-color: #3b82f6; /* Tailwind blue-500 */
  min-width: 280px;
  max-width: 100%;
}

.toast--success {
  border-left-color: #10b981; /* Tailwind green-500 */
}

.toast--error {
  border-left-color: #ef4444; /* Tailwind red-500 */
}

.toast--warning {
  border-left-color: #f59e0b; /* Tailwind yellow-500 */
}

.toast__icon {
  margin-right: 0.5rem;
  color: #374151; /* Tailwind gray-600 */
  flex-shrink: 0;
}

.toast--success .toast__icon {
  color: #10b981; /* Tailwind green-500 */
}

.toast--error .toast__icon {
  color: #ef4444; /* Tailwind red-500 */
}

.toast--warning .toast__icon {
  color: #f59e0b; /* Tailwind yellow-500 */
}

.toast__content {
  flex: 1;
}

.toast__title {
  font-weight: 500;
  color: #111827; /* Tailwind gray-900 */
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.toast__message {
  color: #6b7280; /* Tailwind gray-500 */
  font-size: 0.75rem;
  line-height: 1rem;
  margin-top: 0.125rem;
}

.toast__close {
  margin-left: 0.5rem;
  color: #9ca3af; /* Tailwind gray-400 */
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.125rem;
  transition: color 0.2s;
}

.toast__close:hover {
  color: #6b7280; /* Tailwind gray-500 */
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
