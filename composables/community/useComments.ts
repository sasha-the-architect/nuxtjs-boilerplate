/**
 * Composable for comment management
 * Handles comment creation, updates, deletion, and queries with O(1) lookups
 */
import { ref } from 'vue'
import type {
  Comment,
  CommentData,
  ReplyData,
  UserProfile,
} from '~/types/community'
import { generateUniqueId } from '~/utils/id'

export const useComments = (initialComments: Comment[] = []) => {
  // Reactive state
  const comments = ref<Comment[]>([...initialComments])
  const commentMap = ref<Map<string, Comment>>(new Map())

  // Initialize index
  initialComments.forEach(comment => {
    commentMap.value.set(comment.id, comment)
  })

  const addComment = (
    commentData: CommentData,
    currentUser: UserProfile
  ): Comment => {
    if (!currentUser) {
      throw new Error('User must be logged in to comment')
    }

    const comment: Comment = {
      id: generateUniqueId(),
      resourceId: commentData.resourceId,
      content: commentData.content,
      userId: currentUser.id,
      userName: currentUser.name || currentUser.username || currentUser.id,
      timestamp: new Date().toISOString(),
      votes: 0,
      replies: [],
      isEdited: false,
      status: 'active',
    }

    // O(1) map insertion
    commentMap.value.set(comment.id, comment)
    // O(1) array push (maintains reactive state)
    comments.value.push(comment)

    return comment
  }

  const addReply = (
    commentId: string,
    replyData: ReplyData,
    currentUser: UserProfile
  ): Comment | null => {
    if (!currentUser) {
      throw new Error('User must be logged in to reply')
    }

    // O(1) map lookup for parent comment
    const parentComment = commentMap.value.get(commentId)
    if (!parentComment) return null

    const reply: Comment = {
      id: generateUniqueId(),
      resourceId: parentComment.resourceId,
      content: replyData.content,
      userId: currentUser.id,
      userName: currentUser.name || currentUser.username || currentUser.id,
      timestamp: new Date().toISOString(),
      votes: 0,
      replies: [],
      isEdited: false,
      status: 'active',
    }

    // Add reply to parent
    parentComment.replies.push(reply)
    // Index reply
    commentMap.value.set(reply.id, reply)

    // Update parent in array to trigger reactivity
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments.value[index] = { ...parentComment }
    }

    return reply
  }

  const editComment = (
    commentId: string,
    newContent: string,
    currentUser: UserProfile
  ): Comment | null => {
    // O(1) map lookup
    const comment = commentMap.value.get(commentId)
    if (!comment || comment.userId !== currentUser?.id) {
      return null
    }

    const updatedComment = {
      ...comment,
      content: newContent,
      isEdited: true,
      editedAt: new Date().toISOString(),
    }

    // O(1) map update
    commentMap.value.set(commentId, updatedComment)

    // Update in array (maintains reactive state)
    // Could be top-level or nested reply
    const updateInArray = (
      commentArray: Comment[],
      targetId: string,
      updated: Comment
    ): boolean => {
      for (let i = 0; i < commentArray.length; i++) {
        if (commentArray[i].id === targetId) {
          commentArray[i] = updated
          return true
        }
        if (commentArray[i].replies.length > 0) {
          if (updateInArray(commentArray[i].replies, targetId, updated)) {
            commentArray[i] = { ...commentArray[i] }
            return true
          }
        }
      }
      return false
    }

    updateInArray(comments.value, commentId, updatedComment)

    return updatedComment
  }

  const deleteComment = (
    commentId: string,
    currentUser: UserProfile
  ): boolean => {
    // O(1) map lookup
    const comment = commentMap.value.get(commentId)
    if (!comment || comment.userId !== currentUser?.id) {
      return false
    }

    const deletedComment = {
      ...comment,
      status: 'removed' as const,
      content: '[Comment removed by user]',
    }

    // O(1) map update
    commentMap.value.set(commentId, deletedComment)

    // Update in array
    const updateInArray = (
      commentArray: Comment[],
      targetId: string,
      updated: Comment
    ): boolean => {
      for (let i = 0; i < commentArray.length; i++) {
        if (commentArray[i].id === targetId) {
          commentArray[i] = updated
          return true
        }
        if (commentArray[i].replies.length > 0) {
          if (updateInArray(commentArray[i].replies, targetId, updated)) {
            commentArray[i] = { ...commentArray[i] }
            return true
          }
        }
      }
      return false
    }

    updateInArray(comments.value, commentId, deletedComment)

    return true
  }

  const getComment = (commentId: string): Comment | null => {
    // O(1) map lookup
    return commentMap.value.get(commentId) || null
  }

  const getCommentsForResource = (resourceId: string): Comment[] => {
    // O(n) filter on comments array (acceptable as it's a single iteration)
    return comments.value.filter(
      c => c.resourceId === resourceId && c.status !== 'removed'
    )
  }

  const getUserComments = (userId: string): Comment[] => {
    const result: Comment[] = []

    // O(n) traversal to find all user comments
    const traverse = (commentArray: Comment[]) => {
      for (const comment of commentArray) {
        if (comment.userId === userId && comment.status !== 'removed') {
          result.push(comment)
        }
        if (comment.replies.length > 0) {
          traverse(comment.replies)
        }
      }
    }

    traverse(comments.value)
    return result
  }

  const updateCommentVotes = (commentId: string, change: number): void => {
    // O(1) map lookup
    const comment = commentMap.value.get(commentId)
    if (!comment) return

    const updatedComment = {
      ...comment,
      votes: comment.votes + change,
    }

    // O(1) map update
    commentMap.value.set(commentId, updatedComment)

    // Update in array
    const updateInArray = (
      commentArray: Comment[],
      targetId: string,
      updated: Comment
    ): boolean => {
      for (let i = 0; i < commentArray.length; i++) {
        if (commentArray[i].id === targetId) {
          commentArray[i] = updated
          return true
        }
        if (commentArray[i].replies.length > 0) {
          if (updateInArray(commentArray[i].replies, targetId, updated)) {
            commentArray[i] = { ...commentArray[i] }
            return true
          }
        }
      }
      return false
    }

    updateInArray(comments.value, commentId, updatedComment)
  }

  const removeCommentByModerator = (commentId: string): boolean => {
    // O(1) map lookup
    const comment = commentMap.value.get(commentId)
    if (!comment) return false

    const removedComment = {
      ...comment,
      status: 'removed' as const,
      content: '[Content removed by moderator]',
    }

    // O(1) map update
    commentMap.value.set(commentId, removedComment)

    // Update in array
    const updateInArray = (
      commentArray: Comment[],
      targetId: string,
      updated: Comment
    ): boolean => {
      for (let i = 0; i < commentArray.length; i++) {
        if (commentArray[i].id === targetId) {
          commentArray[i] = updated
          return true
        }
        if (commentArray[i].replies.length > 0) {
          if (updateInArray(commentArray[i].replies, targetId, updated)) {
            commentArray[i] = { ...commentArray[i] }
            return true
          }
        }
      }
      return false
    }

    updateInArray(comments.value, commentId, removedComment)

    return true
  }

  return {
    // State
    comments,

    // Actions
    addComment,
    addReply,
    editComment,
    deleteComment,
    getComment,
    getCommentsForResource,
    getUserComments,
    updateCommentVotes,
    removeCommentByModerator,
  }
}
