import type { Resource } from '~/types/resource'

/**
 * Convert resources to CSV format
 */
export function resourcesToCsv(resources: Resource[]): string {
  if (resources.length === 0) {
    return ''
  }

  // Create header row
  const headers = [
    'id',
    'title',
    'description',
    'benefits',
    'url',
    'category',
    'pricingModel',
    'difficulty',
    'tags',
    'technology',
    'dateAdded',
    'popularity',
    'icon',
  ]

  // Convert benefits, tags, and technology arrays to comma-separated strings
  const csvRows = resources.map(resource => [
    resource.id,
    `"${resource.title.replace(/"/g, '""')}"`, // Escape quotes
    `"${resource.description.replace(/"/g, '""')}"`,
    `"${(resource.benefits || []).join(', ')}"`,
    resource.url,
    resource.category,
    resource.pricingModel,
    resource.difficulty,
    `"${(resource.tags || []).join(', ')}"`,
    `"${(resource.technology || []).join(', ')}"`,
    resource.dateAdded,
    resource.popularity,
    resource.icon || '',
  ])

  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(',')),
  ].join('\n')

  return csvContent
}
