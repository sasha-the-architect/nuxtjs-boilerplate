import type { Resource, HierarchicalTag } from '~/types/resource'

// Default hierarchical tag structure
const DEFAULT_HIERARCHICAL_TAGS: HierarchicalTag[] = [
  {
    id: 'ai-ml',
    name: 'AI',
    description: 'Artificial Intelligence and Machine Learning',
    children: [
      {
        id: 'ai-ml-generative',
        name: 'Generative AI',
        description: 'AI that generates content',
        children: [
          {
            id: 'ai-ml-generative-image',
            name: 'Image Generation',
            description: 'AI that creates images',
          },
          {
            id: 'ai-ml-generative-text',
            name: 'Text Generation',
            description: 'AI that creates text',
          },
          {
            id: 'ai-ml-generative-audio',
            name: 'Audio Generation',
            description: 'AI that creates audio',
          },
        ],
      },
      {
        id: 'ai-ml-tools',
        name: 'AI Tools',
        description: 'Tools and platforms for AI',
        children: [
          {
            id: 'ai-ml-tools-frameworks',
            name: 'Frameworks',
            description: 'AI development frameworks',
          },
          {
            id: 'ai-ml-tools-platforms',
            name: 'Platforms',
            description: 'AI development platforms',
          },
        ],
      },
      {
        id: 'ai-ml-apis',
        name: 'AI APIs',
        description: 'APIs for AI services',
        children: [
          {
            id: 'ai-ml-apis-openai',
            name: 'OpenAI',
            description: 'OpenAI services',
          },
          {
            id: 'ai-ml-apis-google',
            name: 'Google AI',
            description: 'Google AI services',
          },
          {
            id: 'ai-ml-apis-anthropic',
            name: 'Anthropic',
            description: 'Anthropic AI services',
          },
        ],
      },
    ],
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'Web development technologies',
    children: [
      {
        id: 'web-dev-frontend',
        name: 'Frontend',
        description: 'Frontend development',
        children: [
          {
            id: 'web-dev-frontend-react',
            name: 'React',
            description: 'React.js framework',
          },
          {
            id: 'web-dev-frontend-vue',
            name: 'Vue',
            description: 'Vue.js framework',
          },
          {
            id: 'web-dev-frontend-angular',
            name: 'Angular',
            description: 'Angular framework',
          },
        ],
      },
      {
        id: 'web-dev-backend',
        name: 'Backend',
        description: 'Backend development',
        children: [
          {
            id: 'web-dev-backend-node',
            name: 'Node.js',
            description: 'Node.js backend',
          },
          {
            id: 'web-dev-backend-python',
            name: 'Python',
            description: 'Python backend',
          },
          {
            id: 'web-dev-backend-ruby',
            name: 'Ruby',
            description: 'Ruby backend',
          },
        ],
      },
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud',
    description: 'Cloud services and platforms',
    children: [
      {
        id: 'cloud-providers',
        name: 'Cloud Providers',
        description: 'Cloud service providers',
        children: [
          {
            id: 'cloud-providers-aws',
            name: 'AWS',
            description: 'Amazon Web Services',
          },
          {
            id: 'cloud-providers-gcp',
            name: 'GCP',
            description: 'Google Cloud Platform',
          },
          {
            id: 'cloud-providers-azure',
            name: 'Azure',
            description: 'Microsoft Azure',
          },
        ],
      },
      {
        id: 'cloud-services',
        name: 'Cloud Services',
        description: 'Specific cloud services',
        children: [
          {
            id: 'cloud-services-storage',
            name: 'Storage',
            description: 'Cloud storage services',
          },
          {
            id: 'cloud-services-compute',
            name: 'Compute',
            description: 'Cloud computing services',
          },
          {
            id: 'cloud-services-database',
            name: 'Database',
            description: 'Cloud databases',
          },
        ],
      },
    ],
  },
]

/**
 * Extract all unique tags from resources
 */
export const extractTagsFromResources = (resources: Resource[]): string[] => {
  const allTags = new Set<string>()
  resources.forEach(resource => {
    resource.tags.forEach(tag => allTags.add(tag))
  })
  return Array.from(allTags).sort()
}

/**
 * Get all available tags with optional hierarchical structure
 */
export const getAllTags = async (
  includeHierarchical: boolean = false
): Promise<{
  tags: string[]
  hierarchical?: HierarchicalTag[]
}> => {
  // Import resources from JSON
  const resourcesModule = await import('~/data/resources.json')
  const resources: Resource[] = resourcesModule.default || resourcesModule

  const tags = extractTagsFromResources(resources)

  if (includeHierarchical) {
    return {
      tags,
      hierarchical: DEFAULT_HIERARCHICAL_TAGS,
    }
  }

  return { tags }
}

/**
 * Normalize a tag name (remove special characters, lowercase, etc.)
 */
export const normalizeTag = (tag: string): string => {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Check if a tag exists in the tag hierarchy
 */
export const findTagInHierarchy = (
  hierarchicalTags: HierarchicalTag[],
  tagName: string
): HierarchicalTag | null => {
  for (const tag of hierarchicalTags) {
    if (tag.name.toLowerCase() === tagName.toLowerCase()) {
      return tag
    }

    if (tag.children) {
      const found = findTagInHierarchy(tag.children, tagName)
      if (found) return found
    }
  }
  return null
}

/**
 * Get parent tags for a given tag in the hierarchy
 */
export const getParentTags = (
  hierarchicalTags: HierarchicalTag[],
  tagName: string
): HierarchicalTag[] => {
  for (const tag of hierarchicalTags) {
    if (tag.name.toLowerCase() === tagName.toLowerCase()) {
      return [tag]
    }

    if (tag.children) {
      for (const child of tag.children) {
        if (child.name.toLowerCase() === tagName.toLowerCase()) {
          return [tag, child]
        }

        const nestedParents = getParentTags([child], tagName)
        if (nestedParents.length > 1) {
          return [tag, ...nestedParents]
        }
      }
    }
  }
  return []
}
