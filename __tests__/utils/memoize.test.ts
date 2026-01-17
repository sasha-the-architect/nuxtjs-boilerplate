import { describe, it, expect } from 'vitest'
import { memoize, memoizeHighlight, clearMemoCache } from '~/utils/memoize'

describe('Memoization Utilities', () => {
  describe('memoize', () => {
    it('should cache function results', () => {
      let callCount = 0
      const fn = (a: number, b: number) => {
        callCount++
        return a + b
      }

      const memoizedFn = memoize(fn as any)

      const result1 = memoizedFn(1, 2)
      const result2 = memoizedFn(1, 2)

      expect(result1).toBe(3)
      expect(result2).toBe(3)
      expect(callCount).toBe(1)
    })

    it('should call original function with different arguments', () => {
      let callCount = 0
      const fn = (a: number, b: number) => {
        callCount++
        return a + b
      }

      const memoizedFn = memoize(fn as any)

      memoizedFn(1, 2)
      memoizedFn(2, 3)
      memoizedFn(1, 2)

      expect(callCount).toBe(2)
    })

    it('should use default key generator', () => {
      let callCount = 0
      const fn = (obj: { a: number }) => {
        callCount++
        return obj.a
      }

      const memoizedFn = memoize(fn as any)

      memoizedFn({ a: 1 })
      memoizedFn({ a: 1 })

      expect(callCount).toBe(2)
    })

    it('should accept custom key generator', () => {
      let callCount = 0
      const fn = (obj: { id: number; value: string }) => {
        callCount++
        return obj.value
      }

      const customKeyFn = (obj: { id: number; value: string }) =>
        obj.id.toString()
      const memoizedFn = memoize(fn as any, customKeyFn as any)

      memoizedFn({ id: 1, value: 'first' })
      memoizedFn({ id: 1, value: 'second' })

      expect(callCount).toBe(1)
    })

    it('should handle multiple arguments', () => {
      let callCount = 0
      const fn = (a: string, b: number, c: boolean) => {
        callCount++
        return `${a}-${b}-${c}`
      }

      const memoizedFn = memoize(fn as any)

      memoizedFn('test', 42, true)
      memoizedFn('test', 42, true)

      expect(callCount).toBe(1)
    })

    it('should return correct type', () => {
      const fn = (x: number) => x * 2
      const memoizedFn = memoize(fn as any)

      const result: number = memoizedFn(5)

      expect(result).toBe(10)
    })

    it('should handle functions with return type void', () => {
      let callCount = 0
      const fn = (value: number) => {
        callCount++
        return value
      }

      const memoizedFn = memoize(fn as any)

      memoizedFn(1)
      memoizedFn(1)

      expect(callCount).toBe(1)
    })

    it('should handle async functions', async () => {
      let callCount = 0
      const fn = async (x: number) => {
        callCount++
        return x * 2
      }

      const memoizedFn = memoize(fn as any)

      const result1 = await memoizedFn(5)
      const result2 = await memoizedFn(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(callCount).toBe(1)
    })

    it('should handle objects as arguments', () => {
      let callCount = 0
      const fn = (obj: { x: number; y: number }) => {
        callCount++
        return obj.x + obj.y
      }

      const memoizedFn = memoize(fn as any)

      memoizedFn({ x: 1, y: 2 })
      memoizedFn({ x: 1, y: 2 })

      expect(callCount).toBe(2)
    })

    it('should handle complex return types', () => {
      let callCount = 0
      const fn = () => {
        callCount++
        return { nested: { value: 42 } }
      }

      const memoizedFn = memoize(fn as any)

      const result1 = memoizedFn()
      const result2 = memoizedFn()

      expect(result1).toEqual(result2)
      expect(callCount).toBe(1)
    })
  })

  describe('memoizeHighlight', () => {
    it('should memoize highlight function results', () => {
      let callCount = 0
      const highlightFn = (text: string, query: string) => {
        callCount++
        return text.replace(
          new RegExp(query, 'gi'),
          match => `<mark>${match}</mark>`
        )
      }

      const memoizedHighlight = memoizeHighlight(highlightFn)

      const result1 = memoizedHighlight('hello world', 'world')
      const result2 = memoizedHighlight('hello world', 'world')

      expect(result1).toBe('hello <mark>world</mark>')
      expect(result2).toBe('hello <mark>world</mark>')
      expect(callCount).toBe(1)
    })

    it('should generate cache key from text and query', () => {
      let callCount = 0
      const highlightFn = (text: string) => {
        callCount++
        return text
      }

      const memoizedHighlight = memoizeHighlight(highlightFn)

      memoizedHighlight('text1', 'query1')
      memoizedHighlight('text2', 'query2')
      memoizedHighlight('text1', 'query1')

      expect(callCount).toBe(2)
    })

    it('should handle different combinations of text and query', () => {
      let callCount = 0
      const highlightFn = (text: string, query: string) => {
        callCount++
        return text + query
      }

      const memoizedHighlight = memoizeHighlight(highlightFn)

      const result1 = memoizedHighlight('hello world', 'world')
      const result2 = memoizedHighlight('hello world', 'hello')
      const result3 = memoizedHighlight('hello world', 'world')

      expect(callCount).toBe(2)
      expect(result1).toBe('hello worldworld')
      expect(result2).toBe('hello worldhello')
      expect(result3).toBe('hello worldworld')
    })

    it('should handle empty query', () => {
      let callCount = 0
      const highlightFn = (text: string, query: string) => {
        callCount++
        return text + query
      }

      const memoizedHighlight = memoizeHighlight(highlightFn)

      const result1 = memoizedHighlight('hello world', '')
      memoizedHighlight('hello world', '')

      expect(result1).toBe('hello world')
      expect(callCount).toBe(1)
    })

    it('should handle empty text', () => {
      let callCount = 0
      const highlightFn = (text: string) => {
        callCount++
        return text
      }

      const memoizedHighlight = memoizeHighlight(highlightFn)

      const result1 = memoizedHighlight('', 'query')
      memoizedHighlight('', 'query')

      expect(result1).toBe('')
      expect(callCount).toBe(1)
    })

    it('should preserve original function behavior', () => {
      const highlightFn = (text: string, query: string) => {
        return text.replace(new RegExp(query, 'gi'), match => `**${match}**`)
      }

      const memoizedHighlight = memoizeHighlight(highlightFn)

      const result = memoizedHighlight('Test test text', 'test')

      expect(result).toBe('**Test** **test** text')
    })
  })

  describe('clearMemoCache', () => {
    it('should clear memoization cache', () => {
      let callCount = 0
      const fn = (x: number) => {
        callCount++
        return x * 2
      }

      const memoizedFn = memoize(fn as any)

      memoizedFn(5)
      clearMemoCache()
      memoizedFn(5)

      expect(callCount).toBe(2)
    })

    it('should clear multiple cached values', () => {
      let callCount = 0
      const fn = (x: number) => {
        callCount++
        return x * 2
      }

      const memoizedFn = memoize(fn as any)

      memoizedFn(1)
      memoizedFn(2)
      memoizedFn(3)

      clearMemoCache()

      memoizedFn(1)
      memoizedFn(2)
      memoizedFn(3)

      expect(callCount).toBe(6)
    })

    it('should not affect new memoized functions after clearing', () => {
      let callCount1 = 0
      let callCount2 = 0

      const fn1 = (x: number) => {
        callCount1++
        return x * 2
      }

      const fn2 = (x: number) => {
        callCount2++
        return x * 3
      }

      const memoizedFn1 = memoize(fn1 as any)
      const memoizedFn2 = memoize(fn2 as any)

      memoizedFn1(5)
      clearMemoCache()

      const result1 = memoizedFn1(5)
      const result2 = memoizedFn2(5)

      expect(callCount1).toBe(2)
      expect(callCount2).toBe(1)
      expect(result1).toBe(10)
      expect(result2).toBe(15)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null and undefined arguments', () => {
      let callCount = 0
      const fn = (x: number | null, y: string | undefined) => {
        callCount++
        return { x, y }
      }

      const memoizedFn = memoize(fn as any)

      memoizedFn(null, undefined)
      memoizedFn(null, undefined)

      expect(callCount).toBe(1)
    })

    it('should handle zero arguments', () => {
      let callCount = 0
      const fn = () => {
        callCount++
        return 'result'
      }

      const memoizedFn = memoize(fn as any)

      const result1 = memoizedFn()
      memoizedFn()

      expect(result1).toBe('result')
      expect(callCount).toBe(1)
    })

    it('should handle special characters in arguments', () => {
      let callCount = 0
      const fn = (str: string) => {
        callCount++
        return str
      }

      const memoizedFn = memoize(fn as any)

      memoizedFn('hello\nworld')
      memoizedFn('hello\nworld')

      expect(callCount).toBe(1)
    })

    it('should handle large number of cached values', () => {
      let callCount = 0
      const fn = (x: number) => {
        callCount++
        return x
      }

      const memoizedFn = memoize(fn as any)

      for (let i = 0; i < 1000; i++) {
        memoizedFn(i)
      }

      for (let i = 0; i < 1000; i++) {
        memoizedFn(i)
      }

      expect(callCount).toBe(1000)
    })

    it('should handle functions with side effects', () => {
      let sideEffectCount = 0
      const fn = (x: number) => {
        sideEffectCount++
        return x * 2
      }

      const memoizedFn = memoize(fn as any)

      const result1 = memoizedFn(5)
      const result2 = memoizedFn(5)

      expect(sideEffectCount).toBe(1)
      expect(result1).toBe(result2)
    })
  })
})
