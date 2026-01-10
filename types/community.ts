// Unified type definitions for community features
// This ensures type consistency across all community composables
// Eliminates the need for 'as any' casts in orchestrator

export interface UserProfile {
  id: string
  name: string
  email: string
  username?: string
  role: string
  isModerator?: boolean
  joinDate: string
  joinedAt?: string
  contributions?: number
  reputation?: number
  contributionsDetail?: UserContributions
  privacy?: UserPrivacy
}

export interface UserContributions {
  comments: number
  resources: number
  votes: number
}

export interface UserPrivacy {
  showEmail: boolean
  showActivity: boolean
}

export interface CreateUserData {
  name: string
  email: string
  username?: string
  role?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  username?: string
  role?: string
  privacy?: Partial<UserPrivacy>
}

export interface Comment {
  id: string
  resourceId: string
  content: string
  userId: string
  userName: string
  timestamp: string
  votes: number
  replies: Comment[]
  isEdited: boolean
  editedAt?: string
  status: 'active' | 'removed' | 'flagged'
}

export interface CommentData {
  resourceId: string
  content: string
}

export interface ReplyData {
  content: string
}

export interface Vote {
  id: string
  targetType: string
  targetId: string
  userId: string
  voteType: 'up' | 'down'
  timestamp: string
}

export interface Flag {
  id: string
  targetType: string
  targetId: string
  reason: string
  userId: string
  reportedAt: string
  status: 'pending' | 'resolved' | 'dismissed' | 'reviewed'
  details?: string
  flaggedBy?: string
  moderator?: string
  moderatorNote?: string
  actionTaken?: string
}

export interface FlagData {
  targetType: string
  targetId: string
  reason: string
  details?: string
}

// Callback interfaces for cross-module communication
export interface UpdateVoteCountCallback {
  (
    targetType: string,
    targetId: string,
    voteType: 'up' | 'down',
    change: number
  ): void
}

export interface UpdateUserContributionsCallback {
  (userId: string, change: number): void
}

export interface RemoveCommentByModeratorCallback {
  (commentId: string): boolean
}

export interface ModerationActionCallback {
  (flagId: string, action: string, moderatorNote: string): boolean
}
