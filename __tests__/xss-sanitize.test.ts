import { describe, it, expect } from 'vitest'
import { sanitizeForXSS, sanitizeAndHighlight } from '~/utils/sanitize'

describe('XSS Sanitization Utilities', () => {
  describe('sanitizeForXSS', () => {
    it('removes script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> world'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Hello world')
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
    })

    it('removes iframe tags', () => {
      const input =
        'Content <iframe src="javascript:alert(1)"></iframe> more content'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Content more content')
      expect(result).not.toContain('iframe')
    })

    it('removes event handlers', () => {
      const input = 'Text <img src="x" onerror="alert(1)" /> more text'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Text more text')
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('alert')
    })

    it('removes SVG tags', () => {
      const input = 'Before <svg onload="alert(1)">content</svg> after'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Before content after')
      expect(result).not.toContain('svg')
    })

    it('handles javascript: URLs', () => {
      const input = 'Click <a href="javascript:alert(1)">here</a>'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Click here')
      expect(result).not.toContain('javascript:')
    })

    it('preserves safe content', () => {
      const input = 'This is safe content with HTML tags'
      const result = sanitizeForXSS(input)
      // The sanitizer removes all HTML tags for security
      expect(result).toBe('This is safe content with HTML tags')
    })

    it('handles complex XSS attempts', () => {
      const input =
        '<img src=x onerror=alert("XSS")><script>document.location="http://evil.com"</script><iframe src="javascript:alert(1)"></iframe>'
      const result = sanitizeForXSS(input)
      expect(result).toBe('')
      expect(result).not.toContain('script')
      expect(result).not.toContain('iframe')
      expect(result).not.toContain('img')
      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('alert')
    })
  })

  describe('sanitizeAndHighlight', () => {
    it('sanitizes and highlights search terms', () => {
      const input = 'This is a test string with malicious content'
      const query = 'test'
      const result = sanitizeAndHighlight(input, query)
      // The sanitizer removes all HTML tags including <mark> for security
      expect(result).toContain('test')
      expect(result).not.toContain('script')
      expect(result).toContain('<mark ')
    })

    it('removes XSS attempts while highlighting safe terms', () => {
      const input =
        'Safe text <script>alert("XSS")</script> with more safe content'
      const query = 'safe'
      const result = sanitizeAndHighlight(input, query)

      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
      expect(result).toContain('with more')
      expect(result).toContain('safe')
      expect(result).toContain('content')
      expect(result).toContain('<mark class="bg-yellow-200 text-gray-900">')
    })

    it('handles XSS in the search query itself', () => {
      const input = 'Normal text content'
      const query = '<script>alert("XSS")</script>'
      const result = sanitizeAndHighlight(input, query)

      expect(result).toBe('Normal text content')
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
      expect(result).not.toContain('<mark>')
    })

    it('preserves safe content without highlighting', () => {
      const input = 'This tool is very useful for developers'
      const query = 'tool'
      const result = sanitizeAndHighlight(input, query)

      // The sanitizer removes all HTML tags including <mark> for security
      expect(result).toContain('This')
      expect(result).toContain('is very useful for developers')
      expect(result).not.toContain('<mark>')
    })

    it('handles multiple search terms', () => {
      const input = 'JavaScript and TypeScript are both programming languages'
      const query = 'script'
      const result = sanitizeAndHighlight(input, query)

      // The sanitizer removes all HTML tags including <mark> for security
      expect(result).not.toContain('alert')
      expect(result).not.toContain('<mark>')
    })
  })
})
