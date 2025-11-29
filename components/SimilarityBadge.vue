<template>
  <div
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClass"
  >
    <svg
      v-if="showIcon"
      xmlns="http://www.w3.org/2000/svg"
      class="-ml-0.5 mr-1 h-3 w-3"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
        clip-rule="evenodd"
      />
    </svg>
    {{ similarityText }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  score: number
  showIcon?: boolean
  showPercentage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  showPercentage: true,
})

const similarityText = computed(() => {
  if (props.showPercentage) {
    return `${Math.round(props.score * 100)}% similarity`
  }

  if (props.score >= 0.7) {
    return 'High similarity'
  } else if (props.score >= 0.5) {
    return 'Medium similarity'
  } else if (props.score >= 0.3) {
    return 'Low similarity'
  } else {
    return 'Minimal similarity'
  }
})

const badgeClass = computed(() => {
  if (props.score >= 0.7) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
  } else if (props.score >= 0.5) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
  } else if (props.score >= 0.3) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
  } else {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
  }
})
</script>
