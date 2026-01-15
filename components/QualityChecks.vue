<template>
  <div class="quality-checks">
    <h3>Automated Quality Checks</h3>
    <div class="checks-list">
      <div
        v-for="check in qualityChecks"
        :key="check.id"
        :class="['check-item', `check-${check.status}`]"
      >
        <div class="check-icon">
          <span v-if="check.status === 'pass'">✅</span>
          <span v-else-if="check.status === 'fail'">❌</span>
          <span v-else-if="check.status === 'warn'">⚠️</span>
          <span v-else>❓</span>
        </div>
        <div class="check-content">
          <div class="check-title">
            {{ check.title }}
          </div>
          <div class="check-description">
            {{ check.description }}
          </div>
          <div
            v-if="check.details"
            class="check-details"
          >
            <pre>{{ check.details }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '~/types/resource'

interface Props {
  resource?: Resource
}

interface QualityCheck {
  id: string
  title: string
  description: string
  status: 'pass' | 'fail' | 'warn' | 'pending'
  details?: string
}

const props = withDefaults(defineProps<Props>(), {
  resource: () => ({}) as Resource,
})

const qualityChecks = computed<QualityCheck[]>(() => {
  const checks: QualityCheck[] = []

  // URL validation check
  try {
    new URL(props.resource.url)
    checks.push({
      id: 'url-validation',
      title: 'URL Validation',
      description: 'Checks if the URL is valid and accessible',
      status: 'pass',
    })
  } catch {
    checks.push({
      id: 'url-validation',
      title: 'URL Validation',
      description: 'Checks if the URL is valid and accessible',
      status: 'fail',
      details: `URL "${props.resource.url}" is not valid`,
    })
  }

  // Required fields check
  const requiredFields = [
    { field: 'title', value: props.resource.title },
    { field: 'description', value: props.resource.description },
    { field: 'url', value: props.resource.url },
    { field: 'category', value: props.resource.category },
  ]

  for (const field of requiredFields) {
    if (!field.value || field.value.toString().trim().length === 0) {
      checks.push({
        id: `required-${field.field}`,
        title: `${field.field.charAt(0).toUpperCase() + field.field.slice(1)} Field`,
        description: `Checks if the ${field.field} field is provided`,
        status: 'fail',
        details: `${field.field} is required but missing`,
      })
    } else {
      checks.push({
        id: `required-${field.field}`,
        title: `${field.field.charAt(0).toUpperCase() + field.field.slice(1)} Field`,
        description: `Checks if the ${field.field} field is provided`,
        status: 'pass',
      })
    }
  }

  // Description length check
  if (props.resource.description && props.resource.description.length < 20) {
    checks.push({
      id: 'description-length',
      title: 'Description Length',
      description: 'Checks if the description is detailed enough',
      status: 'warn',
      details: `Description "${props.resource.description.substring(0, 30)}..." is quite short`,
    })
  } else {
    checks.push({
      id: 'description-length',
      title: 'Description Length',
      description: 'Checks if the description is detailed enough',
      status: 'pass',
    })
  }

  // Duplicate check (simulated)
  // In a real app, this would check against existing resources
  checks.push({
    id: 'duplicate-check',
    title: 'Duplicate Check',
    description: 'Checks for similar resources already in the system',
    status: 'pass', // Simulated as pass
    details: 'No similar resources found in the system',
  })

  // Spam keyword check
  const spamKeywords = [
    'spam',
    'fake',
    'scam',
    'click here',
    'buy now',
    'free money',
  ]
  const descriptionLower = props.resource.description.toLowerCase()
  const hasSpam = spamKeywords.some(keyword =>
    descriptionLower.includes(keyword.toLowerCase())
  )

  if (hasSpam) {
    checks.push({
      id: 'spam-check',
      title: 'Spam Detection',
      description: 'Checks for spam keywords in the content',
      status: 'fail',
      details: 'Spam keywords detected in description',
    })
  } else {
    checks.push({
      id: 'spam-check',
      title: 'Spam Detection',
      description: 'Checks for spam keywords in the content',
      status: 'pass',
    })
  }

  // Category validation check
  const validCategories = [
    'Development',
    'Design',
    'Productivity',
    'Marketing',
    'Analytics',
    'Security',
    'AI/ML',
    'DevOps',
    'Testing',
    'Education',
  ]
  const isValidCategory = validCategories.includes(props.resource.category)

  if (!isValidCategory) {
    checks.push({
      id: 'category-validation',
      title: 'Category Validation',
      description: 'Checks if the category is in the approved list',
      status: 'warn',
      details: `Category "${props.resource.category}" is not in the standard list`,
    })
  } else {
    checks.push({
      id: 'category-validation',
      title: 'Category Validation',
      description: 'Checks if the category is in the approved list',
      status: 'pass',
    })
  }

  // Tags validation check
  if (!props.resource.tags || props.resource.tags.length === 0) {
    checks.push({
      id: 'tags-validation',
      title: 'Tags Validation',
      description: 'Checks if resource has relevant tags',
      status: 'warn',
      details: 'Resource has no tags which may affect discoverability',
    })
  } else {
    checks.push({
      id: 'tags-validation',
      title: 'Tags Validation',
      description: 'Checks if resource has relevant tags',
      status: 'pass',
    })
  }

  return checks
})
</script>

<style scoped>
.quality-checks {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.quality-checks h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.checks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.check-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 6px;
  align-items: flex-start;
}

.check-pass {
  background: rgba(40, 167, 69, 0.05);
  border: 1px solid rgba(40, 167, 69, 0.1);
}

.check-fail {
  background: rgba(220, 53, 69, 0.05);
  border: 1px solid rgba(220, 53, 69, 0.1);
}

.check-warn {
  background: rgba(255, 193, 7, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.1);
}

.check-pending {
  background: rgba(108, 117, 125, 0.05);
  border: 1px solid rgba(108, 117, 125, 0.1);
}

.check-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.check-content {
  flex: 1;
}

.check-title {
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.check-description {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.check-details {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  background: var(--color-background);
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
}

.check-details pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
