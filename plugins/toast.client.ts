import { defineNuxtPlugin, useState } from '#app'
import ToastNotification, {
  type ToastType,
} from '~/components/ToastNotification.vue'

export default defineNuxtPlugin(nuxtApp => {
  // Create a global toast state
  const toastState = useState('toast', () => ({
    toasts: [] as Array<{
      id: string
      type: ToastType
      message: string
      description?: string
    }>,
  }))

  // Create a global toast method
  nuxtApp.provide('toast', {
    addToast: (
      type: ToastType,
      message: string,
      description?: string,
      duration?: number
    ) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { id, type, message, description, duration }

      toastState.value.toasts.push(newToast)

      // Auto remove toast after duration
      const toastDuration = duration || (type === 'error' ? 10000 : 5000)
      if (toastDuration > 0) {
        setTimeout(() => {
          toastState.value.toasts = toastState.value.toasts.filter(
            t => t.id !== id
          )
        }, toastDuration)
      }
    },
    removeToast: (id: string) => {
      toastState.value.toasts = toastState.value.toasts.filter(t => t.id !== id)
    },
    success: (message: string, description?: string) => {
      nuxtApp.$toast.addToast('success', message, description)
    },
    error: (message: string, description?: string) => {
      nuxtApp.$toast.addToast('error', message, description)
    },
    warning: (message: string, description?: string) => {
      nuxtApp.$toast.addToast('warning', message, description)
    },
    info: (message: string, description?: string) => {
      nuxtApp.$toast.addToast('info', message, description)
    },
  })
})
