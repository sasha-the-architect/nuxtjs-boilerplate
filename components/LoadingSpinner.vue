<template>
  <div
    class="loading-spinner"
    :class="{
      'loading-spinner--small': size === 'small',
      'loading-spinner--large': size === 'large',
    }"
  >
    <svg class="loading-spinner__circular" viewBox="25 25 50 50">
      <circle
        class="loading-spinner__path"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke-width="2"
        stroke-miterlimit="10"
      />
    </svg>
    <span v-if="label" class="loading-spinner__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  size: 'medium',
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-spinner--small .loading-spinner__circular {
  width: 1rem;
  height: 1rem;
}

.loading-spinner .loading-spinner__circular {
  width: 1.5rem;
  height: 1.5rem;
}

.loading-spinner--large .loading-spinner__circular {
  width: 3rem;
  height: 3rem;
}

.loading-spinner__circular {
  animation: rotate 2s linear infinite;
}

.loading-spinner__path {
  stroke: currentColor;
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.loading-spinner__label {
  font-size: 0.875rem;
  color: #6b7280;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}
</style>
