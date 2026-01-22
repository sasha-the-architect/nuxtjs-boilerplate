import { ref, readonly } from 'vue'
import { useNuxtApp } from '#app'
import { logError } from '~/utils/errorLogger'
import logger from '~/utils/logger'

interface FormData {
  title: string
  description: string
  url: string
  category: string
  tags: string[]
}

interface FormErrors {
  title?: string
  description?: string
  url?: string
  category?: string
}

export const useSubmitPage = () => {
  const formData = ref<FormData>({
    title: '',
    description: '',
    url: '',
    category: '',
    tags: [],
  })

  const tagsInput = ref('')
  const errors = ref<FormErrors>({})
  const isSubmitting = ref(false)
  const submitSuccess = ref(false)
  const submitError = ref('')

  const validateForm = (): boolean => {
    errors.value = {}

    if (!formData.value.title.trim()) {
      errors.value.title = 'Title is required'
    } else if (formData.value.title.length > 200) {
      errors.value.title = 'Title is too long (max 200 characters)'
    }

    if (!formData.value.description.trim()) {
      errors.value.description = 'Description is required'
    } else if (formData.value.description.length < 10) {
      errors.value.description = 'Description must be at least 10 characters'
    } else if (formData.value.description.length > 1000) {
      errors.value.description = 'Description is too long (max 1000 characters)'
    }

    if (!formData.value.url.trim()) {
      errors.value.url = 'URL is required'
    } else {
      try {
        new URL(formData.value.url)
      } catch {
        errors.value.url = 'Please enter a valid URL'
      }
    }

    if (!formData.value.category) {
      errors.value.category = 'Category is required'
    }

    if (Object.keys(errors.value).length > 0) {
      announceErrors()
    }

    return Object.keys(errors.value).length === 0
  }

  const announceErrors = () => {
    const errorList = Object.values(errors.value).join('. ')
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'alert')
    announcement.setAttribute('aria-live', 'assertive')
    announcement.className = 'sr-only'
    announcement.textContent = `Form validation failed: ${errorList}`

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 5000)
  }

  const processTags = (tagsString: string): string[] => {
    if (!tagsString.trim()) {
      return []
    }
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  }

  const submitResource = async () => {
    if (!validateForm()) {
      return
    }

    formData.value.tags = processTags(tagsInput.value)

    isSubmitting.value = true
    submitError.value = ''
    submitSuccess.value = false

    try {
      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.post('/api/submissions', {
        title: formData.value.title.trim(),
        description: formData.value.description.trim(),
        url: formData.value.url.trim(),
        category: formData.value.category,
        tags: formData.value.tags,
      })

      if (response.success) {
        formData.value.title = ''
        formData.value.description = ''
        formData.value.url = ''
        formData.value.category = ''
        formData.value.tags = []
        tagsInput.value = ''
        submitSuccess.value = true

        setTimeout(() => {
          submitSuccess.value = false
        }, 5000)
      } else {
        const responseData = response.data as
          | { errors?: { field: string; message: string }[]; message?: string }
          | undefined
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          responseData.errors.forEach(
            (err: { field: string; message: string }) => {
              ;(errors.value as Record<string, string>)[err.field] = err.message
            }
          )
        }
        submitError.value =
          responseData?.message ||
          response.error?.message ||
          'An error occurred while submitting resource'
      }
    } catch (error: unknown) {
      const errorData = error as {
        data?: { message?: string }
        message?: string
      }
      submitError.value =
        errorData.data?.message ||
        errorData.message ||
        'An unexpected error occurred'
      logError(
        `Failed to submit resource: ${submitError.value}`,
        errorData.data instanceof Error
          ? errorData.data
          : errorData.message
            ? new Error(errorData.message)
            : undefined,
        'useSubmitPage',
        { formData: formData.value }
      )
      logger.error('Error submitting resource:', error)
    } finally {
      isSubmitting.value = false
    }
  }

  const resetForm = () => {
    formData.value.title = ''
    formData.value.description = ''
    formData.value.url = ''
    formData.value.category = ''
    formData.value.tags = []
    tagsInput.value = ''
    errors.value = {}
    submitError.value = ''
    submitSuccess.value = false
  }

  return {
    formData: readonly(formData),
    tagsInput: readonly(tagsInput),
    errors: readonly(errors),
    isSubmitting: readonly(isSubmitting),
    submitSuccess: readonly(submitSuccess),
    submitError: readonly(submitError),
    validateForm,
    submitResource,
    resetForm,
  }
}
