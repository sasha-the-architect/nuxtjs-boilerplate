import { describe, it, expect, beforeEach } from 'vitest'
import { useComments } from '~/composables/community/useComments'
import type {
  Comment,
  CommentData,
  ReplyData,
  UserProfile,
} from '~/types/community'

describe('useComments', () => {
  const mockCurrentUser: UserProfile = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    role: 'user',
    joinDate: '2023-01-01',
  }

  const mockCurrentUser2: UserProfile = {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    username: 'janesmith',
    role: 'user',
    joinDate: '2023-01-01',
  }

  let commentsManager: ReturnType<typeof useComments>

  beforeEach(() => {
    commentsManager = useComments([])
  })

  describe('initialization', () => {
    it('should initialize with empty comments array', () => {
      expect(commentsManager.comments.value).toEqual([])
    })

    it('should initialize with provided comments', () => {
      const initialComments: Comment[] = [
        {
          id: 'comment-1',
          resourceId: 'resource-1',
          content: 'Test comment',
          userId: 'user-1',
          userName: 'John Doe',
          timestamp: '2023-01-01T00:00:00.000Z',
          votes: 0,
          replies: [],
          isEdited: false,
          status: 'active',
        },
      ]
      const manager = useComments(initialComments)
      expect(manager.comments.value).toHaveLength(1)
      expect(manager.comments.value[0].id).toBe('comment-1')
    })

    it('should provide addComment function', () => {
      expect(typeof commentsManager.addComment).toBe('function')
    })

    it('should provide addReply function', () => {
      expect(typeof commentsManager.addReply).toBe('function')
    })

    it('should provide editComment function', () => {
      expect(typeof commentsManager.editComment).toBe('function')
    })

    it('should provide deleteComment function', () => {
      expect(typeof commentsManager.deleteComment).toBe('function')
    })

    it('should provide getComment function', () => {
      expect(typeof commentsManager.getComment).toBe('function')
    })

    it('should provide getCommentsForResource function', () => {
      expect(typeof commentsManager.getCommentsForResource).toBe('function')
    })

    it('should provide getUserComments function', () => {
      expect(typeof commentsManager.getUserComments).toBe('function')
    })

    it('should provide updateCommentVotes function', () => {
      expect(typeof commentsManager.updateCommentVotes).toBe('function')
    })

    it('should provide removeCommentByModerator function', () => {
      expect(typeof commentsManager.removeCommentByModerator).toBe('function')
    })
  })

  describe('addComment - Happy Path', () => {
    it('should add a new comment successfully', () => {
      const commentData: CommentData = {
        resourceId: 'resource-1',
        content: 'This is a test comment',
      }

      const addedComment = commentsManager.addComment(
        commentData,
        mockCurrentUser
      )

      expect(addedComment).toBeDefined()
      expect(addedComment.resourceId).toBe('resource-1')
      expect(addedComment.content).toBe('This is a test comment')
      expect(addedComment.userId).toBe('user-1')
      expect(addedComment.userName).toBe('John Doe')
      expect(addedComment.votes).toBe(0)
      expect(addedComment.replies).toEqual([])
      expect(addedComment.isEdited).toBe(false)
      expect(addedComment.status).toBe('active')
      expect(commentsManager.comments.value).toHaveLength(1)
    })

    it('should generate unique ID for new comment', () => {
      const commentData: CommentData = {
        resourceId: 'resource-1',
        content: 'First comment',
      }

      const comment1 = commentsManager.addComment(commentData, mockCurrentUser)
      const comment2 = commentsManager.addComment(commentData, mockCurrentUser)

      expect(comment1.id).not.toBe(comment2.id)
    })

    it('should set timestamp to current time', () => {
      const beforeTime = new Date().toISOString()
      const commentData: CommentData = {
        resourceId: 'resource-1',
        content: 'Test',
      }

      const addedComment = commentsManager.addComment(
        commentData,
        mockCurrentUser
      )
      const afterTime = new Date().toISOString()

      expect(new Date(addedComment.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTime).getTime()
      )
      expect(new Date(addedComment.timestamp).getTime()).toBeLessThanOrEqual(
        new Date(afterTime).getTime()
      )
    })

    it('should add multiple comments to different resources', () => {
      const comment1 = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Comment 1' },
        mockCurrentUser
      )
      const comment2 = commentsManager.addComment(
        { resourceId: 'resource-2', content: 'Comment 2' },
        mockCurrentUser
      )

      expect(commentsManager.comments.value).toHaveLength(2)
      expect(comment1.resourceId).toBe('resource-1')
      expect(comment2.resourceId).toBe('resource-2')
    })
  })

  describe('addComment - Sad Path', () => {
    it('should throw error when user is null', () => {
      const commentData: CommentData = {
        resourceId: 'resource-1',
        content: 'Test comment',
      }

      expect(() => {
        commentsManager.addComment(commentData, null as any)
      }).toThrow('User must be logged in to comment')
    })

    it('should throw error when user is undefined', () => {
      const commentData: CommentData = {
        resourceId: 'resource-1',
        content: 'Test comment',
      }

      expect(() => {
        commentsManager.addComment(commentData, undefined as any)
      }).toThrow('User must be logged in to comment')
    })
  })

  describe('addReply - Happy Path', () => {
    it('should add reply to existing comment', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent comment' },
        mockCurrentUser
      )

      const replyData: ReplyData = {
        content: 'This is a reply',
      }

      const reply = commentsManager.addReply(
        parentComment.id,
        replyData,
        mockCurrentUser
      )

      expect(reply).not.toBeNull()
      expect(reply).toBeDefined()
      expect(reply!.content).toBe('This is a reply')
      expect(reply!.resourceId).toBe('resource-1')
      expect(reply!.userId).toBe('user-1')
      expect(reply!.votes).toBe(0)
      expect(reply!.replies).toEqual([])
      expect(reply!.isEdited).toBe(false)
      expect(reply!.status).toBe('active')
    })

    it('should add reply to comments array via parent', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent comment' },
        mockCurrentUser
      )

      const reply1 = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 1' },
        mockCurrentUser
      )
      const reply2 = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 2' },
        mockCurrentUser
      )

      expect(reply1).not.toBeNull()
      expect(reply2).not.toBeNull()

      const updatedParent = commentsManager.getComment(parentComment.id)
      expect(updatedParent?.replies).toHaveLength(2)
    })

    it('should generate unique ID for reply', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent' },
        mockCurrentUser
      )

      const reply1 = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 1' },
        mockCurrentUser
      )
      const reply2 = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 2' },
        mockCurrentUser
      )

      expect(reply1).not.toBeNull()
      expect(reply2).not.toBeNull()
      expect(reply1!.id).not.toBe(reply2!.id)
    })
  })

  describe('addReply - Sad Path', () => {
    it('should return null for non-existent parent comment', () => {
      const reply = commentsManager.addReply(
        'non-existent-id',
        { content: 'Reply' },
        mockCurrentUser
      )

      expect(reply).toBeNull()
    })

    it('should throw error when user is null', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent' },
        mockCurrentUser
      )

      expect(() => {
        commentsManager.addReply(
          parentComment.id,
          { content: 'Reply' },
          null as any
        )
      }).toThrow('User must be logged in to reply')
    })
  })

  describe('editComment - Happy Path', () => {
    it('should edit comment content successfully', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Original content' },
        mockCurrentUser
      )

      const updatedComment = commentsManager.editComment(
        comment.id,
        'Updated content',
        mockCurrentUser
      )

      expect(updatedComment).toBeDefined()
      expect(updatedComment?.content).toBe('Updated content')
      expect(updatedComment?.isEdited).toBe(true)
      expect(updatedComment?.editedAt).toBeDefined()
    })

    it('should set editedAt timestamp', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Original' },
        mockCurrentUser
      )

      const beforeEdit = new Date()
      const updatedComment = commentsManager.editComment(
        comment.id,
        'Updated',
        mockCurrentUser
      )
      const afterEdit = new Date()

      expect(updatedComment?.editedAt).toBeDefined()
      const editedTime = new Date(updatedComment!.editedAt!)
      expect(editedTime.getTime()).toBeGreaterThanOrEqual(beforeEdit.getTime())
      expect(editedTime.getTime()).toBeLessThanOrEqual(afterEdit.getTime())
    })

    it('should edit reply successfully', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent' },
        mockCurrentUser
      )
      const reply = commentsManager.addReply(
        parentComment.id,
        { content: 'Original reply' },
        mockCurrentUser
      )

      expect(reply).not.toBeNull()

      const updatedReply = commentsManager.editComment(
        reply!.id,
        'Updated reply',
        mockCurrentUser
      )

      expect(updatedReply?.content).toBe('Updated reply')
      expect(updatedReply?.isEdited).toBe(true)
    })
  })

  describe('editComment - Sad Path', () => {
    it('should return null for non-existent comment', () => {
      const updated = commentsManager.editComment(
        'non-existent',
        'Updated',
        mockCurrentUser
      )

      expect(updated).toBeNull()
    })

    it('should return null when editing comment owned by different user', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Original' },
        mockCurrentUser
      )

      const updated = commentsManager.editComment(
        comment.id,
        'Hacked',
        mockCurrentUser2
      )

      expect(updated).toBeNull()
      expect(comment.content).toBe('Original')
    })

    it('should return null when user is null', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Original' },
        mockCurrentUser
      )

      const updated = commentsManager.editComment(
        comment.id,
        'Updated',
        null as any
      )

      expect(updated).toBeNull()
    })
  })

  describe('deleteComment - Happy Path', () => {
    it('should delete comment successfully', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'To be deleted' },
        mockCurrentUser
      )

      const result = commentsManager.deleteComment(comment.id, mockCurrentUser)

      expect(result).toBe(true)
      const updatedComment = commentsManager.getComment(comment.id)
      expect(updatedComment?.status).toBe('removed')
      expect(updatedComment?.content).toBe('[Comment removed by user]')
    })

    it('should delete reply successfully', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent' },
        mockCurrentUser
      )
      const reply = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply to delete' },
        mockCurrentUser
      )

      expect(reply).not.toBeNull()
      commentsManager.deleteComment(reply!.id, mockCurrentUser)

      const updatedReply = commentsManager.getComment(reply!.id)
      expect(updatedReply?.status).toBe('removed')
      expect(updatedReply?.content).toBe('[Comment removed by user]')
    })
  })

  describe('deleteComment - Sad Path', () => {
    it('should return false for non-existent comment', () => {
      const result = commentsManager.deleteComment(
        'non-existent',
        mockCurrentUser
      )

      expect(result).toBe(false)
    })

    it('should return false when deleting comment owned by different user', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Cannot delete' },
        mockCurrentUser
      )

      const result = commentsManager.deleteComment(comment.id, mockCurrentUser2)

      expect(result).toBe(false)
      const updatedComment = commentsManager.getComment(comment.id)
      expect(updatedComment?.status).toBe('active')
    })

    it('should return false when user is null', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Cannot delete' },
        mockCurrentUser
      )

      const result = commentsManager.deleteComment(comment.id, null as any)

      expect(result).toBe(false)
    })
  })

  describe('getComment', () => {
    it('should return comment by ID', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Test' },
        mockCurrentUser
      )

      const found = commentsManager.getComment(comment.id)

      expect(found).toEqual(comment)
    })

    it('should return null for non-existent comment', () => {
      const found = commentsManager.getComment('non-existent')

      expect(found).toBeNull()
    })

    it('should return reply by ID', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent' },
        mockCurrentUser
      )
      const reply = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply' },
        mockCurrentUser
      )

      expect(reply).not.toBeNull()
      const found = commentsManager.getComment(reply!.id)

      expect(found).toEqual(reply)
    })
  })

  describe('getCommentsForResource', () => {
    it('should return comments for specific resource', () => {
      commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Comment 1' },
        mockCurrentUser
      )
      commentsManager.addComment(
        { resourceId: 'resource-2', content: 'Comment 2' },
        mockCurrentUser
      )
      commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Comment 3' },
        mockCurrentUser
      )

      const resource1Comments =
        commentsManager.getCommentsForResource('resource-1')

      expect(resource1Comments).toHaveLength(2)
      expect(resource1Comments.every(c => c.resourceId === 'resource-1')).toBe(
        true
      )
    })

    it('should return empty array for resource with no comments', () => {
      const comments = commentsManager.getCommentsForResource('non-existent')

      expect(comments).toEqual([])
    })

    it('should exclude removed comments', () => {
      const comment1 = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Active' },
        mockCurrentUser
      )
      const comment2 = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'To delete' },
        mockCurrentUser
      )

      commentsManager.deleteComment(comment2.id, mockCurrentUser)

      const comments = commentsManager.getCommentsForResource('resource-1')

      expect(comments).toHaveLength(1)
      expect(comments[0].id).toBe(comment1.id)
    })
  })

  describe('getUserComments', () => {
    it('should return comments for specific user', () => {
      const comment1 = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Comment 1' },
        mockCurrentUser
      )
      commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Comment 2' },
        mockCurrentUser2
      )
      const comment3 = commentsManager.addComment(
        { resourceId: 'resource-2', content: 'Comment 3' },
        mockCurrentUser
      )

      const userComments = commentsManager.getUserComments('user-1')

      expect(userComments).toHaveLength(2)
      expect(userComments.every(c => c.userId === 'user-1')).toBe(true)
    })

    it('should return replies for specific user', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent' },
        mockCurrentUser
      )
      const reply1 = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 1' },
        mockCurrentUser
      )
      commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 2' },
        mockCurrentUser2
      )
      const reply3 = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 3' },
        mockCurrentUser
      )

      expect(reply1).not.toBeNull()
      expect(reply3).not.toBeNull()

      const userComments = commentsManager.getUserComments('user-1')

      expect(userComments).toHaveLength(3)
      expect(userComments.filter(c => c.id === parentComment.id)).toHaveLength(
        1
      )
      expect(userComments.filter(c => c.id === reply1!.id)).toHaveLength(1)
      expect(userComments.filter(c => c.id === reply3!.id)).toHaveLength(1)
    })

    it('should return empty array for user with no comments', () => {
      const comments = commentsManager.getUserComments('non-existent-user')

      expect(comments).toEqual([])
    })

    it('should exclude removed comments', () => {
      const comment1 = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Active' },
        mockCurrentUser
      )
      const comment2 = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'To delete' },
        mockCurrentUser
      )

      commentsManager.deleteComment(comment2.id, mockCurrentUser)

      const userComments = commentsManager.getUserComments('user-1')

      expect(userComments).toHaveLength(1)
      expect(userComments[0].id).toBe(comment1.id)
    })
  })

  describe('updateCommentVotes', () => {
    it('should increase comment votes', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Test' },
        mockCurrentUser
      )

      commentsManager.updateCommentVotes(comment.id, 5)

      const updatedComment = commentsManager.getComment(comment.id)
      expect(updatedComment?.votes).toBe(5)
    })

    it('should decrease comment votes', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Test' },
        mockCurrentUser
      )
      commentsManager.updateCommentVotes(comment.id, 10)

      commentsManager.updateCommentVotes(comment.id, -3)

      const updatedComment = commentsManager.getComment(comment.id)
      expect(updatedComment?.votes).toBe(7)
    })

    it('should handle negative vote count', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Test' },
        mockCurrentUser
      )

      commentsManager.updateCommentVotes(comment.id, -5)

      const updatedComment = commentsManager.getComment(comment.id)
      expect(updatedComment?.votes).toBe(-5)
    })

    it('should update reply votes', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent' },
        mockCurrentUser
      )
      const reply = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply' },
        mockCurrentUser
      )

      expect(reply).not.toBeNull()
      commentsManager.updateCommentVotes(reply!.id, 3)

      const updatedReply = commentsManager.getComment(reply!.id)
      expect(updatedReply?.votes).toBe(3)
    })

    it('should do nothing for non-existent comment', () => {
      commentsManager.updateCommentVotes('non-existent', 5)

      expect(commentsManager.comments.value).toHaveLength(0)
    })
  })

  describe('removeCommentByModerator', () => {
    it('should remove comment by moderator', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Inappropriate content' },
        mockCurrentUser
      )

      const result = commentsManager.removeCommentByModerator(comment.id)

      expect(result).toBe(true)
      const updatedComment = commentsManager.getComment(comment.id)
      expect(updatedComment?.status).toBe('removed')
      expect(updatedComment?.content).toBe('[Content removed by moderator]')
    })

    it('should remove reply by moderator', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent' },
        mockCurrentUser
      )
      const reply = commentsManager.addReply(
        parentComment.id,
        { content: 'Inappropriate reply' },
        mockCurrentUser
      )

      expect(reply).not.toBeNull()
      commentsManager.removeCommentByModerator(reply!.id)

      const updatedReply = commentsManager.getComment(reply!.id)
      expect(updatedReply?.status).toBe('removed')
      expect(updatedReply?.content).toBe('[Content removed by moderator]')
    })

    it('should return false for non-existent comment', () => {
      const result = commentsManager.removeCommentByModerator('non-existent')

      expect(result).toBe(false)
    })

    it('should work for comment owned by any user (moderator override)', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'To remove' },
        mockCurrentUser
      )

      const result = commentsManager.removeCommentByModerator(comment.id)

      expect(result).toBe(true)
      expect(commentsManager.getComment(comment.id)?.status).toBe('removed')
    })
  })

  describe('edge cases', () => {
    it('should handle empty content in addComment', () => {
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: '' },
        mockCurrentUser
      )

      expect(comment.content).toBe('')
      expect(commentsManager.comments.value).toHaveLength(1)
    })

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(10000)
      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: longContent },
        mockCurrentUser
      )

      expect(comment.content).toBe(longContent)
    })

    it('should handle multiple replies to same comment', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Parent' },
        mockCurrentUser
      )

      const reply1 = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 1' },
        mockCurrentUser
      )
      const reply2 = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 2' },
        mockCurrentUser2
      )
      const reply3 = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply 3' },
        mockCurrentUser
      )

      expect(reply1).not.toBeNull()
      expect(reply2).not.toBeNull()
      expect(reply3).not.toBeNull()

      const updatedParent = commentsManager.getComment(parentComment.id)
      expect(updatedParent?.replies).toHaveLength(3)
    })

    it('should preserve reply when editing parent comment', () => {
      const parentComment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Original' },
        mockCurrentUser
      )
      const reply = commentsManager.addReply(
        parentComment.id,
        { content: 'Reply' },
        mockCurrentUser
      )

      expect(reply).not.toBeNull()
      commentsManager.editComment(parentComment.id, 'Updated', mockCurrentUser)

      const updatedParent = commentsManager.getComment(parentComment.id)
      expect(updatedParent?.content).toBe('Updated')
      expect(updatedParent?.replies).toHaveLength(1)
      expect(updatedParent?.replies[0].id).toBe(reply!.id)
    })

    it('should use username when name is not provided', () => {
      const userWithoutName: UserProfile = {
        id: 'user-3',
        name: '',
        email: 'test@test.com',
        username: 'testuser',
        role: 'user',
        joinDate: '2023-01-01',
      }

      const comment = commentsManager.addComment(
        { resourceId: 'resource-1', content: 'Test' },
        userWithoutName
      )

      expect(comment.userName).toBe('testuser')
    })
  })
})
