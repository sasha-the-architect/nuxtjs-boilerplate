<template>
  <div
    :class="[
      'animate-pulse',
      'bg-gray-200',
      size === 'small'
        ? 'h-4'
        : size === 'medium'
          ? 'h-6'
          : size === 'large'
            ? 'h-8'
            : 'h-4',
      widthClass,
      'rounded',
      rounded ? 'rounded-full' : '',
    ]"
    :style="{ width: customWidth ? customWidth : undefined }"
  />
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  width?: 'full' | 'half' | 'quarter' | 'auto'
  customWidth?: string
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  width: 'auto',
  customWidth: undefined,
  rounded: false,
})

const widthClass = computed(() => {
  if (props.customWidth) return ''
  switch (props.width) {
    case 'full':
      return 'w-full'
    case 'half':
      return 'w-1/2'
    case 'quarter':
      return 'w-1/4'
    default:
      return ''
  }
})
</script>
