import { describe, it, expect } from 'vitest'
import { sanitizeForXSS, sanitizeAndHighlight } from '~/utils/sanitize'

describe('XSS Sanitization Utilities', () => {
  describe('sanitizeForXSS', () => {
    it('removes script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> world'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
      // Should contain the safe content
      expect(result).toContain('Hello')
      expect(result).toContain('world')
    })

    it('removes iframe tags', () => {
      const input = 'Content <iframe src="javascript:alert(1)"></iframe> more content'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('iframe')
      expect(result).not.toContain('javascript:')
      // Should contain the safe content
      expect(result).toContain('Content')
      expect(result).toContain('more content')
    })

    it('removes image tags with event handlers', () => {
      const input = 'Image <img src="x" onerror="alert(1)" /> test'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('img')
      expect(result).not.toContain('onerror')
      // Should contain the safe content
      expect(result).toContain('Image')
      expect(result).toContain('test')
    })

    it('removes javascript: URLs', () => {
      const input = 'Link with javascript:alert(1) URL'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('alert(1)')
      // Should contain the safe content
      expect(result).toContain('Link')
      expect(result).toContain('with')
      expect(result).toContain('URL')
    })

    it('removes event handlers', () => {
      const input = 'Text with onclick="alert(1)" event'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('onclick')
      expect(result).not.toContain('alert(1)')
      // Should contain the safe content
      expect(result).toContain('Text')
      expect(result).toContain('with')
      expect(result).toContain('event')
    })

    it('handles nested dangerous content', () => {
      const input = '<script>var a = "<script>alert(1)</script>";</script>'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert(1)')
      // Should contain the safe content
      expect(result).toContain('var a = "')
      expect(result).toContain('";')
    })

    it('preserves safe text content', () => {
      const input = 'This is a normal text without any dangerous content'
      const result = sanitizeForXSS(input)
      expect(result).toBe(input)
    })
  })

  describe('sanitizeAndHighlight', () => {
    it('sanitizes and highlights search terms', () => {
      const input = 'This is a test content for highlighting'
      const query = 'test'
      const result = sanitizeAndHighlight(input, query)
      expect(result).toContain('<mark')
      expect(result).toContain('test')
      expect(result).not.toContain('script')
    })

    it('removes XSS content while preserving highlighting', () => {
      const input = 'Safe text with <script>alert("XSS")</script> and more safe text'
      const query = 'safe'
      const result = sanitizeAndHighlight(input, query)
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
      expect(result).toContain('<mark')
      expect(result).toContain('Safe')
      expect(result).toContain('safe')
    })

    it('handles XSS in highlighted terms', () => {
      const input = 'Search term <img src=x onerror=alert("XSS")> here'
      const query = 'term'
      const result = sanitizeAndHighlight(input, query)
      expect(result).not.toContain('img')
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('script')
      expect(result).toContain('<mark')
    })

    it('works with multiple search terms', () => {
      const input = 'This is a test for multiple search terms'
      const query = 'test multiple'
      const result = sanitizeAndHighlight(input, query)
      expect(result).toContain('<mark')
      expect(result).not.toContain('script')
    })
  })
})

    it('removes iframe tags', () => {
      const input =
        'Content <iframe src="javascript:alert(1)"></iframe> more content'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('iframe')
      expect(result).not.toContain('javascript:')
      // Should contain the safe content
      expect(result).toContain('Content')
      expect(result).toContain('more content')
    })

    it('removes image tags with event handlers', () => {
      const input = 'Image <img src="x" onerror="alert(1)" /> test'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('img')
      expect(result).not.toContain('onerror')
      // Should contain the safe content
      expect(result).toContain('Image')
      expect(result).toContain('test')
    })

    it('removes javascript: URLs', () => {
      const input = 'Link with javascript:alert(1) URL'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('alert')
      // Should contain the safe content
      expect(result).toContain('Link')
      expect(result).toContain('with')
      expect(result).toContain('URL')
    })

    it('removes event handlers', () => {
      const input = 'Text with onclick="alert(1)" event'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('onclick')
      expect(result).not.toContain('alert')
      // Should contain the safe content
      expect(result).toContain('Text')
      expect(result).toContain('with')
      expect(result).toContain('event')
    })

    it('handles nested dangerous content', () => {
      const input = '<script>var a = "<script>alert(1)</script>";</script>'
      const result = sanitizeForXSS(input)
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
      // Should contain the safe content
      expect(result).toContain('var a = "')
      expect(result).toContain('";')
    })

    it('removes iframe tags', () => {
      const input =
        'Content <iframe src="javascript:alert(1)"></iframe> more content'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Content  more content')
      expect(result).not.toContain('iframe')
    })

    it('removes image tags with event handlers', () => {
      const input = 'Image <img src="x" onerror="alert(1)" /> test'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Image  test')
      expect(result).not.toContain('img')
      expect(result).not.toContain('onerror')
    })

    it('removes javascript: URLs', () => {
      const input = 'Link with javascript:alert(1) URL'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Link with  URL')
      expect(result).not.toContain('javascript:')
    })

    it('removes event handlers', () => {
      const input = 'Text with onclick="alert(1)" event'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Text with  event')
      expect(result).not.toContain('onclick')
    })

    it('handles nested dangerous content', () => {
      const input = '<script>var a = "<script>alert(1)</script>";</script>'
      const result = sanitizeForXSS(input)
      expect(result).toBe('')
    })

    it('preserves safe text content', () => {
      const input = 'This is a normal text without any dangerous content'
      const result = sanitizeForXSS(input)
      expect(result).toBe(input)
    })
  })

  describe('sanitizeAndHighlight', () => {
    it('sanitizes and highlights search terms', () => {
      const input = 'This is a test content for highlighting'
      const query = 'test'
      const result = sanitizeAndHighlight(input, query)
      expect(result).toContain('<mark')
      expect(result).toContain('test')
      expect(result).not.toContain('script')
    })

    it('removes XSS content while preserving highlighting', () => {
      const input =
        'Safe text with <script>alert("XSS")</script> and more safe text'
      const query = 'safe'
      const result = sanitizeAndHighlight(input, query)
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
      expect(result).toContain('<mark')
      expect(result).toContain('Safe')
      expect(result).toContain('safe')
    })

    it('handles XSS in highlighted terms', () => {
      const input = 'Search term <img src=x onerror=alert("XSS")> here'
      const query = 'term'
      const result = sanitizeAndHighlight(input, query)
      expect(result).not.toContain('img')
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('script')
      expect(result).toContain('<mark')
    })

    it('works with multiple search terms', () => {
      const input = 'This is a test for multiple search terms'
      const query = 'test multiple'
      const result = sanitizeAndHighlight(input, query)
      expect(result).toContain('<mark')
      expect(result).not.toContain('script')
    })
  })
})
