import type {
  Tag,
  HierarchicalTag,
  TagTreeNode,
  TagFilterOptions,
} from '~/types/tag'
import type { Resource } from '~/types/resource'

// Default hierarchical tags structure for the application
const DEFAULT_HIERARCHICAL_TAGS: readonly HierarchicalTag[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    slug: 'ai-ml',
    description: 'Artificial Intelligence and Machine Learning technologies',
    parentId: null,
    children: [],
    synonyms: [],
    aliases: ['AI', 'ML'],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    parent: null,
    level: 0,
    path: ['ai-ml'],
    fullPathNames: ['AI & Machine Learning'],
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    slug: 'web-dev',
    description: 'Web development technologies and frameworks',
    parentId: null,
    children: [],
    synonyms: [],
    aliases: ['Web Dev'],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    parent: null,
    level: 0,
    path: ['web-dev'],
    fullPathNames: ['Web Development'],
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    slug: 'cloud',
    description: 'Cloud platforms and services',
    parentId: null,
    children: [],
    synonyms: [],
    aliases: ['Cloud'],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    parent: null,
    level: 0,
    path: ['cloud'],
    fullPathNames: ['Cloud Computing'],
  },
  {
    id: 'ai-tools',
    name: 'AI Tools',
    slug: 'ai-tools',
    description: 'Tools and platforms for AI development',
    parentId: 'ai-ml',
    children: [],
    synonyms: [],
    aliases: ['AI Tools'],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    parent: null, // Will be populated when building the tree
    level: 1,
    path: ['ai-ml', 'ai-tools'],
    fullPathNames: ['AI & Machine Learning', 'AI Tools'],
  },
  {
    id: 'api',
    name: 'API',
    slug: 'api',
    description: 'Application Programming Interfaces',
    parentId: 'ai-ml',
    children: [],
    synonyms: [],
    aliases: ['APIs'],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    parent: null, // Will be populated when building the tree
    level: 1,
    path: ['ai-ml', 'api'],
    fullPathNames: ['AI & Machine Learning', 'API'],
  },
  {
    id: 'gpt',
    name: 'GPT',
    slug: 'gpt',
    description: 'Generative Pre-trained Transformer models',
    parentId: 'ai-tools',
    children: [],
    synonyms: [],
    aliases: ['GPT Models'],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    parent: null, // Will be populated when building the tree
    level: 2,
    path: ['ai-ml', 'ai-tools', 'gpt'],
    fullPathNames: ['AI & Machine Learning', 'AI Tools', 'GPT'],
  },
]

/**
 * Converts flat tags to hierarchical tags
 */
export function convertFlatToHierarchicalTags(
  flatTags: readonly string[]
): HierarchicalTag[] {
  return flatTags.map((tag, index) => ({
    id: tag.toLowerCase().replace(/\s+/g, '-'),
    name: tag,
    slug: tag.toLowerCase().replace(/\s+/g, '-'),
    description: `Tag: ${tag}`,
    parentId: null,
    children: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parent: null,
    level: 0,
    path: [tag.toLowerCase().replace(/\s+/g, '-')],
    fullPathNames: [tag],
    synonyms: [],
    aliases: [],
  }))
}

/**
 * Builds a hierarchical tree structure from flat tags array
 */
export function buildTagTree(tags: readonly Tag[]): TagTreeNode[] {
  // Create a map of all tags by ID for quick lookup
  const tagMap = new Map<string, TagTreeNode>()

  // Initialize all tags as tree nodes
  tags.forEach(tag => {
    tagMap.set(tag.id, {
      tag: {
        ...tag,
        children: [],
        parent: tag.parentId ? undefined : null, // Will be filled in later
        level: 0, // Will be calculated later
        path: [tag.id], // Will be calculated later
        fullPathNames: [tag.name], // Will be calculated later
        synonyms: tag.synonyms || [],
        aliases: tag.aliases || [],
      } as HierarchicalTag,
      children: [],
    })
  })

  // Build parent-child relationships
  const roots: TagTreeNode[] = []

  tags.forEach(tag => {
    const node = tagMap.get(tag.id)!
    if (tag.parentId && tagMap.has(tag.parentId)) {
      const parentNode: TagTreeNode = tagMap.get(tag.parentId)!
      // Add to parent's children array
      ;(parentNode.children as TagTreeNode[]).push(node)
      // Set parent reference and level
      const hierarchicalTag = node.tag as HierarchicalTag
      hierarchicalTag.parent = parentNode.tag as HierarchicalTag
      hierarchicalTag.level = (parentNode.tag as HierarchicalTag).level + 1

      // Calculate path from root
      hierarchicalTag.path = [
        ...(parentNode.tag as HierarchicalTag).path,
        tag.id,
      ] as readonly string[]
      hierarchicalTag.fullPathNames = [
        ...(parentNode.tag as HierarchicalTag).fullPathNames,
        tag.name,
      ] as readonly string[]
    } else {
      // This is a root node
      roots.push(node)
      // Set level and path for root
      const hierarchicalTag = node.tag as HierarchicalTag
      hierarchicalTag.level = 0
      hierarchicalTag.path = [tag.id] as readonly string[]
      hierarchicalTag.fullPathNames = [tag.name] as readonly string[]
    }
  })

  return roots
}

