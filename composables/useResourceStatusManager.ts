import { ref } from 'vue'
import { useNuxtApp } from '#app'

export interface UpdateStatusResponse {
  success: boolean
  resource?: {
    id: string
    status: string
    reason?: string
    notes?: string
  }
}

export interface UpdateStatusError {
  success: false
  error: string
}

export interface StatusUpdateOptions {
  resourceId: string
  status: string
  reason?: string
  notes?: string
}

export function useResourceStatusManager(initialStatus: string = 'active') {
  const selectedStatus = ref(initialStatus)
  const reason = ref('')
  const notes = ref('')
  const isUpdating = ref(false)
  const lastUpdate = ref<{ success: boolean; error?: string } | null>(null)

  const updateStatus = async (resourceId: string) => {
    if (!selectedStatus.value) return false

    isUpdating.value = true
    lastUpdate.value = null

    try {
      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.put<UpdateStatusResponse>(
        `/api/resources/${resourceId}/status`,
        {
          status: selectedStatus.value,
          reason: reason.value,
          notes: notes.value,
        }
      )

      if (response.success) {
        lastUpdate.value = { success: true }
        return response.data?.resource || null
      } else {
        lastUpdate.value = {
          success: false,
          error: response.error?.message || 'Failed to update status',
        }
        return null
      }
    } catch (error: { message?: string }) {
      lastUpdate.value = {
        success: false,
        error: error.message || 'Unknown error',
      }
      return null
    } finally {
      isUpdating.value = false
    }
  }

  const resetForm = () => {
    reason.value = ''
    notes.value = ''
    lastUpdate.value = null
  }

  return {
    selectedStatus,
    reason,
    notes,
    isUpdating,
    lastUpdate,
    updateStatus,
    resetForm,
  }
}
