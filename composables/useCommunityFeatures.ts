/**
 * Composable for community features (Orchestrator)
 * Coordinates user profiles, comments, voting, and moderation systems
 *
 * Architecture:
 * - This composable acts as an orchestrator, composing smaller, focused composables
 * - Delegates to domain-specific composables: useUserProfiles, useComments, useVoting, useModeration
 * - Maintains backward compatibility with existing API
 *
 * Performance optimizations:
 * - O(1) lookups using Map-based indexing
 * - Reactive state with Vue 3 Composition API
 * - Eliminated N+1 linear searches
 * - Type-safe: Uses unified community types, no 'as any' casts
 */
import type {
  UserProfile,
  Comment,
  CommentData,
  ReplyData,
  Vote,
  Flag,
  FlagData,
  UpdateVoteCountCallback,
  UpdateUserContributionsCallback,
  RemoveCommentByModeratorCallback,
  ModerationActionCallback,
  CreateUserData,
  UpdateUserData,
} from '~/types/community'
import { useUserProfiles } from './community/useUserProfiles'
import { useComments } from './community/useComments'
import { useVoting } from './community/useVoting'
import { useModeration } from './community/useModeration'

export const useCommunityFeatures = (
  initialUsers: UserProfile[] = [],
  initialComments: Comment[] = [],
  initialVotes: Vote[] = [],
  initialFlags: Flag[] = []
) => {
  // Initialize focused composables with callbacks for cross-module communication

  const commentsComposable = useComments(initialComments)

  const userProfilesComposable = useUserProfiles(initialUsers)

  const votingComposable = useVoting(
    initialVotes,
    // Callback to update comment vote counts
    (
      targetType: string,
      targetId: string,
      voteType: 'up' | 'down',
      change: number
    ) => {
      if (targetType === 'comment') {
        commentsComposable.updateCommentVotes(targetId, change)
      }
    },
    // Callback to update user contribution counts
    (userId: string, change: number) => {
      userProfilesComposable.incrementContributions('votes', change)
    }
  )

  const moderationComposable = useModeration(
    initialFlags,
    // Callback to remove comments by moderator
    (commentId: string) => {
      return commentsComposable.removeCommentByModerator(commentId)
    },
    // Callback for moderation actions
    (flagId: string, action: string, moderatorNote: string) => {
      // This callback is handled inline in the orchestator methods
      // (flagContent, moderateContent) which use the moderation composable
      return true
    }
  )

  // Helper to bridge type compatibility between old and new interfaces
  const currentUser = userProfilesComposable.currentUser

  // Set current user
  const setCurrentUser = (user: UserProfile) => {
    userProfilesComposable.setCurrentUser(user)
  }

  // User profile management
  const createProfile = (userData: CreateUserData) => {
    return userProfilesComposable.createProfile(userData)
  }

  const updateProfile = (userId: string, updates: UpdateUserData) => {
    return userProfilesComposable.updateProfile(userId, updates)
  }

  const getUserProfile = (userId: string) => {
    return userProfilesComposable.getUserProfile(userId)
  }

  // Comment system
  const addComment = (commentData: CommentData) => {
    const user = userProfilesComposable.currentUser.value
    if (!user) {
      throw new Error('User must be logged in to comment')
    }

    const comment = commentsComposable.addComment(commentData, user)

    // Update user contributions
    userProfilesComposable.incrementContributions('comments', 1)

    return comment
  }

  const addReply = (commentId: string, replyData: ReplyData) => {
    const user = userProfilesComposable.currentUser.value
    if (!user) {
      throw new Error('User must be logged in to reply')
    }

    return commentsComposable.addReply(commentId, replyData, user)
  }

  const editComment = (commentId: string, newContent: string) => {
    const user = userProfilesComposable.currentUser.value
    return commentsComposable.editComment(commentId, newContent, user)
  }

  const deleteComment = (commentId: string) => {
    const user = userProfilesComposable.currentUser.value
    return commentsComposable.deleteComment(commentId, user)
  }

  const getCommentsForResource = (resourceId: string) => {
    return commentsComposable.getCommentsForResource(resourceId)
  }

  // Voting system
  const vote = (
    targetType: string,
    targetId: string,
    voteType: 'up' | 'down'
  ) => {
    const user = userProfilesComposable.currentUser.value
    return votingComposable.vote(targetType, targetId, voteType, user)
  }

  // Moderation system
  const flagContent = (
    targetType: string,
    targetId: string,
    reason: string,
    details: string = ''
  ) => {
    const user = userProfilesComposable.currentUser.value
    if (!user) {
      throw new Error('User must be logged in to flag content')
    }
    return moderationComposable.flagContent(
      targetType,
      targetId,
      reason,
      user,
      details
    )
  }

  const moderateContent = (
    flagId: string,
    action: string,
    moderatorNote: string = ''
  ) => {
    const user = userProfilesComposable.currentUser.value
    if (!user) {
      throw new Error('User must be logged in to moderate content')
    }
    return moderationComposable.moderateContent(
      flagId,
      action,
      user,
      moderatorNote
    )
  }

  // Activity and stats
  const getUserActivity = (userId: string) => {
    const userComments = commentsComposable.getUserComments(userId)
    const userVotes = votingComposable.getUserVotes(userId)

    return {
      comments: userComments,
      votes: userVotes,
      totalActivity: userComments.length + userVotes.length,
    }
  }

  const getTopContributors = (limit?: number) => {
    return userProfilesComposable.getTopContributors(limit || 10)
  }

  // Return composable functions (maintaining backward compatibility)
  return {
    // User management
    setCurrentUser,
    createProfile,
    updateProfile,
    getUserProfile,

    // Comment system
    addComment,
    addReply,
    editComment,
    deleteComment,
    getCommentsForResource,

    // Voting system
    vote,

    // Moderation
    flagContent,
    moderateContent,

    // Activity and stats
    getUserActivity,
    getTopContributors,

    // Data access (for backward compatibility)
    users: userProfilesComposable.users,
    comments: commentsComposable.comments,
    votes: votingComposable.votes,
    flags: moderationComposable.flags,
  }
}
