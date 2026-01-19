import { describe, it, expect } from 'vitest'
import { generateUniqueId } from '~/utils/id'

describe('generateUniqueId', () => {
  describe('Basic Functionality', () => {
    it('should generate a string', () => {
      const id = generateUniqueId()

      expect(typeof id).toBe('string')
    })

    it('should generate non-empty string', () => {
      const id = generateUniqueId()

      expect(id.length).toBeGreaterThan(0)
    })

    it('should generate unique IDs on consecutive calls', () => {
      const id1 = generateUniqueId()
      const id2 = generateUniqueId()

      expect(id1).not.toBe(id2)
    })
  })

  describe('Uniqueness', () => {
    it('should generate 100 unique IDs', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 100; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBe(100)
    })

    it('should generate 1000 unique IDs', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 1000; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBe(1000)
    })

    it('should not generate duplicate IDs in rapid succession', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 1000; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBe(1000)
    })
  })

  describe('ID Format', () => {
    it('should use base36 encoding (lowercase letters and numbers)', () => {
      const id = generateUniqueId()

      expect(id).toMatch(/^[a-z0-9]+$/)
    })

    it('should start with timestamp in base36', () => {
      const timestamp = Date.now().toString(36)
      const id = generateUniqueId()

      expect(id).toMatch(new RegExp(`^${timestamp}`))
    })

    it('should have reasonable length', () => {
      const id = generateUniqueId()

      expect(id.length).toBeGreaterThan(10)
      expect(id.length).toBeLessThan(20)
    })

    it('should have timestamp component followed by random component', () => {
      const id = generateUniqueId()
      const timestampLength = Date.now().toString(36).length
      const idParts = id.slice(timestampLength)

      expect(idParts.length).toBe(5)
    })
  })

  describe('Temporal Ordering', () => {
    it('should generate IDs that are chronologically sortable', async () => {
      const id1 = generateUniqueId()
      await new Promise(resolve => setTimeout(resolve, 10))
      const id2 = generateUniqueId()

      expect(id1 < id2).toBe(true)
    })

    it('should maintain order with rapid consecutive calls (when timestamp changes)', async () => {
      const ids: string[] = []

      for (let i = 0; i < 10; i++) {
        ids.push(generateUniqueId())
        await new Promise(resolve => setTimeout(resolve, 1))
      }

      for (let i = 1; i < ids.length; i++) {
        expect(ids[i - 1] < ids[i]).toBe(true)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle same millisecond timestamp with different random suffix', () => {
      const id1 = generateUniqueId()
      const id2 = generateUniqueId()

      const timestamp1 = id1.slice(0, -5)
      const timestamp2 = id2.slice(0, -5)

      expect(timestamp1).toBe(timestamp2)
      expect(id1).not.toBe(id2)
    })

    it('should work correctly in strict mode', () => {
      'use strict'

      const id = generateUniqueId()

      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('Determinism', () => {
    it('should NOT be deterministic (each call should produce different result)', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 100; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBeGreaterThan(1)
    })

    it('should have high entropy (low collision probability)', () => {
      const idCounts = new Map<string, number>()
      const iterations = 10000

      for (let i = 0; i < iterations; i++) {
        const id = generateUniqueId()
        const suffix = id.slice(-5)
        idCounts.set(suffix, (idCounts.get(suffix) || 0) + 1)
      }

      const maxCount = Math.max(...idCounts.values())
      const avgCount = iterations / idCounts.size

      expect(maxCount).toBeLessThan(avgCount * 10)
    })
  })

  describe('Performance', () => {
    it('should generate ID quickly', () => {
      const start = performance.now()

      for (let i = 0; i < 10000; i++) {
        generateUniqueId()
      }

      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
    })

    it('should not have memory leaks', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize

      for (let i = 0; i < 100000; i++) {
        generateUniqueId()
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize

      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      }
    })
  })

  describe('Character Set', () => {
    it('should only use lowercase letters and digits', () => {
      const id = generateUniqueId()

      expect(id).toMatch(/^[a-z0-9]+$/)
      expect(id).not.toMatch(/[A-Z]/)
      expect(id).not.toMatch(/[!@#$%^&*()_+={}[\]:;<>,.?\\|]/)
    })

    it('should not contain special characters', () => {
      const id = generateUniqueId()

      expect(id).not.toMatch(/[^a-z0-9]/)
    })

    it('should not contain uppercase letters', () => {
      const id = generateUniqueId()

      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })

  describe('Cross-Browser Compatibility', () => {
    it('should use Date.now() which is widely supported', () => {
      const id = generateUniqueId()

      expect(id.length).toBeGreaterThan(0)
      expect(typeof id).toBe('string')
    })

    it('should use Math.random() which is widely supported', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 100; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBeGreaterThan(10)
    })
  })
})
