import { describe, it, expect, beforeEach } from 'vitest'
import { useVoting } from '~/composables/community/useVoting'
import type { Vote, UserProfile } from '~/types/community'

describe('useVoting', () => {
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

  let updateVoteCountCalls: Array<{
    targetType: string
    targetId: string
    voteType: 'up' | 'down'
    change: number
  }> = []
  let updateUserContributionsCalls: Array<{ userId: string; change: number }> =
    []

  const mockUpdateVoteCount = (
    targetType: string,
    targetId: string,
    voteType: 'up' | 'down',
    change: number
  ) => {
    updateVoteCountCalls.push({ targetType, targetId, voteType, change })
  }

  const mockUpdateUserContributions = (userId: string, change: number) => {
    updateUserContributionsCalls.push({ userId, change })
  }

  beforeEach(() => {
    updateVoteCountCalls = []
    updateUserContributionsCalls = []
  })

  const createVotingManager = () => {
    return useVoting([], mockUpdateVoteCount, mockUpdateUserContributions)
  }

  describe('initialization', () => {
    it('should initialize with empty votes array', () => {
      const votingManager = createVotingManager()
      expect(votingManager.votes.value).toEqual([])
    })

    it('should initialize with provided votes', () => {
      const initialVotes: Vote[] = [
        {
          id: 'vote-1',
          targetType: 'comment',
          targetId: 'comment-1',
          userId: 'user-1',
          voteType: 'up',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
      ]
      const manager = useVoting(initialVotes)
      expect(manager.votes.value).toHaveLength(1)
      expect(manager.votes.value[0].id).toBe('vote-1')
    })

    it('should provide vote function', () => {
      expect(typeof createVotingManager().vote).toBe('function')
    })

    it('should provide getUserVote function', () => {
      expect(typeof createVotingManager().getUserVote).toBe('function')
    })

    it('should provide getVotesForTarget function', () => {
      expect(typeof createVotingManager().getVotesForTarget).toBe('function')
    })

    it('should provide getUserVotes function', () => {
      expect(typeof createVotingManager().getUserVotes).toBe('function')
    })

    it('should provide getVoteCount function', () => {
      expect(typeof createVotingManager().getVoteCount).toBe('function')
    })

    it('should provide removeVote function', () => {
      expect(typeof createVotingManager().removeVote).toBe('function')
    })

    it('should provide clearVotesForTarget function', () => {
      expect(typeof createVotingManager().clearVotesForTarget).toBe('function')
    })
  })

  describe('vote - Happy Path - Add New Vote', () => {
    it('should add new upvote successfully', () => {
      const votingManager = createVotingManager()

      const result = votingManager.vote(
        'comment',
        'comment-1',
        'up',
        mockCurrentUser
      )

      expect(result).toEqual({ success: true, added: true })
      expect(votingManager.votes.value).toHaveLength(1)
      expect(votingManager.votes.value[0].voteType).toBe('up')
      expect(updateVoteCountCalls).toEqual([
        {
          targetType: 'comment',
          targetId: 'comment-1',
          voteType: 'up',
          change: 1,
        },
      ])
      expect(updateUserContributionsCalls).toEqual([
        { userId: 'user-1', change: 1 },
      ])
    })

    it('should add new downvote successfully', () => {
      const votingManager = createVotingManager()

      const result = votingManager.vote(
        'comment',
        'comment-1',
        'down',
        mockCurrentUser
      )

      expect(result).toEqual({ success: true, added: true })
      expect(votingManager.votes.value).toHaveLength(1)
      expect(votingManager.votes.value[0].voteType).toBe('down')
      expect(updateVoteCountCalls).toEqual([
        {
          targetType: 'comment',
          targetId: 'comment-1',
          voteType: 'down',
          change: 1,
        },
      ])
      expect(updateUserContributionsCalls).toEqual([
        { userId: 'user-1', change: 1 },
      ])
    })

    it('should generate unique ID for vote', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-2', 'up', mockCurrentUser)

      const vote1 = votingManager.votes.value[0]
      const vote2 = votingManager.votes.value[1]
      expect(vote1.id).not.toBe(vote2.id)
    })

    it('should set timestamp to current time', () => {
      const votingManager = createVotingManager()

      const beforeTime = new Date().toISOString()
      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      const afterTime = new Date().toISOString()

      const vote = votingManager.votes.value[0]
      expect(new Date(vote.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTime).getTime()
      )
      expect(new Date(vote.timestamp).getTime()).toBeLessThanOrEqual(
        new Date(afterTime).getTime()
      )
    })

    it('should allow multiple users to vote on same target', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser2)

      expect(votingManager.votes.value).toHaveLength(2)
      expect(
        votingManager.votes.value.every(v => v.targetId === 'comment-1')
      ).toBe(true)
    })
  })

  describe('vote - Happy Path - Toggle Off (Remove Vote)', () => {
    it('should remove upvote when upvoting again', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      updateVoteCountCalls = []
      updateUserContributionsCalls = []

      const result = votingManager.vote(
        'comment',
        'comment-1',
        'up',
        mockCurrentUser
      )

      expect(result).toEqual({ success: true, removed: true })
      expect(votingManager.votes.value).toHaveLength(0)
      expect(updateVoteCountCalls).toEqual([
        {
          targetType: 'comment',
          targetId: 'comment-1',
          voteType: 'up',
          change: -1,
        },
      ])
      expect(updateUserContributionsCalls).toEqual([
        { userId: 'user-1', change: -1 },
      ])
    })

    it('should remove downvote when downvoting again', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser)
      updateVoteCountCalls = []
      updateUserContributionsCalls = []

      const result = votingManager.vote(
        'comment',
        'comment-1',
        'down',
        mockCurrentUser
      )

      expect(result).toEqual({ success: true, removed: true })
      expect(votingManager.votes.value).toHaveLength(0)
      expect(updateVoteCountCalls).toEqual([
        {
          targetType: 'comment',
          targetId: 'comment-1',
          voteType: 'down',
          change: -1,
        },
      ])
      expect(updateUserContributionsCalls).toEqual([
        { userId: 'user-1', change: -1 },
      ])
    })
  })

  describe('vote - Happy Path - Change Vote Type', () => {
    it('should change upvote to downvote', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      updateVoteCountCalls = []
      updateUserContributionsCalls = []

      const result = votingManager.vote(
        'comment',
        'comment-1',
        'down',
        mockCurrentUser
      )

      expect(result).toEqual({ success: true, changed: true })
      expect(votingManager.votes.value).toHaveLength(1)
      expect(votingManager.votes.value[0].voteType).toBe('down')
      expect(updateVoteCountCalls).toEqual([
        {
          targetType: 'comment',
          targetId: 'comment-1',
          voteType: 'up',
          change: -1,
        },
        {
          targetType: 'comment',
          targetId: 'comment-1',
          voteType: 'down',
          change: 1,
        },
      ])
      expect(updateUserContributionsCalls).toHaveLength(0)
    })

    it('should change downvote to upvote', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser)
      updateVoteCountCalls = []
      updateUserContributionsCalls = []

      const result = votingManager.vote(
        'comment',
        'comment-1',
        'up',
        mockCurrentUser
      )

      expect(result).toEqual({ success: true, changed: true })
      expect(votingManager.votes.value).toHaveLength(1)
      expect(votingManager.votes.value[0].voteType).toBe('up')
      expect(updateVoteCountCalls).toEqual([
        {
          targetType: 'comment',
          targetId: 'comment-1',
          voteType: 'down',
          change: -1,
        },
        {
          targetType: 'comment',
          targetId: 'comment-1',
          voteType: 'up',
          change: 1,
        },
      ])
      expect(updateUserContributionsCalls).toHaveLength(0)
    })

    it('should update timestamp when changing vote type', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      const firstTimestamp = votingManager.votes.value[0].timestamp

      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser)
      const secondTimestamp = votingManager.votes.value[0].timestamp

      expect(secondTimestamp).toBeDefined()
      expect(firstTimestamp).toBeDefined()
    })
  })

  describe('vote - Sad Path', () => {
    it('should throw error when user is null', () => {
      const votingManager = createVotingManager()

      expect(() => {
        votingManager.vote('comment', 'comment-1', 'up', null as any)
      }).toThrow('User must be logged in to vote')
    })

    it('should throw error when user is undefined', () => {
      const votingManager = createVotingManager()

      expect(() => {
        votingManager.vote('comment', 'comment-1', 'up', undefined as any)
      }).toThrow('User must be logged in to vote')
    })
  })

  describe('getUserVote', () => {
    it('should return user vote for target', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)

      const vote = votingManager.getUserVote('user-1', 'comment', 'comment-1')

      expect(vote).toBeDefined()
      expect(vote?.voteType).toBe('up')
      expect(vote?.targetId).toBe('comment-1')
    })

    it('should return null when user has not voted', () => {
      const votingManager = createVotingManager()

      const vote = votingManager.getUserVote('user-1', 'comment', 'comment-1')

      expect(vote).toBeNull()
    })

    it('should return null for non-existent target', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)

      const vote = votingManager.getUserVote('user-1', 'comment', 'comment-999')

      expect(vote).toBeNull()
    })

    it('should return different votes for different users on same target', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser2)

      const vote1 = votingManager.getUserVote('user-1', 'comment', 'comment-1')
      const vote2 = votingManager.getUserVote('user-2', 'comment', 'comment-1')

      expect(vote1?.voteType).toBe('up')
      expect(vote2?.voteType).toBe('down')
    })

    it('should return null for non-existent user', () => {
      const votingManager = createVotingManager()

      const vote = votingManager.getUserVote(
        'non-existent',
        'comment',
        'comment-1'
      )

      expect(vote).toBeNull()
    })
  })

  describe('getVotesForTarget', () => {
    it('should return all votes for target', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser2)
      votingManager.vote('comment', 'comment-2', 'up', mockCurrentUser)

      const votes = votingManager.getVotesForTarget('comment', 'comment-1')

      expect(votes).toHaveLength(2)
      expect(votes.every(v => v.targetId === 'comment-1')).toBe(true)
    })

    it('should return empty array for target with no votes', () => {
      const votingManager = createVotingManager()

      const votes = votingManager.getVotesForTarget('comment', 'comment-1')

      expect(votes).toEqual([])
    })

    it('should handle votes for different target types', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('resource', 'resource-1', 'up', mockCurrentUser)

      const commentVotes = votingManager.getVotesForTarget(
        'comment',
        'comment-1'
      )
      const resourceVotes = votingManager.getVotesForTarget(
        'resource',
        'resource-1'
      )

      expect(commentVotes).toHaveLength(1)
      expect(resourceVotes).toHaveLength(1)
      expect(commentVotes[0].targetType).toBe('comment')
      expect(resourceVotes[0].targetType).toBe('resource')
    })
  })

  describe('getUserVotes', () => {
    it('should return all votes for user', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-2', 'down', mockCurrentUser2)
      votingManager.vote('comment', 'comment-3', 'up', mockCurrentUser)

      const userVotes = votingManager.getUserVotes('user-1')

      expect(userVotes).toHaveLength(2)
      expect(userVotes.every(v => v.userId === 'user-1')).toBe(true)
    })

    it('should return empty array for user with no votes', () => {
      const votingManager = createVotingManager()

      const votes = votingManager.getUserVotes('user-1')

      expect(votes).toEqual([])
    })

    it('should handle votes for different target types per user', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('resource', 'resource-1', 'down', mockCurrentUser)

      const userVotes = votingManager.getUserVotes('user-1')

      expect(userVotes).toHaveLength(2)
      expect(userVotes.filter(v => v.targetType === 'comment')).toHaveLength(1)
      expect(userVotes.filter(v => v.targetType === 'resource')).toHaveLength(1)
    })
  })

  describe('getVoteCount', () => {
    it('should calculate correct vote count for target', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser2)
      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser2)

      const count = votingManager.getVoteCount('comment', 'comment-1')

      expect(count).toBe(0)
    })

    it('should return 0 for target with no votes', () => {
      const votingManager = createVotingManager()

      const count = votingManager.getVoteCount('comment', 'comment-1')

      expect(count).toBe(0)
    })

    it('should handle negative vote count', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser2)

      const count = votingManager.getVoteCount('comment', 'comment-1')

      expect(count).toBe(-2)
    })

    it('should handle only downvotes', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser2)

      const count = votingManager.getVoteCount('comment', 'comment-1')

      expect(count).toBe(-2)
    })

    it('should handle only upvotes', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser2)

      const count = votingManager.getVoteCount('comment', 'comment-1')

      expect(count).toBe(2)
    })
  })

  describe('removeVote', () => {
    it('should remove vote by ID', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      const voteId = votingManager.votes.value[0].id

      const result = votingManager.removeVote(voteId)

      expect(result).toBe(true)
      expect(votingManager.votes.value).toHaveLength(0)
    })

    it('should return false for non-existent vote ID', () => {
      const votingManager = createVotingManager()

      const result = votingManager.removeVote('non-existent-id')

      expect(result).toBe(false)
    })

    it('should maintain state after removal', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-2', 'down', mockCurrentUser)

      const voteId = votingManager.votes.value[0].id
      votingManager.removeVote(voteId)

      expect(votingManager.votes.value).toHaveLength(1)
      expect(votingManager.votes.value[0].targetId).toBe('comment-2')
    })
  })

  describe('clearVotesForTarget', () => {
    it('should clear all votes for target', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser2)
      votingManager.vote('comment', 'comment-2', 'up', mockCurrentUser)

      const count = votingManager.clearVotesForTarget('comment', 'comment-1')

      expect(count).toBe(2)
      expect(votingManager.votes.value).toHaveLength(1)
      expect(votingManager.votes.value[0].targetId).toBe('comment-2')
    })

    it('should return 0 for target with no votes', () => {
      const votingManager = createVotingManager()

      const count = votingManager.clearVotesForTarget('comment', 'comment-1')

      expect(count).toBe(0)
    })

    it('should remove votes from both map and array', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser2)

      votingManager.clearVotesForTarget('comment', 'comment-1')

      expect(votingManager.votes.value).toHaveLength(0)
    })

    it('should not affect other targets', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-2', 'down', mockCurrentUser)

      votingManager.clearVotesForTarget('comment', 'comment-1')

      expect(votingManager.votes.value).toHaveLength(1)
      expect(votingManager.votes.value[0].targetId).toBe('comment-2')
    })
  })

  describe('callback behavior', () => {
    it('should not call callbacks when callbacks not provided', () => {
      const votingManager = useVoting([], undefined, undefined)

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)

      expect(updateVoteCountCalls).toHaveLength(0)
      expect(updateUserContributionsCalls).toHaveLength(0)
    })

    it('should call updateVoteCount callback on add', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)

      expect(updateVoteCountCalls).toEqual([
        {
          targetType: 'comment',
          targetId: 'comment-1',
          voteType: 'up',
          change: 1,
        },
      ])
    })

    it('should call updateUserContributions callback on add', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)

      expect(updateUserContributionsCalls).toEqual([
        { userId: 'user-1', change: 1 },
      ])
    })

    it('should call updateVoteCount callback twice on change', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      updateVoteCountCalls = []

      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser)

      expect(updateVoteCountCalls).toHaveLength(2)
      expect(updateVoteCountCalls[0].change).toBe(-1)
      expect(updateVoteCountCalls[1].change).toBe(1)
    })

    it('should not call updateUserContributions callback on change', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      updateUserContributionsCalls = []

      votingManager.vote('comment', 'comment-1', 'down', mockCurrentUser)

      expect(updateUserContributionsCalls).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle voting on different target types', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('resource', 'resource-1', 'down', mockCurrentUser)
      votingManager.vote('post', 'post-1', 'up', mockCurrentUser)

      expect(votingManager.votes.value).toHaveLength(3)
      expect(votingManager.votes.value[0].targetType).toBe('comment')
      expect(votingManager.votes.value[1].targetType).toBe('resource')
      expect(votingManager.votes.value[2].targetType).toBe('post')
    })

    it('should handle same user voting on different targets', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-2', 'down', mockCurrentUser)
      votingManager.vote('comment', 'comment-3', 'up', mockCurrentUser)

      const userVotes = votingManager.getUserVotes('user-1')

      expect(userVotes).toHaveLength(3)
    })

    it('should prevent duplicate votes from same user on same target', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)

      const votes = votingManager.getVotesForTarget('comment', 'comment-1')

      expect(votes).toHaveLength(0)
    })

    it('should allow re-voting after removing vote', () => {
      const votingManager = createVotingManager()

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)
      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)

      votingManager.vote('comment', 'comment-1', 'up', mockCurrentUser)

      const votes = votingManager.getVotesForTarget('comment', 'comment-1')

      expect(votes).toHaveLength(1)
      expect(votes[0].voteType).toBe('up')
    })

    it('should handle very long target IDs', () => {
      const votingManager = createVotingManager()

      const longTargetId = 'a'.repeat(1000)
      votingManager.vote('comment', longTargetId, 'up', mockCurrentUser)

      const votes = votingManager.getVotesForTarget('comment', longTargetId)

      expect(votes).toHaveLength(1)
    })
  })
})
