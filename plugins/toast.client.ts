import { defineNuxtPlugin, useState } from '#app'
import ToastNotification from '~/components/ToastNotification.vue'
import type { Toast } from '~/components/ToastNotification.vue'

export interface ToastManager {
  toasts: (Omit<Toast, 'id'> & { id: string })[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export default defineNuxtPlugin(nuxtApp => {
  // Create a global toast state
  const toastState = useState<ToastManager>('global-toast', () => ({
    toasts: [],
    addToast: (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      toastState.value.toasts.push({ ...toast, id })
    },
    removeToast: (id: string) => {
      const index = toastState.value.toasts.findIndex(t => t.id === id)
      if (index !== -1) {
        toastState.value.toasts.splice(index, 1)
      }
    },
  }))

  // Register the ToastNotification component globally
  nuxtApp.vueApp.component('ToastNotification', ToastNotification)

  // Provide the toast functions globally
  return {
    provide: {
      toast: {
        success: (title: string, message?: string) => {
          toastState.value.addToast({
            title,
            message,
            type: 'success',
          })
        },
        error: (title: string, message?: string) => {
          toastState.value.addToast({
            title,
            message,
            type: 'error',
          })
        },
        warning: (title: string, message?: string) => {
          toastState.value.addToast({
            title,
            message,
            type: 'warning',
          })
        },
        info: (title: string, message?: string) => {
          toastState.value.addToast({
            title,
            message,
            type: 'info',
          })
        },
      },
    },
  }
})
