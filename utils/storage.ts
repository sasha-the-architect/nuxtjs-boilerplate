import logger from './logger'

export interface StorageOptions<T> {
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
}

export const createStorage = <T>(
  key: string,
  defaultValue: T,
  options: StorageOptions<T> = {}
) => {
  const { serializer = JSON.stringify, deserializer = JSON.parse } = options

  const get = (): T => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return defaultValue
      return deserializer(stored)
    } catch (e) {
      logger.error(`Error reading from localStorage (key: ${key}):`, e)
      return defaultValue
    }
  }

  const set = (value: T): boolean => {
    if (typeof window === 'undefined') return false

    try {
      localStorage.setItem(key, serializer(value))
      return true
    } catch (e) {
      logger.error(`Error writing to localStorage (key: ${key}):`, e)
      return false
    }
  }

  const remove = (): boolean => {
    if (typeof window === 'undefined') return false

    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      logger.error(`Error removing from localStorage (key: ${key}):`, e)
      return false
    }
  }

  return {
    get,
    set,
    remove,
  }
}

export const createStorageWithDateSerialization = <T>(
  key: string,
  defaultValue: T
) => {
  const dateSerializer = (value: T): string => {
    return JSON.stringify(value, (_, v) => {
      if (v instanceof Date) {
        return { __date__: true, value: v.toISOString() }
      }
      return v
    })
  }

  const dateDeserializer = (value: string): T => {
    return JSON.parse(value, (_, v) => {
      if (v && typeof v === 'object' && v.__date__ === true) {
        return new Date(v.value)
      }
      return v
    })
  }

  return createStorage<T>(key, defaultValue, {
    serializer: dateSerializer,
    deserializer: dateDeserializer,
  })
}
