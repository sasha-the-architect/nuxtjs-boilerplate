import { ref, computed, readonly } from 'vue'
import type {
  HierarchicalTag,
  TagWithHierarchy,
  TagFilterOptions,
} from '~/types/hierarchicalTags'
import { logError } from '~/utils/errorLogger'

// Default hierarchical tags structure for the application
const defaultHierarchicalTags: HierarchicalTag[] = [
  {
    id: 'programming',
    name: 'Programming',
    slug: 'programming',
    description: 'Programming languages, frameworks, and tools',
    parentId: undefined,
    children: [
      {
        id: 'programming-languages',
        name: 'Programming Languages',
        slug: 'programming-languages',
        description: 'Various programming languages',
        parentId: 'programming',
        children: [
          {
            id: 'javascript',
            name: 'JavaScript',
            slug: 'javascript',
            description: 'JavaScript programming language and ecosystem',
            parentId: 'programming-languages',
            children: [
              {
                id: 'nodejs',
                name: 'Node.js',
                slug: 'nodejs',
                description: 'Server-side JavaScript runtime',
                parentId: 'javascript',
                children: [],
                synonyms: ['Node'],
                aliases: ['node'],
                metadata: { category: 'runtime' },
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
                isActive: true,
              },
              {
                id: 'react',
                name: 'React',
                slug: 'react',
                description: 'React JavaScript library',
                parentId: 'javascript',
                children: [],
                synonyms: ['ReactJS'],
                aliases: ['reactjs'],
                metadata: { category: 'frontend-framework' },
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
                isActive: true,
              },
            ],
            synonyms: ['JS', 'ECMAScript'],
            aliases: ['js', 'ecmascript'],
            metadata: { category: 'language' },
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
            isActive: true,
          },
          {
            id: 'python',
            name: 'Python',
            slug: 'python',
            description: 'Python programming language',
            parentId: 'programming-languages',
            children: [],
            synonyms: ['Py'],
            aliases: ['py'],
            metadata: { category: 'language' },
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
            isActive: true,
          },
        ],
        synonyms: ['Languages', 'Coding Languages'],
        aliases: ['langs', 'coding-languages'],
        metadata: { category: 'category' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        isActive: true,
      },
      {
        id: 'frontend',
        name: 'Frontend',
        slug: 'frontend',
        description: 'Frontend development tools and technologies',
        parentId: 'programming',
        children: [
          {
            id: 'css',
            name: 'CSS',
            slug: 'css',
            description: 'Cascading Style Sheets',
            parentId: 'frontend',
            children: [],
            synonyms: ['Cascading Style Sheets'],
            aliases: ['stylesheets'],
            metadata: { category: 'styling' },
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
            isActive: true,
          },
          {
            id: 'html',
            name: 'HTML',
            slug: 'html',
            description: 'HyperText Markup Language',
            parentId: 'frontend',
            children: [],
            synonyms: ['HyperText Markup Language'],
            aliases: [],
            metadata: { category: 'markup' },
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
            isActive: true,
          },
        ],
        synonyms: ['Frontend Development', 'Client-side'],
        aliases: ['client-side'],
        metadata: { category: 'domain' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        isActive: true,
      },
    ],
    synonyms: ['Development', 'Coding'],
    aliases: ['dev', 'code'],
    metadata: { category: 'domain' },
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    isActive: true,
  },
  {
    id: 'ai',
    name: 'AI & Machine Learning',
    slug: 'ai',
    description: 'Artificial Intelligence and Machine Learning tools',
    parentId: undefined,
    children: [
      {
        id: 'nlp',
        name: 'Natural Language Processing',
        slug: 'nlp',
        description: 'NLP technologies and tools',
        parentId: 'ai',
        children: [],
        synonyms: ['Natural Language Processing'],
        aliases: ['language-processing'],
        metadata: { category: 'ai-subdomain' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        isActive: true,
      },
      {
        id: 'computer-vision',
        name: 'Computer Vision',
        slug: 'computer-vision',
        description: 'Computer vision technologies',
        parentId: 'ai',
        children: [],
        synonyms: ['Computer Vision'],
        aliases: ['image-recognition'],
        metadata: { category: 'ai-subdomain' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        isActive: true,
      },
    ],
    synonyms: ['Artificial Intelligence', 'ML', 'Machine Learning'],
    aliases: ['ai-ml', 'artificial-intelligence'],
    metadata: { category: 'domain' },
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    isActive: true,
  },
  {
    id: 'cloud',
    name: 'Cloud & Hosting',
    slug: 'cloud',
    description: 'Cloud platforms and hosting services',
    parentId: undefined,
    children: [
      {
        id: 'aws',
        name: 'AWS',
        slug: 'aws',
        description: 'Amazon Web Services',
        parentId: 'cloud',
        children: [],
        synonyms: ['Amazon Web Services'],
        aliases: ['amazon-web-services'],
        metadata: { category: 'platform' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        isActive: true,
      },
      {
        id: 'azure',
        name: 'Azure',
        slug: 'azure',
        description: 'Microsoft Azure',
        parentId: 'cloud',
        children: [],
        synonyms: ['Microsoft Azure'],
        aliases: ['microsoft-azure'],
        metadata: { category: 'platform' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        isActive: true,
      },
      {
        id: 'gcp',
        name: 'GCP',
        slug: 'gcp',
        description: 'Google Cloud Platform',
        parentId: 'cloud',
        children: [],
        synonyms: ['Google Cloud Platform'],
        aliases: ['google-cloud'],
        metadata: { category: 'platform' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        isActive: true,
      },
    ],
    synonyms: ['Cloud Computing', 'Hosting'],
    aliases: ['cloud-computing', 'hosting'],
    metadata: { category: 'domain' },
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    isActive: true,
  },
]

export const useHierarchicalTags = () => {
  const tags = ref<HierarchicalTag[]>(
    JSON.parse(JSON.stringify(defaultHierarchicalTags))
  )
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get all root-level tags (tags without parents)
  const rootTags = computed(() => {
    return tags.value.filter(tag => !tag.parentId)
  })

  // Find a tag by its ID
  const findTagById = (id: string): HierarchicalTag | undefined => {
    const findInTree = (
      tagList: HierarchicalTag[]
    ): HierarchicalTag | undefined => {
      for (const tag of tagList) {
        if (tag.id === id) return tag
        if (tag.children && tag.children.length > 0) {
          const found = findInTree(tag.children)
          if (found) return found
        }
      }
      return undefined
    }

    return findInTree(tags.value)
  }

  // Get the full path of a tag (from root to the tag)
  const getTagPath = (tagId: string): string[] => {
    const path: string[] = []

    const buildPath = (currentId: string): boolean => {
      const tag = findTagById(currentId)
      if (!tag) return false

      path.unshift(tag.name) // Add to beginning of array

      if (tag.parentId) {
        return buildPath(tag.parentId)
      }
      return true
    }

    buildPath(tagId)
    return path
  }

  // Get all tags with hierarchy information
  const getAllTagsWithHierarchy = (): TagWithHierarchy[] => {
    const result: TagWithHierarchy[] = []

    const processTag = (tag: HierarchicalTag, level: number = 0) => {
      const tagWithHierarchy: TagWithHierarchy = {
        ...tag,
        path: getTagPath(tag.id),
        level,
        hasChildren: !!(tag.children && tag.children.length > 0),
      }
      result.push(tagWithHierarchy)

      if (tag.children && tag.children.length > 0) {
        tag.children.forEach(child => processTag(child, level + 1))
      }
    }

    tags.value.forEach(tag => processTag(tag))
    return result
  }

  // Get child tags for a given parent
  const getChildTags = (parentId: string): HierarchicalTag[] => {
    const parent = findTagById(parentId)
    return parent?.children || []
  }

  // Get all tags that match a search query
  const searchTags = (
    query: string,
    options: TagFilterOptions = {}
  ): HierarchicalTag[] => {
    const { searchInSynonyms = true, exactMatch = false } = options
    const lowerQuery = query.toLowerCase()

    const matchesQuery = (tag: HierarchicalTag): boolean => {
      // Check main name
      if (exactMatch) {
        if (tag.name.toLowerCase() === lowerQuery) return true
      } else {
        if (tag.name.toLowerCase().includes(lowerQuery)) return true
      }

      // Check slug
      if (tag.slug.toLowerCase().includes(lowerQuery)) return true

      // Check synonyms if enabled
      if (searchInSynonyms && tag.synonyms) {
        for (const synonym of tag.synonyms) {
          if (exactMatch) {
            if (synonym.toLowerCase() === lowerQuery) return true
          } else {
            if (synonym.toLowerCase().includes(lowerQuery)) return true
          }
        }
      }

      // Check aliases if enabled
      if (searchInSynonyms && tag.aliases) {
        for (const alias of tag.aliases) {
          if (exactMatch) {
            if (alias.toLowerCase() === lowerQuery) return true
          } else {
            if (alias.toLowerCase().includes(lowerQuery)) return true
          }
        }
      }

      return false
    }

    const results: HierarchicalTag[] = []

    const searchInTree = (tagList: HierarchicalTag[]) => {
      tagList.forEach(tag => {
        if (matchesQuery(tag)) {
          results.push(tag)
        }
        if (tag.children && tag.children.length > 0) {
          searchInTree(tag.children)
        }
      })
    }

    tags.value.forEach(tag => searchInTree([tag]))

    return results
  }

  // Get tags by flat list of tag IDs (for filtering resources)
  const getTagsByIds = (tagIds: string[]): HierarchicalTag[] => {
    return tagIds
      .map(id => findTagById(id))
      .filter((tag): tag is HierarchicalTag => tag !== undefined)
  }

  // Filter resources by hierarchical tags
  const filterResourcesByTags = (
    resourceTags: string[],
    selectedTagIds: string[],
    options: TagFilterOptions = {}
  ): boolean => {
    const { includeChildren = true, includeParents = true } = options

    if (selectedTagIds.length === 0) return true // No tags selected, pass all

    // Check if any of the resource's tags match the selected tags directly
    if (resourceTags.some(tag => selectedTagIds.includes(tag))) {
      return true
    }

    // If includeChildren is enabled, check if any selected tag is a parent of a resource tag
    if (includeChildren) {
      for (const selectedTagId of selectedTagIds) {
        const selectedTag = findTagById(selectedTagId)
        if (selectedTag?.children && selectedTag.children.length > 0) {
          // Check if any child of the selected tag is in the resource tags
          const allDescendants = getAllDescendants(selectedTag)
          if (
            resourceTags.some(resourceTag =>
              allDescendants.some(descendant => descendant.id === resourceTag)
            )
          ) {
            return true
          }
        }
      }
    }

    // If includeParents is enabled, check if any parent of resource tags is in selected tags
    if (includeParents) {
      for (const resourceTag of resourceTags) {
        const tag = findTagById(resourceTag)
        if (tag) {
          const parentPath = getTagPath(resourceTag)
          // Check if any parent in the path is in selected tags
          for (const parentId of selectedTagIds) {
            if (
              parentPath.some(parentName => {
                const parentTag = findTagById(parentId)
                return parentTag?.name === parentName
              })
            ) {
              return true
            }
          }
        }
      }
    }

    return false
  }

  // Helper function to get all descendants of a tag
  const getAllDescendants = (tag: HierarchicalTag): HierarchicalTag[] => {
    const descendants: HierarchicalTag[] = []

    if (tag.children && tag.children.length > 0) {
      tag.children.forEach(child => {
        descendants.push(child)
        descendants.push(...getAllDescendants(child))
      })
    }

    return descendants
  }

  // Add a new tag to the hierarchy
  const addTag = (
    tag: Omit<HierarchicalTag, 'createdAt' | 'updatedAt'>
  ): void => {
    try {
      const newTag: HierarchicalTag = {
        ...tag,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      }

      if (!tag.parentId) {
        // Add as root tag
        tags.value.push(newTag)
      } else {
        // Find parent and add as child
        const addAsChild = (tagList: HierarchicalTag[]): boolean => {
          for (let i = 0; i < tagList.length; i++) {
            if (tagList[i].id === tag.parentId) {
              if (!tagList[i].children) tagList[i].children = []
              tagList[i].children!.push(newTag)
              return true
            }
            if (tagList[i].children && tagList[i].children.length > 0) {
              if (addAsChild(tagList[i].children!)) {
                return true
              }
            }
          }
          return false
        }

        addAsChild(tags.value)
      }
    } catch (err) {
      logError(
        `Failed to add tag: ${err instanceof Error ? err.message : 'Unknown error'}`,
        err as Error,
        'useHierarchicalTags'
      )
      error.value = 'Failed to add tag'
    }
  }

  // Update an existing tag
  const updateTag = (id: string, updates: Partial<HierarchicalTag>): void => {
    const tag = findTagById(id)
    if (tag) {
      Object.assign(tag, updates, { updatedAt: new Date().toISOString() })
    }
  }

  // Remove a tag (and optionally its children)
  const removeTag = (id: string, removeChildren: boolean = true): void => {
    const removeInTree = (tagList: HierarchicalTag[]): HierarchicalTag[] => {
      return tagList.filter(tag => {
        if (tag.id === id) {
          return false // Remove this tag
        }
        if (tag.children && tag.children.length > 0) {
          if (removeChildren) {
            // Remove the tag and all its children
            tag.children = removeInTree(tag.children)
          }
        }
        return true
      })
    }

    tags.value = removeInTree(tags.value)
  }

  return {
    tags: readonly(tags),
    loading: readonly(loading),
    error: readonly(error),
    rootTags,
    findTagById,
    getTagPath,
    getAllTagsWithHierarchy,
    getChildTags,
    searchTags,
    getTagsByIds,
    filterResourcesByTags,
    addTag,
    updateTag,
    removeTag,
  }
}
