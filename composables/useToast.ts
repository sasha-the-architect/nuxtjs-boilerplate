import { ref, reactive } from 'vue'

interface ToastOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface Toast {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

interface ToastComposable {
  toasts: Toast[]
  show: (options: ToastOptions) => string
  hide: (id: string) => void
  clear: () => void
  success: (title: string, message: string, duration?: number) => string
  error: (title: string, message: string, duration?: number) => string
  warning: (title: string, message: string, duration?: number) => string
  info: (title: string, message: string, duration?: number) => string
}

let toastIdCounter = 0

export const useToast = (): ToastComposable => {
  const toasts = ref<Toast[]>([])

  const show = (options: ToastOptions): string => {
    const id = `toast-${++toastIdCounter}`
    const toast: Toast = {
      id,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration ?? 5000,
    }

    toasts.value.push(toast)

    // Auto-remove toast after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        hide(id)
      }, toast.duration)
    }

    return id
  }

  const hide = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value = []
  }

  const success = (title: string, message: string, duration?: number) => {
    return show({ title, message, type: 'success', duration })
  }

  const error = (title: string, message: string, duration?: number) => {
    return show({ title, message, type: 'error', duration })
  }

  const warning = (title: string, message: string, duration?: number) => {
    return show({ title, message, type: 'warning', duration })
  }

  const info = (title: string, message: string, duration?: number) => {
    return show({ title, message, type: 'info', duration })
  }

  return {
    toasts: toasts.value,
    show,
    hide,
    clear,
    success,
    error,
    warning,
    info,
  }
}
