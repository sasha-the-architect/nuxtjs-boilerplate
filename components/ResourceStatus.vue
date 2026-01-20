<template>
  <div class="resource-status">
    <span
      :class="['status-badge', statusClass]"
      :title="statusTitle"
    >
      {{ statusText }}
    </span>
    <span
      v-if="healthScore !== undefined"
      :class="['health-indicator', healthClass]"
      :title="`Health: ${healthScore}%`"
      :aria-label="healthLabel"
    >
      <svg
        v-if="healthScore >= 90"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else-if="healthScore >= 70"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else-if="healthScore >= 50"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="sr-only">{{ healthText }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status?:
    | 'active'
    | 'deprecated'
    | 'discontinued'
    | 'updated'
    | 'pending'
    | string
  healthScore?: number
}

const props = withDefaults(defineProps<Props>(), {
  status: 'active',
  healthScore: undefined,
})

const statusClass = computed(() => {
  switch (props.status) {
    case 'active':
      return 'status-active'
    case 'deprecated':
      return 'status-deprecated'
    case 'discontinued':
      return 'status-discontinued'
    case 'updated':
      return 'status-updated'
    case 'pending':
      return 'status-pending'
    default:
      return 'status-unknown'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'active':
      return 'Active'
    case 'deprecated':
      return 'Deprecated'
    case 'discontinued':
      return 'Discontinued'
    case 'updated':
      return 'Updated'
    case 'pending':
      return 'Pending'
    default:
      return 'Unknown'
  }
})

const statusTitle = computed(() => {
  switch (props.status) {
    case 'active':
      return 'This resource is currently active and maintained'
    case 'deprecated':
      return 'This resource is deprecated and no longer recommended'
    case 'discontinued':
      return 'This resource has been discontinued'
    case 'updated':
      return 'This resource has been recently updated'
    case 'pending':
      return 'This resource is pending review'
    default:
      return 'Status unknown'
  }
})

const healthClass = computed(() => {
  if (props.healthScore === undefined) return 'health-unknown'
  if (props.healthScore >= 90) return 'health-good'
  if (props.healthScore >= 70) return 'health-warning'
  return 'health-bad'
})

const healthText = computed(() => {
  if (props.healthScore === undefined) return 'Health status unknown'
  if (props.healthScore >= 90) return 'Health: Excellent'
  if (props.healthScore >= 70) return 'Health: Good'
  if (props.healthScore >= 50) return 'Health: Fair'
  return 'Health: Poor'
})

const healthLabel = computed(() => {
  if (props.healthScore === undefined) return 'Health status unknown'
  return `Health score: ${props.healthScore}%`
})
</script>

<style scoped>
.resource-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-deprecated {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.status-discontinued {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}

.status-updated {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.status-pending {
  background-color: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.status-unknown {
  background-color: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.health-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.health-indicator svg {
  width: 1.25rem;
  height: 1.25rem;
}

.health-good {
  color: #22c55e;
}

.health-warning {
  color: #f59e0b;
}

.health-bad {
  color: #ef4444;
}

.health-unknown {
  color: #9ca3af;
}
</style>
