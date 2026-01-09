<template>
  <div class="resource-status">
    <span :class="['status-badge', statusClass]" :title="statusTitle">
      {{ statusText }}
    </span>
    <span
      v-if="healthScore !== undefined"
      :class="['health-indicator', healthClass]"
      :title="`Health: ${healthScore}%`"
      :aria-label="healthLabel"
    >
      ●
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
  font-size: 1.2rem;
  line-height: 1;
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
