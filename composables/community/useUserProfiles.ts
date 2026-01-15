/**
 * Composable for user profile management
 * Handles user creation, updates, and queries with O(1) lookups
 */
import { ref, computed } from 'vue'
import { generateUniqueId } from '~/utils/id'
import type {
  UserProfile,
  CreateUserData,
  UpdateUserData,
} from '~/types/community'

export const useUserProfiles = (initialUsers: UserProfile[] = []) => {
  // Reactive state
  const users = ref<UserProfile[]>([...initialUsers])
  const userMap = ref<Map<string, UserProfile>>(new Map())

  // Initialize index
  initialUsers.forEach(user => {
    userMap.value.set(user.id, user)
  })

  const currentUser = ref<UserProfile | null>(null)

  const setCurrentUser = (user: UserProfile | null) => {
    currentUser.value = user
  }

  const createProfile = (userData: CreateUserData): UserProfile => {
    const profile: UserProfile = {
      id: generateUniqueId(),
      name: userData.name,
      email: userData.email,
      username: userData.username,
      role: userData.role || 'user',
      isModerator: false,
      joinDate: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      reputation: 0,
      contributions: 0,
      contributionsDetail: {
        comments: 0,
        resources: 0,
        votes: 0,
      },
      privacy: {
        showEmail: false,
        showActivity: true,
      },
    }

    // O(1) map insertion
    userMap.value.set(profile.id, profile)
    // O(1) array push (maintains reactive state)
    users.value.push(profile)

    return profile
  }

  const updateProfile = (
    userId: string,
    updates: UpdateUserData
  ): UserProfile | null => {
    // O(1) map lookup
    const user = userMap.value.get(userId)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      privacy: updates.privacy
        ? { ...user.privacy, ...updates.privacy }
        : user.privacy,
    }

    // O(1) map update
    userMap.value.set(userId, updatedUser)

    // Find and update in array (maintains reactive state)
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value[index] = updatedUser
    }

    return updatedUser
  }

  const incrementContributions = (
    userId: string,
    type: 'comments' | 'resources' | 'votes',
    amount: number = 1
  ): void => {
    // O(1) map lookup
    const user = userMap.value.get(userId)
    if (!user) return

    user.contributionsDetail[type] += amount
    user.contributions = (user.contributions || 0) + amount

    // Update in array
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value[index] = { ...user }
    }
  }

  const updateReputation = (userId: string, amount: number): void => {
    // O(1) map lookup
    const user = userMap.value.get(userId)
    if (!user) return

    user.reputation = (user.reputation || 0) + amount

    // Update in array
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value[index] = { ...user }
    }
  }

  const getUserProfile = (userId: string): UserProfile | null => {
    // O(1) map lookup
    return userMap.value.get(userId) || null
  }

  const setModeratorStatus = (
    userId: string,
    isModerator: boolean
  ): boolean => {
    // O(1) map lookup
    const user = userMap.value.get(userId)
    if (!user) return false

    user.isModerator = isModerator

    // Update in array
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value[index] = { ...user }
    }

    return true
  }

  const getTopContributors = computed(() => (limit: number = 10) => {
    return [...users.value]
      .sort((a, b) => (b.reputation || 0) - (a.reputation || 0))
      .slice(0, limit)
  })

  return {
    // State
    users,
    currentUser,

    // Actions
    setCurrentUser,
    createProfile,
    updateProfile,
    incrementContributions,
    updateReputation,
    getUserProfile,
    setModeratorStatus,

    // Computed
    getTopContributors,
  }
}
