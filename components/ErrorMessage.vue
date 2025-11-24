<template>
  <div
    v-if="message"
    class="error-message"
    :class="`error-message--${variant}`"
    role="alert"
    :aria-live="variant === 'error' ? 'assertive' : 'polite'"
  >
    <div class="error-message__icon">
      <svg
        v-if="variant === 'error'"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else-if="variant === 'warning'"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else-if="variant === 'success'"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
    <div class="error-message__content">
      <p class="error-message__text">{{ message }}</p>
      <div v-if="action" class="error-message__action">
        <button
          type="button"
          class="error-message__action-button"
          :aria-label="action.label"
          @click="action.handler"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Action {
  label: string
  handler: () => void
}

interface Props {
  message?: string | null
  variant?: 'error' | 'warning' | 'success'
  action?: Action
}

withDefaults(defineProps<Props>(), {
  message: null,
  variant: 'error',
  action: undefined,
})
</script>

<style scoped>
.error-message {
  padding: 0.75rem;
  border-radius: 0.375rem;
  display: flex;
  gap: 0.5rem;
}

.error-message--error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.error-message--warning {
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.error-message--success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.error-message__icon {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
}

.error-message__content {
  flex: 1;
}

.error-message__text {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.error-message__action {
  margin-top: 0.25rem;
}

.error-message__action-button {
  font-size: 0.75rem;
  font-weight: 500;
  background-color: transparent;
  border: none;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}
</style>
