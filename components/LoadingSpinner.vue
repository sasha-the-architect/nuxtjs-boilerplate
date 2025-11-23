<template>
  <div
    class="loading-spinner"
    :class="{
      'loading-spinner--small': small,
      'loading-spinner--large': large,
    }"
  >
    <svg class="loading-spinner__svg" viewBox="0 0 50 50">
      <circle
        class="loading-spinner__path"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      />
    </svg>
    <span v-if="label" class="loading-spinner__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  small?: boolean
  large?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  small: false,
  large: false,
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #3b82f6; /* Tailwind blue-500 */
}

.loading-spinner--small {
  font-size: 0.75rem; /* Tailwind text-sm */
}

.loading-spinner--large {
  font-size: 1.25rem; /* Tailwind text-lg */
}

.loading-spinner__svg {
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
}

.loading-spinner--small .loading-spinner__svg {
  width: 1.5rem;
  height: 1.5rem;
}

.loading-spinner--large .loading-spinner__svg {
  width: 3rem;
  height: 3rem;
}

.loading-spinner__path {
  stroke-linecap: round;
  opacity: 0.25;
}

.loading-spinner__svg {
  transform-origin: center;
  transition: 0.15s ease;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.loading-spinner__label {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280; /* Tailwind gray-500 */
}
</style>