/**
 * Flattens a hierarchical tag structure to get all tags including children
 */
export function flattenTagTree(
  nodes: readonly TagTreeNode[]
): HierarchicalTag[] {
  const result: HierarchicalTag[] = []

  function traverse(node: TagTreeNode) {
    result.push(node.tag)
    node.children.forEach(traverse)
  }

  nodes.forEach(traverse)

  return result
}

/**
 * Get all child tags for a given tag ID
 */
export function getChildTags(
  tagId: string,
  allTags: readonly HierarchicalTag[]
): HierarchicalTag[] {
  const children: HierarchicalTag[] = []

  function findChildren(parentId: string) {
    const directChildren = allTags.filter(tag => tag.parentId === parentId)
    children.push(...directChildren)

    directChildren.forEach(child => {
      findChildren(child.id)
    })
  }

  findChildren(tagId)

  return children
}

/**
 * Get all parent tags for a given tag ID
 */
export function getParentTags(
  tagId: string,
  allTags: readonly HierarchicalTag[]
): HierarchicalTag[] {
  const parents: HierarchicalTag[] = []
  let currentTag = allTags.find(tag => tag.id === tagId)

  while (currentTag && currentTag.parentId) {
    const parentTag = allTags.find(tag => tag.id === currentTag!.parentId)
    if (parentTag) {
      parents.push(parentTag)
      currentTag = parentTag
    } else {
      break
    }
  }

  return parents
}

/**
 * Filter resources by hierarchical tags
 */
export function filterResourcesByHierarchicalTags(
  resources: readonly Resource[],
  selectedTagIds: readonly string[],
  options: TagFilterOptions = {}
): Resource[] {
  const { includeChildren = true, includeParents = false } = options

  return resources.filter(resource => {
    if (!resource.hierarchicalTags || resource.hierarchicalTags.length === 0) {
      // Fallback to flat tags if hierarchical tags are not available
      return resource.tags.some(tag =>
        selectedTagIds.some(
          selectedTagId =>
            tag.toLowerCase().replace(/\s+/g, '-') ===
            selectedTagId.toLowerCase()
        )
      )
    }

    // Get all selected tags and their children/parents based on options
    let relevantTagIds = [...selectedTagIds]

    if (includeChildren) {
      for (const tagId of selectedTagIds) {
        const children = getChildTags(tagId, [...resource.hierarchicalTags])
        relevantTagIds.push(...children.map(child => child.id))
      }
    }

    if (includeParents) {
      for (const tagId of selectedTagIds) {
        const parents = getParentTags(tagId, [...resource.hierarchicalTags])
        relevantTagIds.push(...parents.map(parent => parent.id))
      }
    }

    // Check if resource has any of the relevant tags
    return resource.hierarchicalTags.some(tag =>
      relevantTagIds.includes(tag.id)
    )
  })
}

/**
 * Get all available hierarchical tags from resources
 */
export function getAllHierarchicalTags(
  resources: readonly Resource[]
): HierarchicalTag[] {
  const allTags = new Set<string>()

  resources.forEach(resource => {
    if (resource.hierarchicalTags) {
      resource.hierarchicalTags.forEach(tag => {
        allTags.add(tag.id)
      })
    }
  })

  // For now, return the default hierarchical tags
  // In a real implementation, this would be populated from actual resource data
  return DEFAULT_HIERARCHICAL_TAGS as HierarchicalTag[]
}

/**
 * Converts resources with flat tags to include hierarchical tags
 */
export function convertResourcesToHierarchicalTags(
  resources: readonly Resource[]
): Resource[] {
  return resources.map(resource => {
    if (resource.hierarchicalTags) {
      // Already has hierarchical tags, return as is
      return resource
    }

    // Convert flat tags to hierarchical tags
    const hierarchicalTags = convertFlatToHierarchicalTags(resource.tags)

    return {
      ...resource,
      hierarchicalTags,
    } as Resource
  })
}
