import { readonly, ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'

export interface ValidationHistoryItem {
  isAccessible: boolean
  timestamp: string
  status?: number
  statusText?: string
  responseTime?: number
}

export interface HealthStatus {
  id: string
  url: string
  isHealthy: boolean
  lastChecked: string
  lastStatus: number | null
  lastStatusText: string | null
  responseTime: number | null
  error?: string
  validationHistory: ValidationHistoryItem[]
}

interface Props {
  resourceId?: string
  url?: string
}

export const useResourceHealth = (props: Props) => {
  const healthStatus = ref<HealthStatus | null>(null)
  const isChecking = ref(false)

  const loadHealthStatus = async () => {
    try {
      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.get<HealthStatus>(
        `/api/resource-health/${props.resourceId}`
      )
      if (response.success && response.data) {
        healthStatus.value = response.data
      }
    } catch {
      // Failed to load health status
    }
  }

  const triggerHealthCheck = async () => {
    isChecking.value = true
    try {
      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.post<{ healthStatus: HealthStatus }>(
        `/api/resources/${props.resourceId}/health`
      )
      if (response.success && response.data) {
        healthStatus.value = response.data.healthStatus
      }
    } catch {
      // Failed to trigger health check
    } finally {
      isChecking.value = false
    }
  }

  const healthClass = computed(() => {
    if (!healthStatus.value) return 'status-unknown'
    if (healthStatus.value.isHealthy) return 'status-healthy'
    if (healthStatus.value.lastStatus === null) return 'status-unknown'
    return 'status-unhealthy'
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  onMounted(async () => {
    await loadHealthStatus()
  })

  return {
    healthStatus: readonly(healthStatus),
    isChecking: readonly(isChecking),
    healthClass,
    formatDate,
    loadHealthStatus,
    triggerHealthCheck,
  }
}
