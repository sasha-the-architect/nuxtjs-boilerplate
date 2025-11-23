<template>
  <div
    v-if="isVisible"
    :class="[
      'fixed bottom-4 right-4 max-w-sm w-full p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50',
      'bg-white border-l-4',
      {
        'border-green-500': type === 'success',
        'border-red-500': type === 'error',
        'border-yellow-500': type === 'warning',
        'border-blue-500': type === 'info',
        'translate-x-0 opacity-100': isVisible,
        'translate-x-full opacity-0': !isVisible,
      },
    ]"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <!-- Success icon -->
        <svg
          v-if="type === 'success'"
          class="h-5 w-5 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>

        <!-- Error icon -->
        <svg
          v-else-if="type === 'error'"
          class="h-5 w-5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <!-- Warning icon -->
        <svg
          v-else-if="type === 'warning'"
          class="h-5 w-5 text-yellow-500"
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

        <!-- Info icon -->
        <svg
          v-else
          class="h-5 w-5 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3
          :class="[
            'text-sm font-medium',
            {
              'text-green-800': type === 'success',
              'text-red-800': type === 'error',
              'text-yellow-800': type === 'warning',
              'text-blue-800': type === 'info',
            },
          ]"
        >
          {{ title }}
        </h3>
        <div
          :class="[
            'mt-1 text-sm',
            {
              'text-green-700': type === 'success',
              'text-red-700': type === 'error',
              'text-yellow-700': type === 'warning',
              'text-blue-700': type === 'info',
            },
          ]"
        >
          <p>{{ message }}</p>
        </div>
      </div>
      <div class="ml-4 flex-shrink-0">
        <button
          type="button"
          class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
          @click="closeToast"
        >
          <span class="sr-only">Close</span>
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  visible?: boolean
}

interface Emits {
  (event: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000, // 5 seconds default
  visible: true,
})

const emit = defineEmits<Emits>()

const isVisible = ref(props.visible)

// Close toast after duration
let timeoutId: number | null = null

const startTimer = () => {
  if (props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      closeToast()
    }, props.duration)
  }
}

const closeToast = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  isVisible.value = false
  // Emit close event after animation completes
  setTimeout(() => {
    emit('close')
  }, 300)
}

// Watch for changes to visible prop
watch(
  () => props.visible,
  newVisible => {
    isVisible.value = newVisible
    if (newVisible) {
      startTimer()
    }
  }
)

// Start the timer when component is mounted
onMounted(() => {
  startTimer()
})

// Clean up timeout on unmount
onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>
