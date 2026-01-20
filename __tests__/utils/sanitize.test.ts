import { describe, it, expect } from 'vitest'
import { sanitizeForXSS, sanitizeAndHighlight } from '~/utils/sanitize'

describe('sanitize', () => {
  describe('sanitizeForXSS', () => {
    it('should return empty string for empty input', () => {
      const result = sanitizeForXSS('')
      expect(result).toBe('')
    })

    it('should return null for null input', () => {
      const result = sanitizeForXSS(null as unknown as string)
      expect(result).toBeNull()
    })

    it('should return undefined for undefined input', () => {
      const result = sanitizeForXSS(undefined as unknown as string)
      expect(result).toBeUndefined()
    })

    it('should remove script tags with content', () => {
      const result = sanitizeForXSS('Hello <script>alert("xss")</script> World')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })

    it('should remove self-closing script tags', () => {
      const result = sanitizeForXSS('Hello <script /> World')
      expect(result).not.toContain('<script')
    })

    it('should remove script tags with different case', () => {
      const result = sanitizeForXSS('Hello <SCRIPT>alert("xss")</SCRIPT> World')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
    })

    it('should remove iframe tags', () => {
      const result = sanitizeForXSS('<iframe src="evil.com"></iframe>')
      expect(result).not.toContain('<iframe')
      expect(result).not.toContain('evil.com')
    })

    it('should remove object tags', () => {
      const result = sanitizeForXSS('<object data="evil.swf"></object>')
      expect(result).not.toContain('<object')
    })

    it('should remove embed tags', () => {
      const result = sanitizeForXSS('<embed src="evil.swf">')
      expect(result).not.toContain('<embed')
    })

    it('should remove form tags', () => {
      const result = sanitizeForXSS('<form action="evil.com">input</form>')
      expect(result).not.toContain('<form')
      expect(result).not.toContain('evil.com')
    })

    it('should remove img tags', () => {
      const result = sanitizeForXSS('<img src=x onerror=alert("xss")>')
      expect(result).not.toContain('<img')
    })

    it('should remove link tags', () => {
      const result = sanitizeForXSS('<link href="evil.css">')
      expect(result).not.toContain('<link')
    })

    it('should remove meta tags', () => {
      const result = sanitizeForXSS(
        '<meta http-equiv="refresh" content="0;url=evil.com">'
      )
      expect(result).not.toContain('<meta')
    })

    it('should remove SVG tags', () => {
      const result = sanitizeForXSS('<svg><script>alert("xss")</script></svg>')
      expect(result).not.toContain('<svg')
      expect(result).not.toContain('alert')
    })

    it('should preserve text content within SVG', () => {
      const result = sanitizeForXSS('<svg>Some text</svg>')
      expect(result).toContain('Some text')
      expect(result).not.toContain('<svg')
    })

    it('should remove anchor tags', () => {
      const result = sanitizeForXSS('<a href="evil.com">Click me</a>')
      expect(result).not.toContain('<a')
      expect(result).toContain('Click me')
    })

    it('should remove self-closing anchor tags', () => {
      const result = sanitizeForXSS('<a href="evil.com" />')
      expect(result).not.toContain('<a')
    })

    it('should remove javascript: protocol', () => {
      const result = sanitizeForXSS('javascript:alert("xss")')
      expect(result).not.toContain('javascript:')
    })

    it('should remove data: protocol', () => {
      const result = sanitizeForXSS(
        'data:text/html,<script>alert("xss")</script>'
      )
      expect(result).not.toContain('data:')
    })

    it('should remove vbscript: protocol', () => {
      const result = sanitizeForXSS('vbscript:msgbox("xss")')
      expect(result).not.toContain('vbscript:')
    })

    it('should remove event handlers', () => {
      const result = sanitizeForXSS('<div onclick="alert(\'xss\')">Click</div>')
      expect(result).not.toContain('onclick')
    })

    it('should remove onerror event', () => {
      const result = sanitizeForXSS('<img src=x onerror="alert(\'xss\')">')
      expect(result).not.toContain('onerror')
    })

    it('should remove onload event', () => {
      const result = sanitizeForXSS('<img src=x onload="alert(\'xss\')">')
      expect(result).not.toContain('onload')
    })

    it('should remove HTML entities', () => {
      const result = sanitizeForXSS('&#60;script&#62;alert(1)&#60;/script&#62;')
      expect(result).not.toContain('&#60;')
      expect(result).not.toContain('&#62;')
    })

    it('should remove hex HTML entities', () => {
      const result = sanitizeForXSS(
        '&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;'
      )
      expect(result).not.toContain('&#x3C;')
      expect(result).not.toContain('&#x3E;')
    })

    it('should normalize multiple spaces to single space', () => {
      const result = sanitizeForXSS('Hello    World')
      expect(result).toBe('Hello World')
    })

    it('should remove HTML comments', () => {
      const result = sanitizeForXSS('Hello <!-- comment --> World')
      expect(result).not.toContain('<!--')
      expect(result).not.toContain('comment')
    })

    it('should remove DOCTYPE declarations', () => {
      const result = sanitizeForXSS('<!DOCTYPE html>')
      expect(result).not.toContain('<!DOCTYPE')
    })

    it('should preserve safe text', () => {
      const result = sanitizeForXSS('Hello World')
      expect(result).toBe('Hello World')
    })

    it('should preserve safe HTML text', () => {
      const result = sanitizeForXSS('Hello <strong>World</strong>')
      expect(result).not.toContain('<strong')
    })

    it('should handle mixed dangerous and safe content', () => {
      const result = sanitizeForXSS('Hello <script>alert("xss")</script> World')
      expect(result).toContain('Hello')
      expect(result).toContain('World')
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
    })

    it('should handle nested dangerous tags', () => {
      const result = sanitizeForXSS('<div><script>alert("xss")</script></div>')
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
    })

    it('should remove style tags but preserve content text', () => {
      const result = sanitizeForXSS('<style>body { background: red; }</style>')
      expect(result).not.toContain('<style')
      expect(result).toContain('body')
    })

    it('should handle encoded script content', () => {
      const result = sanitizeForXSS(
        '<script>%3Cscript%3Ealert(1)%3C/script%3E</script>'
      )
      expect(result).not.toContain('<script>')
    })

    it('should handle script with spaces in tag name', () => {
      const result = sanitizeForXSS('< script>alert("xss")< / script>')
      expect(result).not.toContain('alert')
    })

    it('should handle script with newlines', () => {
      const result = sanitizeForXSS('<script>\nalert("xss");\n</script>')
      expect(result).not.toContain('alert')
    })

    it('should normalize whitespace after removing dangerous content', () => {
      const result = sanitizeForXSS('Hello <script>alert(1)</script>    World')
      expect(result).toContain('Hello')
      expect(result).toContain('World')
      expect(result).not.toContain('    ')
    })
  })

  describe('sanitizeAndHighlight', () => {
    it('should return empty string for empty text', () => {
      const result = sanitizeAndHighlight('', 'test')
      expect(result).toBe('')
    })

    it('should return empty string for null text', () => {
      const result = sanitizeAndHighlight(null as unknown as string, 'test')
      expect(result).toBe('')
    })

    it('should return text unchanged for empty search query', () => {
      const result = sanitizeAndHighlight('Hello World', '')
      expect(result).toBe('Hello World')
    })

    it('should return text unchanged for null search query', () => {
      const result = sanitizeAndHighlight(
        'Hello World',
        null as unknown as string
      )
      expect(result).toBe('Hello World')
    })

    it('should highlight search term in text', () => {
      const result = sanitizeAndHighlight('Hello World', 'World')
      expect(result).toContain('<mark')
      expect(result).toContain('World')
    })

    it('should sanitize text before highlighting', () => {
      const result = sanitizeAndHighlight(
        'Hello <script>alert("xss")</script> World',
        'World'
      )
      expect(result).toContain('<mark')
      expect(result).toContain('World')
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
    })

    it('should escape special regex characters in search query', () => {
      const result = sanitizeAndHighlight('Hello . World', '.')
      expect(result).toContain('<mark')
    })

    it('should escape special regex characters in search query', () => {
      const result = sanitizeAndHighlight('Hello (World)', '(World)')
      expect(result).toContain('<mark')
      expect(result).toContain('(World)')
    })

    it('should highlight all occurrences of search term', () => {
      const result = sanitizeAndHighlight('test test test', 'test')
      const matches = (result.match(/<mark/g) || []).length
      expect(matches).toBe(3)
    })

    it('should be case-insensitive', () => {
      const result = sanitizeAndHighlight('Hello World', 'world')
      expect(result).toContain('<mark')
      expect(result).toContain('World')
    })

    it('should add highlighting CSS classes', () => {
      const result = sanitizeAndHighlight('Hello World', 'World')
      expect(result).toContain('class="bg-yellow-200 text-gray-900"')
    })

    it('should handle multiple word search queries', () => {
      const result = sanitizeAndHighlight('Hello World Test', 'Hello World')
      expect(result).toContain('<mark')
    })

    it('should preserve text structure', () => {
      const result = sanitizeAndHighlight('Hello World', 'World')
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })

    it('should handle special characters in search query', () => {
      const result = sanitizeAndHighlight('Hello +World', '+World')
      expect(result).toContain('<mark')
    })

    it('should handle asterisk in search query', () => {
      const result = sanitizeAndHighlight('Hello *World', '*World')
      expect(result).toContain('<mark')
    })

    it('should handle question mark in search query', () => {
      const result = sanitizeAndHighlight('Hello? World?', '?')
      expect(result).toContain('<mark')
    })

    it('should sanitize HTML in highlighted text', () => {
      const result = sanitizeAndHighlight(
        'Hello <a href="evil.com">World</a>',
        'World'
      )
      expect(result).toContain('<mark')
      expect(result).not.toContain('<a')
    })

    it('should handle search term with special regex characters', () => {
      const result = sanitizeAndHighlight('Price: $100', '$')
      expect(result).toContain('<mark')
      expect(result).toContain('$')
    })

    it('should handle search term with pipe character', () => {
      const result = sanitizeAndHighlight('A|B|C', '|')
      const matches = (result.match(/<mark/g) || []).length
      expect(matches).toBe(2)
    })

    it('should handle search term with brackets', () => {
      const result = sanitizeAndHighlight('[test]', '[')
      expect(result).toContain('<mark')
    })

    it('should handle search term with curly braces', () => {
      const result = sanitizeAndHighlight('{test}', '{')
      expect(result).toContain('<mark')
    })

    it('should handle search term with caret character', () => {
      const result = sanitizeAndHighlight('^test', '^')
      expect(result).toContain('<mark')
    })
  })
})
