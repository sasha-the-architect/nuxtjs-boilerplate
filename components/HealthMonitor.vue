<template>
  <div class="health-monitor">
    <div class="monitor-header">
      <h3>Resource Health</h3>
      <button
        class="check-button"
        @click="triggerHealthCheck"
        :disabled="isChecking"
      >
        {{ isChecking ? 'Checking...' : 'Check Health' }}
      </button>
    </div>

    <div v-if="healthStatus" class="health-status">
      <div class="status-summary">
        <div class="status-item">
          <div class="status-icon" :class="healthClass">
            <span v-if="healthStatus.isHealthy">✓</span>
            <span v-else-if="healthStatus.lastStatus === null">?</span>
            <span v-else>✗</span>
          </div>
          <div class="status-details">
            <div class="status-text">
              <span class="status-label">Status:</span>
              <span :class="['status-value', healthClass]">
                {{
                  healthStatus.isHealthy
                    ? 'Healthy'
                    : healthStatus.lastStatus === null
                      ? 'Unknown'
                      : 'Unhealthy'
                }}
              </span>
            </div>
            <div class="status-info">
              <span class="info-label">Last checked:</span>
              <span class="info-value">{{
                formatDate(healthStatus.lastChecked)
              }}</span>
            </div>
            <div v-if="healthStatus.responseTime" class="status-info">
              <span class="info-label">Response time:</span>
              <span class="info-value">{{ healthStatus.responseTime }}ms</span>
            </div>
            <div v-if="healthStatus.error" class="status-error">
              <span class="error-label">Error:</span>
              <span class="error-value">{{ healthStatus.error }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="
          healthStatus.validationHistory &&
          healthStatus.validationHistory.length > 0
        "
        class="history-section"
      >
        <h4>Recent Checks</h4>
        <div class="history-list">
          <div
            v-for="(check, index) in healthStatus.validationHistory
              .slice()
              .reverse()"
            :key="index"
            class="history-item"
            :class="check.isAccessible ? 'history-success' : 'history-error'"
          >
            <div class="history-status">
              <span v-if="check.isAccessible" class="success-icon">✓</span>
              <span v-else class="error-icon">✗</span>
            </div>
            <div class="history-details">
              <div>{{ formatDate(check.timestamp) }}</div>
              <div class="history-info">
                <span v-if="check.status"
                  >{{ check.status }} {{ check.statusText }}</span
                >
                <span v-if="check.responseTime" class="response-time"
                  >({{ check.responseTime }}ms)</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-health-data">
      Health data not available for this resource.
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  resourceId: string
  url: string
}

interface HealthStatus {
  id: string
  url: string
  isHealthy: boolean
  lastChecked: string
  lastStatus: number | null
  lastStatusText: string | null
  responseTime: number | null
  error?: string
  validationHistory: any[]
}

const props = defineProps<Props>()
const healthStatus = ref<HealthStatus | null>(null)
const isChecking = ref(false)

// Load initial health status
onMounted(async () => {
  await loadHealthStatus()
})

const loadHealthStatus = async () => {
  try {
    const response = await $fetch(`/api/resource-health/${props.resourceId}`)
    if (response) {
      healthStatus.value = response
    }
  } catch (error) {
    // Failed to load health status
  }
}

const triggerHealthCheck = async () => {
  isChecking.value = true
  try {
    const response = await $fetch(`/api/resources/${props.resourceId}/health`, {
      method: 'POST',
    })
    healthStatus.value = response.healthStatus
  } catch (error) {
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
</script>

<style scoped>
.health-monitor {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #fafafa;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.monitor-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.check-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.check-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.check-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.health-status {
  width: 100%;
}

.status-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.status-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.status-healthy {
  background-color: #dcfce7;
  color: #16a34a;
}

.status-unhealthy {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-unknown {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-details {
  flex: 1;
}

.status-text {
  margin-bottom: 0.25rem;
}

.status-label {
  font-weight: 500;
  color: #374151;
  margin-right: 0.5rem;
}

.status-value {
  font-weight: 600;
}

.status-info {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.info-label {
  color: #6b7280;
  margin-right: 0.5rem;
}

.status-error {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  border-left: 3px solid #ef4444;
  border-radius: 0 0.25rem 0.25rem 0;
}

.error-label {
  font-weight: 500;
  color: #dc2626;
  margin-right: 0.5rem;
}

.error-value {
  color: #dc2626;
}

.history-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.history-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.history-success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.history-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
}

.history-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.success-icon {
  color: #16a34a;
  font-weight: bold;
}

.error-icon {
  color: #dc2626;
  font-weight: bold;
}

.history-details {
  flex: 1;
}

.history-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.response-time {
  margin-left: 0.5rem;
  color: #9ca3af;
}

.no-health-data {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}
</style>
