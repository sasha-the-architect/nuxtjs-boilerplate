import { describe, it, expect, beforeEach } from 'vitest'
import { useUserProfiles } from '~/composables/community/useUserProfiles'
import type {
  UserProfile,
  CreateUserData,
  UpdateUserData,
} from '~/types/community'

describe('useUserProfiles', () => {
  const mockUser: UserProfile = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    role: 'user',
    isModerator: false,
    joinDate: '2023-01-01T00:00:00.000Z',
    joinedAt: '2023-01-01T00:00:00.000Z',
    reputation: 100,
    contributions: 50,
    contributionsDetail: {
      comments: 20,
      resources: 15,
      votes: 15,
    },
    privacy: {
      showEmail: false,
      showActivity: true,
    },
  }

  const mockModerator: UserProfile = {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    username: 'janesmith',
    role: 'moderator',
    isModerator: true,
    joinDate: '2023-01-01T00:00:00.000Z',
    joinedAt: '2023-01-01T00:00:00.000Z',
    reputation: 500,
    contributions: 200,
    contributionsDetail: {
      comments: 100,
      resources: 50,
      votes: 50,
    },
    privacy: {
      showEmail: true,
      showActivity: true,
    },
  }

  beforeEach(() => {})

  describe('initialization', () => {
    it('should initialize with empty users array', () => {
      const profileManager = useUserProfiles([])
      expect(profileManager.users.value).toEqual([])
      expect(profileManager.currentUser.value).toBeNull()
    })

    it('should initialize with provided users', () => {
      const initialUsers: UserProfile[] = [mockUser, mockModerator]
      const manager = useUserProfiles(initialUsers)
      expect(manager.users.value).toHaveLength(2)
      expect(manager.users.value[0].id).toBe('user-1')
      expect(manager.users.value[1].id).toBe('user-2')
    })

    it('should provide setCurrentUser function', () => {
      expect(typeof useUserProfiles([]).setCurrentUser).toBe('function')
    })

    it('should provide createProfile function', () => {
      expect(typeof useUserProfiles([]).createProfile).toBe('function')
    })

    it('should provide updateProfile function', () => {
      expect(typeof useUserProfiles([]).updateProfile).toBe('function')
    })

    it('should provide incrementContributions function', () => {
      expect(typeof useUserProfiles([]).incrementContributions).toBe('function')
    })

    it('should provide updateReputation function', () => {
      expect(typeof useUserProfiles([]).updateReputation).toBe('function')
    })

    it('should provide getUserProfile function', () => {
      expect(typeof useUserProfiles([]).getUserProfile).toBe('function')
    })

    it('should provide setModeratorStatus function', () => {
      expect(typeof useUserProfiles([]).setModeratorStatus).toBe('function')
    })

    it('should provide getTopContributors computed', () => {
      expect(typeof useUserProfiles([]).getTopContributors).toBe('object')
    })
  })

  describe('setCurrentUser', () => {
    it('should set current user', () => {
      const manager = useUserProfiles([])
      manager.setCurrentUser(mockUser)

      expect(manager.currentUser.value).toEqual(mockUser)
    })

    it('should allow setting null for current user', () => {
      const manager = useUserProfiles([])
      manager.setCurrentUser(mockUser)
      manager.setCurrentUser(null)

      expect(manager.currentUser.value).toBeNull()
    })
  })

  describe('createProfile', () => {
    it('should create a new user profile', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'Alice Brown',
        email: 'alice@example.com',
        username: 'alicebrown',
      }

      const profile = manager.createProfile(userData)

      expect(profile.id).toBeDefined()
      expect(profile.name).toBe('Alice Brown')
      expect(profile.email).toBe('alice@example.com')
      expect(profile.username).toBe('alicebrown')
      expect(profile.role).toBe('user')
      expect(profile.isModerator).toBe(false)
    })

    it('should set default values for new profile', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'Bob Wilson',
        email: 'bob@example.com',
      }

      const profile = manager.createProfile(userData)

      expect(profile.contributions).toBe(0)
      expect(profile.reputation).toBe(0)
      expect(profile.isModerator).toBe(false)
      expect(profile.contributionsDetail).toEqual({
        comments: 0,
        resources: 0,
        votes: 0,
      })
      expect(profile.privacy).toEqual({
        showEmail: false,
        showActivity: true,
      })
    })

    it('should add profile to users array', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'Charlie Davis',
        email: 'charlie@example.com',
      }

      manager.createProfile(userData)

      expect(manager.users.value).toHaveLength(1)
      expect(manager.users.value[0].name).toBe('Charlie Davis')
    })

    it('should include timestamps for new profile', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'Diana Evans',
        email: 'diana@example.com',
      }

      const beforeTime = new Date().toISOString()
      const profile = manager.createProfile(userData)
      const afterTime = new Date().toISOString()

      expect(profile.joinDate).toBeDefined()
      expect(profile.joinedAt).toBeDefined()
      expect(profile.joinDate >= beforeTime).toBe(true)
      expect(profile.joinDate <= afterTime).toBe(true)
    })

    it('should allow setting role on creation', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'Eve Foster',
        email: 'eve@example.com',
        role: 'admin',
      }

      const profile = manager.createProfile(userData)

      expect(profile.role).toBe('admin')
    })

    it('should generate unique user IDs', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'Test User',
        email: 'test@example.com',
      }

      const profile1 = manager.createProfile(userData)
      const profile2 = manager.createProfile({
        ...userData,
        email: 'test2@example.com',
      })

      expect(profile1.id).not.toBe(profile2.id)
    })
  })

  describe('updateProfile', () => {
    it('should update existing user profile', () => {
      const manager = useUserProfiles([mockUser])
      const updates: UpdateUserData = {
        name: 'John Smith',
        email: 'john.smith@example.com',
      }

      const updated = manager.updateProfile('user-1', updates)

      expect(updated).not.toBeNull()
      expect(updated?.name).toBe('John Smith')
      expect(updated?.email).toBe('john.smith@example.com')
      expect(updated?.username).toBe('johndoe')
    })

    it('should return null for non-existent user', () => {
      const manager = useUserProfiles([])
      const updates: UpdateUserData = { name: 'New Name' }

      const updated = manager.updateProfile('non-existent-user', updates)

      expect(updated).toBeNull()
    })

    it('should update privacy settings', () => {
      const manager = useUserProfiles([mockUser])
      const updates: UpdateUserData = {
        privacy: {
          showEmail: true,
          showActivity: false,
        },
      }

      const updated = manager.updateProfile('user-1', updates)

      expect(updated?.privacy).toEqual({
        showEmail: true,
        showActivity: false,
      })
    })

    it('should partially update privacy settings', () => {
      const manager = useUserProfiles([mockUser])
      const updates: UpdateUserData = {
        privacy: {
          showEmail: true,
        },
      }

      const updated = manager.updateProfile('user-1', updates)

      expect(updated?.privacy?.showEmail).toBe(true)
      expect(updated?.privacy?.showActivity).toBe(true)
    })

    it('should preserve unmentioned fields', () => {
      const manager = useUserProfiles([mockUser])
      const updates: UpdateUserData = { name: 'Updated Name' }

      const updated = manager.updateProfile('user-1', updates)

      expect(updated?.name).toBe('Updated Name')
      expect(updated?.email).toBe(mockUser.email)
      expect(updated?.username).toBe(mockUser.username)
      expect(updated?.role).toBe(mockUser.role)
    })

    it('should update user in both array and map', () => {
      const manager = useUserProfiles([mockUser])
      const updates: UpdateUserData = { name: 'Updated Name' }

      const updated = manager.updateProfile('user-1', updates)
      const arrayUser = manager.users.value.find(u => u.id === 'user-1')
      const mapUser = manager.getUserProfile('user-1')

      expect(updated?.name).toBe('Updated Name')
      expect(arrayUser?.name).toBe('Updated Name')
      expect(mapUser?.name).toBe('Updated Name')
    })
  })

  describe('incrementContributions', () => {
    it('should increment comments count', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.incrementContributions('user-1', 'comments')

      const user = manager.getUserProfile('user-1')
      expect(user?.contributionsDetail?.comments).toBe(21)
      expect(user?.contributions).toBe(51)
    })

    it('should increment resources count', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.incrementContributions('user-1', 'resources')

      const user = manager.getUserProfile('user-1')
      expect(user?.contributionsDetail?.resources).toBe(16)
      expect(user?.contributions).toBe(51)
    })

    it('should increment votes count', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.incrementContributions('user-1', 'votes')

      const user = manager.getUserProfile('user-1')
      expect(user?.contributionsDetail?.votes).toBe(16)
      expect(user?.contributions).toBe(51)
    })

    it('should accept custom amount', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.incrementContributions('user-1', 'comments', 5)

      const user = manager.getUserProfile('user-1')
      expect(user?.contributionsDetail?.comments).toBe(25)
      expect(user?.contributions).toBe(55)
    })

    it('should handle zero contributions initially', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'New User',
        email: 'new@example.com',
      }

      const profile = manager.createProfile(userData)
      manager.incrementContributions(profile.id, 'comments')

      const user = manager.getUserProfile(profile.id)
      expect(user?.contributionsDetail?.comments).toBe(1)
      expect(user?.contributions).toBe(1)
    })

    it('should do nothing for non-existent user', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      expect(() => {
        manager.incrementContributions('non-existent-user', 'comments')
      }).not.toThrow()

      const user = manager.getUserProfile('user-1')
      expect(user?.contributions).toBe(50)
    })

    it('should update user in both array and map', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.incrementContributions('user-1', 'comments')

      const arrayUser = manager.users.value.find(u => u.id === 'user-1')
      const mapUser = manager.getUserProfile('user-1')

      expect(arrayUser?.contributions).toBe(51)
      expect(mapUser?.contributions).toBe(51)
    })
  })

  describe('updateReputation', () => {
    it('should increase reputation', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.updateReputation('user-1', 10)

      const user = manager.getUserProfile('user-1')
      expect(user?.reputation).toBe(110)
    })

    it('should decrease reputation', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.updateReputation('user-1', -20)

      const user = manager.getUserProfile('user-1')
      expect(user?.reputation).toBe(80)
    })

    it('should handle zero reputation initially', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'New User',
        email: 'new@example.com',
      }

      const profile = manager.createProfile(userData)
      manager.updateReputation(profile.id, 5)

      const user = manager.getUserProfile(profile.id)
      expect(user?.reputation).toBe(5)
    })

    it('should do nothing for non-existent user', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      expect(() => {
        manager.updateReputation('non-existent-user', 10)
      }).not.toThrow()

      const user = manager.getUserProfile('user-1')
      expect(user?.reputation).toBe(100)
    })

    it('should handle negative reputation', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.updateReputation('user-1', -150)

      const user = manager.getUserProfile('user-1')
      expect(user?.reputation).toBe(-50)
    })

    it('should update user in both array and map', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.updateReputation('user-1', 10)

      const arrayUser = manager.users.value.find(u => u.id === 'user-1')
      const mapUser = manager.getUserProfile('user-1')

      expect(arrayUser?.reputation).toBe(110)
      expect(mapUser?.reputation).toBe(110)
    })
  })

  describe('getUserProfile', () => {
    it('should return user by ID', () => {
      const manager = useUserProfiles([mockUser, mockModerator])

      const user = manager.getUserProfile('user-1')

      expect(user).toBeDefined()
      expect(user?.id).toBe('user-1')
      expect(user?.name).toBe('John Doe')
    })

    it('should return null for non-existent user', () => {
      const manager = useUserProfiles([mockUser])

      const user = manager.getUserProfile('non-existent-user')

      expect(user).toBeNull()
    })
  })

  describe('setModeratorStatus', () => {
    it('should set user as moderator', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      const result = manager.setModeratorStatus('user-1', true)

      expect(result).toBe(true)
      const user = manager.getUserProfile('user-1')
      expect(user?.isModerator).toBe(true)
    })

    it('should remove moderator status', () => {
      const manager = useUserProfiles([
        JSON.parse(JSON.stringify(mockModerator)),
      ])

      const result = manager.setModeratorStatus('user-2', false)

      expect(result).toBe(true)
      const user = manager.getUserProfile('user-2')
      expect(user?.isModerator).toBe(false)
    })

    it('should return false for non-existent user', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      const result = manager.setModeratorStatus('non-existent-user', true)

      expect(result).toBe(false)
    })

    it('should update user in both array and map', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.setModeratorStatus('user-1', true)

      const arrayUser = manager.users.value.find(u => u.id === 'user-1')
      const mapUser = manager.getUserProfile('user-1')

      expect(arrayUser?.isModerator).toBe(true)
      expect(mapUser?.isModerator).toBe(true)
    })
  })

  describe('getTopContributors computed', () => {
    it('should return top contributors sorted by reputation', () => {
      const user3: UserProfile = {
        ...mockUser,
        id: 'user-3',
        name: 'Charlie Davis',
        reputation: 300,
      }
      const manager = useUserProfiles([mockUser, mockModerator, user3])

      const topContributors = manager.getTopContributors.value()

      expect(topContributors).toHaveLength(3)
      expect(topContributors[0].id).toBe('user-2')
      expect(topContributors[1].id).toBe('user-3')
      expect(topContributors[2].id).toBe('user-1')
    })

    it('should limit results by default', () => {
      const manager = useUserProfiles([mockUser, mockModerator])

      const topContributors = manager.getTopContributors.value()

      expect(topContributors).toHaveLength(2)
    })

    it('should respect custom limit', () => {
      const manager = useUserProfiles([mockUser, mockModerator])

      const topContributors = manager.getTopContributors.value(1)

      expect(topContributors).toHaveLength(1)
      expect(topContributors[0].id).toBe('user-2')
    })

    it('should handle empty users list', () => {
      const manager = useUserProfiles([])

      const topContributors = manager.getTopContributors.value()

      expect(topContributors).toEqual([])
    })

    it('should handle users with undefined reputation', () => {
      const userNoRep: UserProfile = {
        ...mockUser,
        id: 'user-3',
        name: 'No Reputation',
        reputation: undefined,
      }
      const manager = useUserProfiles([mockUser, mockModerator, userNoRep])

      const topContributors = manager.getTopContributors.value()

      expect(topContributors[0].id).toBe('user-2')
      expect(topContributors[topContributors.length - 1].id).toBe('user-3')
    })

    it('should be reactive to reputation changes', () => {
      const manager = useUserProfiles([
        JSON.parse(JSON.stringify(mockUser)),
        JSON.parse(JSON.stringify(mockModerator)),
      ])

      expect(manager.getTopContributors.value()[0].id).toBe('user-2')

      manager.updateReputation('user-1', 1000)

      expect(manager.getTopContributors.value()[0].id).toBe('user-1')
    })
  })

  describe('edge cases', () => {
    it('should handle multiple profile updates', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.updateProfile('user-1', { name: 'First Update' })
      manager.updateProfile('user-1', { email: 'new@email.com' })
      manager.updateProfile('user-1', { username: 'newusername' })

      const user = manager.getUserProfile('user-1')
      expect(user?.name).toBe('First Update')
      expect(user?.email).toBe('new@email.com')
      expect(user?.username).toBe('newusername')
    })

    it('should handle creating users with all optional fields', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'Full User',
        email: 'full@example.com',
        username: 'fulluser',
        role: 'admin',
      }

      const profile = manager.createProfile(userData)

      expect(profile.name).toBe('Full User')
      expect(profile.email).toBe('full@example.com')
      expect(profile.username).toBe('fulluser')
      expect(profile.role).toBe('admin')
    })

    it('should handle creating users with minimal fields', () => {
      const manager = useUserProfiles([])
      const userData: CreateUserData = {
        name: 'Minimal User',
        email: 'minimal@example.com',
      }

      const profile = manager.createProfile(userData)

      expect(profile.name).toBe('Minimal User')
      expect(profile.email).toBe('minimal@example.com')
      expect(profile.username).toBeUndefined()
      expect(profile.role).toBe('user')
    })

    it('should handle toggling moderator status', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      expect(manager.getUserProfile('user-1')?.isModerator).toBe(false)

      manager.setModeratorStatus('user-1', true)
      expect(manager.getUserProfile('user-1')?.isModerator).toBe(true)

      manager.setModeratorStatus('user-1', false)
      expect(manager.getUserProfile('user-1')?.isModerator).toBe(false)
    })

    it('should handle negative contribution increments', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])

      manager.incrementContributions('user-1', 'comments', -5)

      const user = manager.getUserProfile('user-1')
      expect(user?.contributionsDetail?.comments).toBe(15)
    })
  })

  describe('performance and O(1) lookups', () => {
    it('should handle large number of users efficiently', () => {
      const initialUsers: UserProfile[] = []
      for (let i = 0; i < 1000; i++) {
        initialUsers.push({
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          role: 'user',
          joinDate: '2023-01-01T00:00:00.000Z',
          reputation: i * 10,
          contributions: i,
          contributionsDetail: {
            comments: Math.floor(i / 3),
            resources: Math.floor(i / 3),
            votes: Math.floor(i / 3),
          },
        })
      }

      const manager = useUserProfiles(initialUsers)
      const specificUser = manager.getUserProfile('user-500')

      expect(specificUser).toBeDefined()
      expect(specificUser?.id).toBe('user-500')
    })

    it('should update users efficiently in large dataset', () => {
      const initialUsers: UserProfile[] = []
      for (let i = 0; i < 1000; i++) {
        initialUsers.push({
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          role: 'user',
          joinDate: '2023-01-01T00:00:00.000Z',
          reputation: i * 10,
        })
      }

      const manager = useUserProfiles(initialUsers)
      const updated = manager.updateProfile('user-500', {
        name: 'Updated User',
      })

      expect(updated).not.toBeNull()
      expect(updated?.name).toBe('Updated User')
    })

    it('should get top contributors efficiently from large dataset', () => {
      const initialUsers: UserProfile[] = []
      for (let i = 0; i < 1000; i++) {
        initialUsers.push({
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          role: 'user',
          joinDate: '2023-01-01T00:00:00.000Z',
          reputation: i * 10,
        })
      }

      const manager = useUserProfiles(initialUsers)
      const topContributors = manager.getTopContributors.value(10)

      expect(topContributors).toHaveLength(10)
      expect(topContributors[0].reputation).toBe(9990)
    })
  })

  describe('reactivity', () => {
    it('should react to user creation', () => {
      const manager = useUserProfiles([])
      expect(manager.users.value).toHaveLength(0)

      manager.createProfile({
        name: 'New User',
        email: 'new@example.com',
      })

      expect(manager.users.value).toHaveLength(1)
    })

    it('should react to profile updates', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])
      expect(manager.getUserProfile('user-1')?.name).toBe('John Doe')

      manager.updateProfile('user-1', { name: 'Updated' })

      expect(manager.getUserProfile('user-1')?.name).toBe('Updated')
    })

    it('should react to contribution increments', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])
      expect(manager.getUserProfile('user-1')?.contributions).toBe(50)

      manager.incrementContributions('user-1', 'comments')

      expect(manager.getUserProfile('user-1')?.contributions).toBe(51)
    })

    it('should react to reputation changes', () => {
      const manager = useUserProfiles([JSON.parse(JSON.stringify(mockUser))])
      expect(manager.getUserProfile('user-1')?.reputation).toBe(100)

      manager.updateReputation('user-1', 50)

      expect(manager.getUserProfile('user-1')?.reputation).toBe(150)
    })
  })
})
