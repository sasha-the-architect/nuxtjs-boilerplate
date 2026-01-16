/**
 * Collection utilities
 * Provides helper functions for synchronizing Map and Array state
 */
import type { Ref } from 'vue'

/**
 * Synchronizes a Map update with its corresponding Array
 * Updates item in both Map (O(1)) and Array (O(n) for index lookup)
 * Use this utility whenever you maintain parallel Map and Array state
 *
 * @param arrayRef - Reactive array reference
 * @param mapRef - Reactive map reference
 * @param id - ID of the item to update
 * @param updatedItem - Updated item to set in both Map and Array
 * @returns true if item was found and updated, false otherwise
 *
 * @example
 * ```typescript
 * const users = ref<UserProfile[]>([])
 * const userMap = ref<Map<string, UserProfile>>(new Map())
 *
 * // Update user in both Map and Array
 * const updatedUser = { ...user, name: 'New Name' }
 * updateInArrayMap(users, userMap, userId, updatedUser)
 * ```
 */
export const updateInArrayMap = <T extends { id: string }>(
  arrayRef: Ref<T[]>,
  mapRef: Ref<Map<string, T>>,
  id: string,
  updatedItem: T
): boolean => {
  mapRef.value.set(id, updatedItem)

  const index = arrayRef.value.findIndex(item => item.id === id)
  if (index !== -1) {
    arrayRef.value[index] = updatedItem
    return true
  }

  return false
}

/**
 * Synchronizes a Map deletion with its corresponding Array
 * Removes item from both Map (O(1)) and Array (O(n) for index lookup)
 * Use this utility whenever you maintain parallel Map and Array state
 *
 * @param arrayRef - Reactive array reference
 * @param mapRef - Reactive map reference
 * @param id - ID of the item to remove
 * @returns true if item was found and removed, false otherwise
 *
 * @example
 * ```typescript
 * const votes = ref<Vote[]>([])
 * const voteMap = ref<Map<string, Vote>>(new Map())
 *
 * // Remove vote from both Map and Array
 * removeInArrayMap(votes, voteMap, voteId)
 * ```
 */
export const removeInArrayMap = <T extends { id: string }>(
  arrayRef: Ref<T[]>,
  mapRef: Ref<Map<string, T>>,
  id: string
): boolean => {
  mapRef.value.delete(id)

  const index = arrayRef.value.findIndex(item => item.id === id)
  if (index !== -1) {
    arrayRef.value.splice(index, 1)
    return true
  }

  return false
}

/**
 * Adds item to both Map and Array
 * Inserts item in both Map (O(1)) and Array (O(1) push)
 * Use this utility whenever you maintain parallel Map and Array state
 *
 * @param arrayRef - Reactive array reference
 * @param mapRef - Reactive map reference
 * @param item - Item to add to both Map and Array
 *
 * @example
 * ```typescript
 * const votes = ref<Vote[]>([])
 * const voteMap = ref<Map<string, Vote>>(new Map())
 *
 * // Add vote to both Map and Array
 * const newVote: Vote = { id: '1', userId: 'user1', ... }
 * addToArrayMap(votes, voteMap, newVote)
 * ```
 */
export const addToArrayMap = <T extends { id: string }>(
  arrayRef: Ref<T[]>,
  mapRef: Ref<Map<string, T>>,
  item: T
): void => {
  mapRef.value.set(item.id, item)
  arrayRef.value.push(item)
}

/**
 * Initializes a Map from an array of items
 * Use this to create the initial index for O(1) lookups
 *
 * @param items - Array of items to index
 * @returns Map with item IDs as keys
 *
 * @example
 * ```typescript
 * const initialUsers = [...]
 * const users = ref<UserProfile[]>([...initialUsers])
 * const userMap = ref<Map<string, UserProfile>>(
 *   initializeMapFromArray(initialUsers)
 * )
 * ```
 */
export const initializeMapFromArray = <T extends { id: string }>(
  items: readonly T[]
): Map<string, T> => {
  const map = new Map<string, T>()
  items.forEach(item => {
    map.set(item.id, item)
  })
  return map
}
