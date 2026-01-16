/**
 * Composable for content moderation
 * Handles flagging, content removal, and moderation actions with O(1) lookups
 */
import { ref, computed } from 'vue'
import { generateUniqueId } from '~/utils/id'
import {
  addToArrayMap,
  updateInArrayMap,
  initializeMapFromArray,
} from '~/utils/collection-utils'
import type {
  Flag,
  UserProfile,
  RemoveCommentByModeratorCallback,
} from '~/types/community'

export const useModeration = (
  initialFlags: Flag[] = [],
  removeCommentByModerator?: RemoveCommentByModeratorCallback
) => {
  const flags = ref<Flag[]>([...initialFlags])
  const flagMap = ref<Map<string, Flag>>(initializeMapFromArray(initialFlags))

  const flagContent = (
    targetType: string,
    targetId: string,
    reason: string,
    currentUser: UserProfile,
    details: string = ''
  ): Flag => {
    if (!currentUser) {
      throw new Error('User must be logged in to flag content')
    }

    const flag: Flag = {
      id: generateUniqueId(),
      targetType,
      targetId,
      userId: currentUser.id,
      reason,
      details,
      reportedAt: new Date().toISOString(),
      status: 'pending',
    }

    addToArrayMap(flags, flagMap, flag)

    return flag
  }

  const moderateContent = (
    flagId: string,
    action: string,
    currentUser: UserProfile,
    moderatorNote: string = ''
  ): boolean => {
    if (!currentUser || !currentUser.isModerator) {
      throw new Error('User must be a moderator to moderate content')
    }

    const flag = flagMap.value.get(flagId)
    if (!flag) return false

    const updatedFlag: Flag = {
      ...flag,
      status: 'reviewed' as const,
      moderator: currentUser.id,
      moderatorNote,
      actionTaken: action,
    }

    updateInArrayMap(flags, flagMap, flagId, updatedFlag)

    if (flag.targetType === 'comment' && action === 'removed') {
      if (removeCommentByModerator) {
        removeCommentByModerator(flag.targetId)
      }
    }

    return true
  }

  const getFlag = (flagId: string): Flag | null => {
    // O(1) map lookup
    return flagMap.value.get(flagId) || null
  }

  const getFlagsForTarget = (
    targetType: string,
    targetId: string,
    status?: 'pending' | 'reviewed' | 'resolved'
  ): Flag[] => {
    // O(n) filter on flags array (acceptable for target-based queries)
    return flags.value.filter(
      f =>
        f.targetType === targetType &&
        f.targetId === targetId &&
        (!status || f.status === status)
    )
  }

  const getFlagsByStatus = (
    status: 'pending' | 'reviewed' | 'resolved'
  ): Flag[] => {
    // O(n) filter on flags array (acceptable for status-based queries)
    return flags.value.filter(f => f.status === status)
  }

  const getUserFlags = (userId: string): Flag[] => {
    // O(n) filter on flags array (acceptable for user-based queries)
    return flags.value.filter(f => f.userId === userId)
  }

  const getModeratedBy = (moderatorId: string): Flag[] => {
    // O(n) filter on flags array (acceptable for moderator-based queries)
    return flags.value.filter(f => f.moderator === moderatorId)
  }

  const pendingFlags = computed(() => {
    return flags.value.filter(f => f.status === 'pending')
  })

  const resolveFlag = (
    flagId: string,
    currentUser: UserProfile,
    resolutionNote?: string
  ): boolean => {
    if (!currentUser || !currentUser.isModerator) {
      throw new Error('User must be a moderator to resolve flags')
    }

    const flag = flagMap.value.get(flagId)
    if (!flag) return false

    const updatedFlag = {
      ...flag,
      status: 'resolved' as const,
      moderator: currentUser.id,
      moderatorNote: resolutionNote || flag.moderatorNote,
    }

    updateInArrayMap(flags, flagMap, flagId, updatedFlag)

    return true
  }

  const updateFlagStatus = (
    flagId: string,
    status: 'pending' | 'reviewed' | 'resolved'
  ): boolean => {
    const flag = flagMap.value.get(flagId)
    if (!flag) return false

    const updatedFlag = {
      ...flag,
      status,
    }

    updateInArrayMap(flags, flagMap, flagId, updatedFlag)

    return true
  }

  return {
    // State
    flags,
    pendingFlags,

    // Actions
    flagContent,
    moderateContent,
    getFlag,
    getFlagsForTarget,
    getFlagsByStatus,
    getUserFlags,
    getModeratedBy,
    resolveFlag,
    updateFlagStatus,
  }
}
