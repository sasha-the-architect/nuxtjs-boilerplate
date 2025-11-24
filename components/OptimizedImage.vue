<template>
  <NuxtImg
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :format="format"
    :loading="loading"
    :sizes="sizes"
    :quality="quality"
    :class="imgClass"
    :provider="provider"
    @error="handleError"
    @load="handleLoad"
  />
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'gif'
  loading?: 'lazy' | 'eager'
  sizes?: string
  quality?: number | string
  imgClass?: string
  provider?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: undefined,
  height: undefined,
  format: 'webp',
  loading: 'lazy',
  sizes: '100vw',
  quality: 80,
  imgClass: '',
  provider: 'ipx',
})

// Emit events for handling load and error states
const emit = defineEmits<{
  load: []
  error: [event: string | Event]
}>()

const handleError = (event: string | Event) => {
  emit('error', event)
}

const handleLoad = () => {
  emit('load')
}
</script>
