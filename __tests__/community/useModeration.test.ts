import { describe, it, expect, beforeEach } from 'vitest'
import { useModeration } from '~/composables/community/useModeration'
import type { UserProfile, Flag } from '~/types/community'

describe('useModeration', () => {
  const mockRegularUser: UserProfile = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    role: 'user',
    isModerator: false,
    joinDate: '2023-01-01T00:00:00.000Z',
  }

  const mockModerator: UserProfile = {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    username: 'janesmith',
    role: 'moderator',
    isModerator: true,
    joinDate: '2023-01-01T00:00:00.000Z',
  }

  let removeCommentCalls: string[] = []

  const mockRemoveCommentByModerator = (commentId: string): boolean => {
    removeCommentCalls.push(commentId)
    return true
  }

  beforeEach(() => {
    removeCommentCalls = []
  })

  describe('initialization', () => {
    it('should initialize with empty flags array', () => {
      const moderationManager = useModeration([])
      expect(moderationManager.flags.value).toEqual([])
      expect(moderationManager.pendingFlags.value).toEqual([])
    })

    it('should initialize with provided flags', () => {
      const initialFlags: Flag[] = [
        {
          id: 'flag-1',
          targetType: 'comment',
          targetId: 'comment-1',
          userId: 'user-1',
          reason: 'spam',
          reportedAt: '2023-01-01T00:00:00.000Z',
          status: 'pending',
        },
      ]
      const manager = useModeration(initialFlags)
      expect(manager.flags.value).toHaveLength(1)
      expect(manager.flags.value[0].id).toBe('flag-1')
    })

    it('should provide flagContent function', () => {
      expect(typeof useModeration([]).flagContent).toBe('function')
    })

    it('should provide moderateContent function', () => {
      expect(typeof useModeration([]).moderateContent).toBe('function')
    })

    it('should provide getFlag function', () => {
      expect(typeof useModeration([]).getFlag).toBe('function')
    })

    it('should provide getFlagsForTarget function', () => {
      expect(typeof useModeration([]).getFlagsForTarget).toBe('function')
    })

    it('should provide getFlagsByStatus function', () => {
      expect(typeof useModeration([]).getFlagsByStatus).toBe('function')
    })

    it('should provide getUserFlags function', () => {
      expect(typeof useModeration([]).getUserFlags).toBe('function')
    })

    it('should provide getModeratedBy function', () => {
      expect(typeof useModeration([]).getModeratedBy).toBe('function')
    })

    it('should provide resolveFlag function', () => {
      expect(typeof useModeration([]).resolveFlag).toBe('function')
    })

    it('should provide updateFlagStatus function', () => {
      expect(typeof useModeration([]).updateFlagStatus).toBe('function')
    })
  })

  describe('flagContent', () => {
    it('should create a flag for content', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser,
        'This is spam content'
      )

      expect(flag.id).toBeDefined()
      expect(flag.targetType).toBe('comment')
      expect(flag.targetId).toBe('comment-1')
      expect(flag.userId).toBe('user-1')
      expect(flag.reason).toBe('spam')
      expect(flag.details).toBe('This is spam content')
      expect(flag.status).toBe('pending')
    })

    it('should add flag to flags array', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      manager.flagContent('comment', 'comment-1', 'spam', mockRegularUser)

      expect(manager.flags.value).toHaveLength(1)
      expect(manager.pendingFlags.value).toHaveLength(1)
    })

    it('should throw error if user is not logged in', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)

      expect(() => {
        manager.flagContent('comment', 'comment-1', 'spam', null as any)
      }).toThrow('User must be logged in to flag content')
    })

    it('should generate unique flag IDs', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag1 = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )
      const flag2 = manager.flagContent(
        'comment',
        'comment-2',
        'spam',
        mockRegularUser
      )

      expect(flag1.id).not.toBe(flag2.id)
    })

    it('should include timestamp in flag', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const beforeTime = new Date().toISOString()
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )
      const afterTime = new Date().toISOString()

      expect(flag.reportedAt).toBeDefined()
      expect(flag.reportedAt >= beforeTime).toBe(true)
      expect(flag.reportedAt <= afterTime).toBe(true)
    })
  })

  describe('moderateContent', () => {
    it('should moderate content when flag exists', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      const result = manager.moderateContent(
        flag.id,
        'removed',
        mockModerator,
        'Spam content'
      )

      expect(result).toBe(true)
      const moderatedFlag = manager.getFlag(flag.id)
      expect(moderatedFlag?.status).toBe('reviewed')
      expect(moderatedFlag?.moderator).toBe('user-2')
      expect(moderatedFlag?.actionTaken).toBe('removed')
      expect(moderatedFlag?.moderatorNote).toBe('Spam content')
    })

    it('should call removeCommentByModerator callback for comment removal', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      manager.moderateContent(flag.id, 'removed', mockModerator)

      expect(removeCommentCalls).toHaveLength(1)
      expect(removeCommentCalls[0]).toBe('comment-1')
    })

    it('should not call removeCommentByModerator for other actions', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      manager.moderateContent(flag.id, 'approved', mockModerator)

      expect(removeCommentCalls).toHaveLength(0)
    })

    it('should not call removeCommentByModerator for non-comment targets', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'resource',
        'resource-1',
        'spam',
        mockRegularUser
      )

      manager.moderateContent(flag.id, 'removed', mockModerator)

      expect(removeCommentCalls).toHaveLength(0)
    })

    it('should return false for non-existent flag', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)

      const result = manager.moderateContent(
        'non-existent-flag',
        'removed',
        mockModerator
      )

      expect(result).toBe(false)
    })

    it('should throw error if user is not a moderator', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      expect(() => {
        manager.moderateContent(flag.id, 'removed', mockRegularUser)
      }).toThrow('User must be a moderator to moderate content')
    })

    it('should throw error if user is null', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      expect(() => {
        manager.moderateContent(flag.id, 'removed', null as any)
      }).toThrow('User must be a moderator to moderate content')
    })

    it('should update flag in both array and map', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      manager.moderateContent(flag.id, 'removed', mockModerator)

      const arrayFlag = manager.flags.value.find(f => f.id === flag.id)
      const mapFlag = manager.getFlag(flag.id)

      expect(arrayFlag?.status).toBe('reviewed')
      expect(mapFlag?.status).toBe('reviewed')
    })
  })

  describe('getFlag', () => {
    it('should return flag by ID', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      const retrieved = manager.getFlag(flag.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(flag.id)
    })

    it('should return null for non-existent flag', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)

      const retrieved = manager.getFlag('non-existent-flag')

      expect(retrieved).toBeNull()
    })
  })

  describe('getFlagsForTarget', () => {
    it('should return flags for specific target', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      manager.flagContent('comment', 'comment-1', 'spam', mockRegularUser)
      manager.flagContent('comment', 'comment-1', 'abuse', mockRegularUser)
      manager.flagContent('comment', 'comment-2', 'spam', mockRegularUser)

      const flags = manager.getFlagsForTarget('comment', 'comment-1')

      expect(flags).toHaveLength(2)
      expect(flags.every(f => f.targetId === 'comment-1')).toBe(true)
    })

    it('should filter by status when provided', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag1 = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )
      manager.flagContent('comment', 'comment-1', 'abuse', mockRegularUser)
      manager.moderateContent(flag1.id, 'removed', mockModerator)

      const pendingFlags = manager.getFlagsForTarget(
        'comment',
        'comment-1',
        'pending'
      )
      const reviewedFlags = manager.getFlagsForTarget(
        'comment',
        'comment-1',
        'reviewed'
      )

      expect(pendingFlags).toHaveLength(1)
      expect(reviewedFlags).toHaveLength(1)
    })

    it('should return empty array for no matching flags', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)

      const flags = manager.getFlagsForTarget('comment', 'non-existent')

      expect(flags).toEqual([])
    })
  })

  describe('getFlagsByStatus', () => {
    it('should return flags by status', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag1 = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )
      const flag2 = manager.flagContent(
        'comment',
        'comment-2',
        'abuse',
        mockRegularUser
      )
      const _flag3 = manager.flagContent(
        'comment',
        'comment-3',
        'spam',
        mockRegularUser
      )

      manager.moderateContent(flag1.id, 'removed', mockModerator)
      manager.resolveFlag(flag2.id, mockModerator)

      const pendingFlags = manager.getFlagsByStatus('pending')
      const reviewedFlags = manager.getFlagsByStatus('reviewed')
      const resolvedFlags = manager.getFlagsByStatus('resolved')

      expect(pendingFlags).toHaveLength(1)
      expect(reviewedFlags).toHaveLength(1)
      expect(resolvedFlags).toHaveLength(1)
    })

    it('should return empty array for no flags with status', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)

      const flags = manager.getFlagsByStatus('pending')

      expect(flags).toEqual([])
    })
  })

  describe('getUserFlags', () => {
    it('should return flags created by specific user', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      manager.flagContent('comment', 'comment-1', 'spam', mockRegularUser)
      manager.flagContent('comment', 'comment-1', 'abuse', mockRegularUser)
      manager.flagContent('comment', 'comment-3', 'spam', mockModerator)

      const userFlags = manager.getUserFlags('user-1')

      expect(userFlags).toHaveLength(2)
      expect(userFlags.every(f => f.userId === 'user-1')).toBe(true)
    })

    it('should return empty array for user with no flags', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)

      const flags = manager.getUserFlags('non-existent-user')

      expect(flags).toEqual([])
    })
  })

  describe('getModeratedBy', () => {
    it('should return flags moderated by specific moderator', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag1 = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )
      const flag2 = manager.flagContent(
        'comment',
        'comment-2',
        'abuse',
        mockRegularUser
      )
      const flag3 = manager.flagContent(
        'comment',
        'comment-3',
        'spam',
        mockRegularUser
      )

      manager.moderateContent(flag1.id, 'removed', mockModerator)
      manager.moderateContent(flag2.id, 'approved', mockModerator)
      manager.resolveFlag(flag3.id, mockModerator)

      const moderatedFlags = manager.getModeratedBy('user-2')

      expect(moderatedFlags).toHaveLength(3)
      expect(moderatedFlags.every(f => f.moderator === 'user-2')).toBe(true)
    })

    it('should return empty array for moderator with no actions', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)

      const flags = manager.getModeratedBy('non-existent-moderator')

      expect(flags).toEqual([])
    })
  })

  describe('pendingFlags computed', () => {
    it('should return only pending flags', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag1 = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )
      const flag2 = manager.flagContent(
        'comment',
        'comment-2',
        'abuse',
        mockRegularUser
      )
      const flag3 = manager.flagContent(
        'comment',
        'comment-3',
        'spam',
        mockRegularUser
      )

      manager.moderateContent(flag1.id, 'removed', mockModerator)
      manager.resolveFlag(flag2.id, mockModerator)

      expect(manager.pendingFlags.value).toHaveLength(1)
      expect(manager.pendingFlags.value[0].id).toBe(flag3.id)
    })

    it('should be reactive to flag status changes', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      expect(manager.pendingFlags.value).toHaveLength(1)

      manager.moderateContent(flag.id, 'removed', mockModerator)

      expect(manager.pendingFlags.value).toHaveLength(0)
    })
  })

  describe('resolveFlag', () => {
    it('should resolve flag when user is moderator', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      const result = manager.resolveFlag(flag.id, mockModerator, 'No violation')

      expect(result).toBe(true)
      const resolvedFlag = manager.getFlag(flag.id)
      expect(resolvedFlag?.status).toBe('resolved')
      expect(resolvedFlag?.moderator).toBe('user-2')
      expect(resolvedFlag?.moderatorNote).toBe('No violation')
    })

    it('should return false for non-existent flag', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)

      const result = manager.resolveFlag('non-existent-flag', mockModerator)

      expect(result).toBe(false)
    })

    it('should throw error if user is not a moderator', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      expect(() => {
        manager.resolveFlag(flag.id, mockRegularUser)
      }).toThrow('User must be a moderator to resolve flags')
    })

    it('should throw error if user is null', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      expect(() => {
        manager.resolveFlag(flag.id, null as any)
      }).toThrow('User must be a moderator to resolve flags')
    })

    it('should preserve existing moderator note if not provided', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      manager.moderateContent(
        flag.id,
        'reviewed',
        mockModerator,
        'Initial note'
      )
      manager.resolveFlag(flag.id, mockModerator)

      const resolvedFlag = manager.getFlag(flag.id)
      expect(resolvedFlag?.moderatorNote).toBe('Initial note')
    })
  })

  describe('updateFlagStatus', () => {
    it('should update flag status', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      const result = manager.updateFlagStatus(flag.id, 'reviewed')

      expect(result).toBe(true)
      const updatedFlag = manager.getFlag(flag.id)
      expect(updatedFlag?.status).toBe('reviewed')
    })

    it('should update to different statuses', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      expect(manager.updateFlagStatus(flag.id, 'reviewed')).toBe(true)
      expect(manager.updateFlagStatus(flag.id, 'resolved')).toBe(true)
      expect(manager.updateFlagStatus(flag.id, 'pending')).toBe(true)

      expect(manager.getFlag(flag.id)?.status).toBe('pending')
    })

    it('should return false for non-existent flag', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)

      const result = manager.updateFlagStatus('non-existent-flag', 'reviewed')

      expect(result).toBe(false)
    })

    it('should update flag in both array and map', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      manager.updateFlagStatus(flag.id, 'reviewed')

      const arrayFlag = manager.flags.value.find(f => f.id === flag.id)
      const mapFlag = manager.getFlag(flag.id)

      expect(arrayFlag?.status).toBe('reviewed')
      expect(mapFlag?.status).toBe('reviewed')
    })

    it('should be reactive for pendingFlags computed', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      expect(manager.pendingFlags.value).toHaveLength(1)

      manager.updateFlagStatus(flag.id, 'resolved')

      expect(manager.pendingFlags.value).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle flagging same target multiple times', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      manager.flagContent('comment', 'comment-1', 'spam', mockRegularUser)
      manager.flagContent('comment', 'comment-1', 'abuse', mockRegularUser)
      manager.flagContent('comment', 'comment-1', 'offensive', mockRegularUser)

      const flags = manager.getFlagsForTarget('comment', 'comment-1')
      expect(flags).toHaveLength(3)
    })

    it('should handle empty flag details', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      expect(flag.details).toBe('')
    })

    it('should handle multiple moderators moderating different flags', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag1 = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )
      const flag2 = manager.flagContent(
        'comment',
        'comment-2',
        'abuse',
        mockRegularUser
      )

      const moderator2: UserProfile = {
        ...mockModerator,
        id: 'user-3',
        name: 'Bob Admin',
      }

      manager.moderateContent(flag1.id, 'removed', mockModerator)
      manager.moderateContent(flag2.id, 'removed', moderator2)

      const moderatedByMod1 = manager.getModeratedBy('user-2')
      const moderatedByMod2 = manager.getModeratedBy('user-3')

      expect(moderatedByMod1).toHaveLength(1)
      expect(moderatedByMod2).toHaveLength(1)
    })

    it('should handle flag without callback', () => {
      const manager = useModeration([])
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      expect(() => {
        manager.moderateContent(flag.id, 'removed', mockModerator)
      }).not.toThrow()
    })

    it('should handle multiple status transitions', () => {
      const manager = useModeration([], mockRemoveCommentByModerator)
      const flag = manager.flagContent(
        'comment',
        'comment-1',
        'spam',
        mockRegularUser
      )

      manager.updateFlagStatus(flag.id, 'reviewed')
      manager.updateFlagStatus(flag.id, 'resolved')
      manager.updateFlagStatus(flag.id, 'pending')

      expect(manager.getFlag(flag.id)?.status).toBe('pending')
    })
  })

  describe('performance and O(1) lookups', () => {
    it('should handle large number of flags efficiently', () => {
      const initialFlags: Flag[] = []
      for (let i = 0; i < 1000; i++) {
        initialFlags.push({
          id: `flag-${i}`,
          targetType: 'comment',
          targetId: `comment-${i % 10}`,
          userId: `user-${i % 100}`,
          reason: 'spam',
          reportedAt: '2023-01-01T00:00:00.000Z',
          status: 'pending',
        })
      }

      const manager = useModeration(initialFlags)
      const specificFlag = manager.getFlag('flag-500')

      expect(specificFlag).toBeDefined()
      expect(specificFlag?.id).toBe('flag-500')
    })

    it('should update flags efficiently in large dataset', () => {
      const initialFlags: Flag[] = []
      for (let i = 0; i < 1000; i++) {
        initialFlags.push({
          id: `flag-${i}`,
          targetType: 'comment',
          targetId: `comment-${i}`,
          userId: 'user-1',
          reason: 'spam',
          reportedAt: '2023-01-01T00:00:00.000Z',
          status: 'pending',
        })
      }

      const manager = useModeration(initialFlags)
      const result = manager.updateFlagStatus('flag-500', 'reviewed')

      expect(result).toBe(true)
      expect(manager.getFlag('flag-500')?.status).toBe('reviewed')
    })
  })
})
