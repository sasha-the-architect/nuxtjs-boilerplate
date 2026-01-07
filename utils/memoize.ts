const generateCacheKey = (text: string, searchQuery: string): string => {
  return `${text}:${searchQuery}`
}

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (..._args: Parameters<T>) => string = (...args) =>
    JSON.stringify(args)
): T => {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

export const memoizeHighlight = (
  highlightFn: (text: string, searchQuery: string) => string
): ((text: string, searchQuery: string) => string) => {
  const cache = new Map<string, string>()

  return (_text: string, _searchQuery: string) => {
    const key = generateCacheKey(_text, _searchQuery)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = highlightFn(_text, _searchQuery)
    cache.set(key, result)
    return result
  }
}

export const clearMemoCache = (): void => {
  const cache = new Map<string, string>()
  cache.clear()
}
