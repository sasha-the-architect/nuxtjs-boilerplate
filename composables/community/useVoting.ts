/**
 * Composable for voting system
 * Handles upvote/downvote on comments, resources, etc. with O(1) lookups
 */
import { ref } from 'vue'
import type { Vote, UserProfile } from '~/types/community'
import { generateUniqueId } from '~/utils/id'
import type {
  UpdateVoteCountCallback,
  UpdateUserContributionsCallback,
} from '~/types/community'

export const useVoting = (
  initialVotes: Vote[] = [],
  updateVoteCount?: UpdateVoteCountCallback,
  updateUserContributions?: UpdateUserContributionsCallback
) => {
  const votes = ref<Vote[]>([...initialVotes])
  const voteMap = ref<Map<string, Vote>>(new Map())

  initialVotes.forEach(vote => {
    const key = `${vote.userId}_${vote.targetType}_${vote.targetId}`
    voteMap.value.set(key, vote)
  })

  const vote = (
    targetType: string,
    targetId: string,
    voteType: 'up' | 'down',
    currentUser: UserProfile
  ): {
    success: boolean
    added?: boolean
    removed?: boolean
    changed?: boolean
  } => {
    if (!currentUser) {
      throw new Error('User must be logged in to vote')
    }

    // O(1) map lookup for existing vote
    const key = `${currentUser.id}_${targetType}_${targetId}`
    const existingVote = voteMap.value.get(key)

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        votes.value = votes.value.filter(v => v.id !== existingVote.id)
        voteMap.value.delete(key)

        if (updateVoteCount) {
          updateVoteCount(targetType, targetId, voteType, -1)
        }

        if (updateUserContributions) {
          updateUserContributions(currentUser.id, -1)
        }

        return { success: true, removed: true }
      } else {
        const updatedVote = {
          ...existingVote,
          voteType,
          timestamp: new Date().toISOString(),
        }

        voteMap.value.set(key, updatedVote)
        const index = votes.value.findIndex(v => v.id === existingVote.id)
        if (index !== -1) {
          votes.value[index] = updatedVote
        }

        if (updateVoteCount) {
          updateVoteCount(targetType, targetId, existingVote.voteType, -1)
          updateVoteCount(targetType, targetId, voteType, 1)
        }

        return { success: true, changed: true }
      }
    } else {
      const newVote: Vote = {
        id: generateUniqueId(),
        targetType,
        targetId,
        userId: currentUser.id,
        voteType,
        timestamp: new Date().toISOString(),
      }

      voteMap.value.set(key, newVote)
      votes.value.push(newVote)

      if (updateVoteCount) {
        updateVoteCount(targetType, targetId, voteType, 1)
      }

      if (updateUserContributions) {
        updateUserContributions(currentUser.id, 1)
      }

      return { success: true, added: true }
    }
  }

  const getUserVote = (
    userId: string,
    targetType: string,
    targetId: string
  ): Vote | null => {
    // O(1) map lookup
    const key = `${userId}_${targetType}_${targetId}`
    return voteMap.value.get(key) || null
  }

  const getVotesForTarget = (targetType: string, targetId: string): Vote[] => {
    // O(n) filter on votes array (acceptable for target-based queries)
    return votes.value.filter(
      v => v.targetType === targetType && v.targetId === targetId
    )
  }

  const getUserVotes = (userId: string): Vote[] => {
    // O(n) filter on votes array (acceptable for user-based queries)
    return votes.value.filter(v => v.userId === userId)
  }

  const getVoteCount = (targetType: string, targetId: string): number => {
    // O(n) filter and calculate
    const targetVotes = getVotesForTarget(targetType, targetId)
    return targetVotes.reduce((count, vote) => {
      return count + (vote.voteType === 'up' ? 1 : -1)
    }, 0)
  }

  const removeVote = (voteId: string): boolean => {
    const vote = votes.value.find(v => v.id === voteId)
    if (!vote) return false

    const key = `${vote.userId}_${vote.targetType}_${vote.targetId}`

    voteMap.value.delete(key)
    votes.value = votes.value.filter(v => v.id !== voteId)

    return true
  }

  const clearVotesForTarget = (
    targetType: string,
    targetId: string
  ): number => {
    // Find all votes for target
    const targetVoteIds = votes.value
      .filter(v => v.targetType === targetType && v.targetId === targetId)
      .map(v => v.id)

    // Remove from map
    votes.value.forEach(vote => {
      if (targetVoteIds.includes(vote.id)) {
        const key = `${vote.userId}_${vote.targetType}_${vote.targetId}`
        voteMap.value.delete(key)
      }
    })

    // Remove from array
    votes.value = votes.value.filter(v => !targetVoteIds.includes(v.id))

    return targetVoteIds.length
  }

  return {
    // State
    votes,

    // Actions
    vote,
    getUserVote,
    getVotesForTarget,
    getUserVotes,
    getVoteCount,
    removeVote,
    clearVotesForTarget,
  }
}
