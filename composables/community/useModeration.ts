/**
 * Composable for content moderation
 * Handles flagging, content removal, and moderation actions with O(1) lookups
 */
import { ref, computed } from 'vue'
import type {
  Flag,
  FlagData,
  UserProfile,
  RemoveCommentByModeratorCallback,
  ModerationActionCallback,
} from '~/types/community'

export const useModeration = (
  initialFlags: Flag[] = [],
  removeCommentByModerator?: RemoveCommentByModeratorCallback,
  moderateContentCallback?: ModerationActionCallback
) => {
  // Reactive state
  const flags = ref<Flag[]>([...initialFlags])
  const flagMap = ref<Map<string, Flag>>(new Map())

  // Initialize index
  initialFlags.forEach(flag => {
    flagMap.value.set(flag.id, flag)
  })

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

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
      id: generateId(),
      targetType,
      targetId,
      userId: currentUser.id,
      reason,
      details,
      reportedAt: new Date().toISOString(),
      status: 'pending',
    }

    // O(1) map insertion
    flagMap.value.set(flag.id, flag)
    // O(1) array push (maintains reactive state)
    flags.value.push(flag)

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

    // O(1) map lookup
    const flag = flagMap.value.get(flagId)
    if (!flag) return false

    const updatedFlag: Flag = {
      ...flag,
      status: 'reviewed' as const,
      moderator: currentUser.id,
      moderatorNote,
      actionTaken: action,
    }

    // O(1) map update
    flagMap.value.set(flagId, updatedFlag)

    // Update in array (maintains reactive state)
    const index = flags.value.findIndex(f => f.id === flagId)
    if (index !== -1) {
      flags.value[index] = updatedFlag
    }

    // Take action on flagged content
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
    return flags.value.filter(f => f.flaggedBy === userId)
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

    // O(1) map lookup
    const flag = flagMap.value.get(flagId)
    if (!flag) return false

    const updatedFlag = {
      ...flag,
      status: 'resolved' as const,
      moderator: currentUser.id,
      moderatorNote: resolutionNote || flag.moderatorNote,
    }

    // O(1) map update
    flagMap.value.set(flagId, updatedFlag)

    // Update in array
    const index = flags.value.findIndex(f => f.id === flagId)
    if (index !== -1) {
      flags.value[index] = updatedFlag
    }

    return true
  }

  const updateFlagStatus = (
    flagId: string,
    status: 'pending' | 'reviewed' | 'resolved'
  ): boolean => {
    // O(1) map lookup
    const flag = flagMap.value.get(flagId)
    if (!flag) return false

    const updatedFlag = {
      ...flag,
      status,
    }

    // O(1) map update
    flagMap.value.set(flagId, updatedFlag)

    // Update in array
    const index = flags.value.findIndex(f => f.id === flagId)
    if (index !== -1) {
      flags.value[index] = updatedFlag
    }

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
