// Define TypeScript interfaces for hierarchical tags

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string | null
  children?: readonly Tag[]
  synonyms?: readonly string[]
  aliases?: readonly string[]
  createdAt: string
  updatedAt: string
}

export interface HierarchicalTag extends Tag {
  parent?: HierarchicalTag | null
  children: readonly HierarchicalTag[]
  level: number
  path: readonly string[] // Array of tag IDs representing the path from root to this tag
  fullPathNames: readonly string[] // Array of tag names representing the path from root to this tag
}

export interface TagTreeNode {
  tag: HierarchicalTag
  children: readonly TagTreeNode[]
}

export interface TagFilterOptions {
  includeChildren?: boolean // Whether to include child tags when filtering by parent
  includeParents?: boolean // Whether to include parent tags when filtering by child
  exactMatch?: boolean // Whether to match exact tag or use hierarchical matching
}
