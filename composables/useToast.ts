export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

export const useToast = () => {
  const showToast = (type: ToastType, message: string, duration = 5000) => {
    const id = ++toastId
    const toast: Toast = { id, type, message, duration }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => showToast('success', message, duration)
  const error = (message: string, duration?: number) => showToast('error', message, duration)
  const warning = (message: string, duration?: number) => showToast('warning', message, duration)
  const info = (message: string, duration?: number) => showToast('info', message, duration)

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
