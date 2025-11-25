import type { Resource } from '~/types/resource'
import { useHierarchicalTags } from '~/composables/useHierarchicalTags'

// This function applies hierarchical tag filtering to resources
export const filterResourcesByHierarchicalTags = (
  resources: Resource[],
  selectedTagIds: string[]
): Resource[] => {
  if (selectedTagIds.length === 0) {
    return resources
  }

  // In a real implementation, we'd use the hierarchical tag service
  // For now, we'll implement a basic version that matches any tag in the hierarchy
  return resources.filter(resource => {
    // Check if any of the resource's tags match the selected tags directly
    const directMatch = resource.tags.some(tag => selectedTagIds.includes(tag))

    if (directMatch) {
      return true
    }

    // In a complete implementation, we would also check for parent-child relationships
    // This would involve checking if any selected tag is a parent of a resource tag
    // or if any selected tag is a child of a resource tag based on the hierarchy

    return false
  })
}

// This function creates a more complete hierarchical tag filter
// that considers parent-child relationships
export const advancedFilterResourcesByHierarchicalTags = (
  resources: Resource[],
  selectedTagIds: string[],
  includeChildren: boolean = true,
  includeParents: boolean = true
): Resource[] => {
  if (selectedTagIds.length === 0) {
    return resources
  }

  // Get the hierarchical tags service
  const { filterResourcesByTags } = useHierarchicalTags()

  return resources.filter(resource => {
    return filterResourcesByTags(resource.tags, selectedTagIds, {
      includeChildren,
      includeParents,
      searchInSynonyms: true,
      exactMatch: false,
    })
  })
}
