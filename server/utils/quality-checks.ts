import type { Resource } from '~/types/resource'
import { VALID_CATEGORIES } from './constants'

interface QualityCheckResult {
  id: string
  title: string
  description: string
  status: 'pass' | 'fail' | 'warn' | 'pending'
  details?: string
}

/**
 * Performs automated quality checks on a resource submission
 */
export function runQualityChecks(resource: Resource): QualityCheckResult[] {
  const checks: QualityCheckResult[] = []

  // URL validation check
  try {
    new URL(resource.url)
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
      details: `URL "${resource.url}" is not valid`,
    })
  }

  // Required fields check
  const requiredFields = [
    { field: 'title', value: resource.title },
    { field: 'description', value: resource.description },
    { field: 'url', value: resource.url },
    { field: 'category', value: resource.category },
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
  if (resource.description && resource.description.length < 20) {
    checks.push({
      id: 'description-length',
      title: 'Description Length',
      description: 'Checks if the description is detailed enough',
      status: 'warn',
      details: `Description "${resource.description.substring(0, 30)}..." is quite short`,
    })
  } else {
    checks.push({
      id: 'description-length',
      title: 'Description Length',
      description: 'Checks if the description is detailed enough',
      status: 'pass',
    })
  }

  // Spam keyword check
  const spamKeywords = [
    'spam',
    'fake',
    'scam',
    'click here',
    'buy now',
    'free money',
    'get rich',
    'make money',
    'casino',
    'gambling',
  ]
  const descriptionLower = resource.description.toLowerCase()
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
  const isValidCategory = VALID_CATEGORIES.includes(resource.category as never)

  if (!isValidCategory) {
    checks.push({
      id: 'category-validation',
      title: 'Category Validation',
      description: 'Checks if the category is in the approved list',
      status: 'warn',
      details: `Category "${resource.category}" is not in the standard list`,
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
  if (!resource.tags || resource.tags.length === 0) {
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
}

/**
 * Calculates an overall quality score based on the quality checks
 */
export function calculateQualityScore(checks: QualityCheckResult[]): number {
  let score = 100

  for (const check of checks) {
    switch (check.status) {
      case 'fail':
        score -= 25 // Significant penalty for failures
        break
      case 'warn':
        score -= 10 // Moderate penalty for warnings
        break
      case 'pending':
        score -= 5 // Small penalty for pending checks
        break
      // 'pass' doesn't affect the score negatively
    }
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}
