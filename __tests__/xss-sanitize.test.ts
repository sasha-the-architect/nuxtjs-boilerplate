import { describe, it, expect } from 'vitest'
import { sanitizeForXSS, sanitizeAndHighlight } from '~/utils/sanitize'

describe('XSS Sanitization Utilities', () => {
  describe('sanitizeForXSS', () => {
    it('removes script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> world'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Hello  world')
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
    })

    it('removes iframe tags', () => {
      const input =
        'Content <iframe src="javascript:alert(1)"></iframe> more content'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Content  more content')
      expect(result).not.toContain('iframe')
    })

    it('removes event handlers', () => {
      const input = 'Text <img src="x" onerror="alert(1)" /> more text'
      const result = sanitizeForXSS(input)
      expect(result).toBe('Text  more text')
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
      const input = 'This is safe content with <strong>HTML</strong> tags'
      const result = sanitizeForXSS(input)
<<<<<<< HEAD
      // The sanitizer removes HTML tags for security, so we expect plain text
      expect(result).toBe('This is safe content with HTML tags')
=======
      expect(result).toBe('This is safe content with  tags')
>>>>>>> origin/main
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
      expect(result).toContain(
        '<mark class="bg-yellow-200 text-gray-900">test</mark>'
      )
      expect(result).not.toContain('script')
    })

    it('removes XSS attempts while highlighting safe terms', () => {
      const input =
        'Safe text <script>alert("XSS")</script> with more safe content'
      const query = 'safe'
      const result = sanitizeAndHighlight(input, query)

      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
      expect(result).toContain('with more safe content')

      // Should highlight the safe term if it appears
      expect(result.toLowerCase()).toContain(
        '<mark class="bg-yellow-200 text-gray-900">safe</mark>'
      )
    })

    it('handles XSS in the search query itself', () => {
      const input = 'Normal text content'
      const query = '<script>alert("XSS")</script>'
      const result = sanitizeAndHighlight(input, query)

      expect(result).toBe('Normal text content')
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
    })

    it('preserves highlighting of safe search terms', () => {
      const input = 'This tool is very useful for developers'
      const query = 'tool'
      const result = sanitizeAndHighlight(input, query)

      expect(result).toContain(
        '<mark class="bg-yellow-200 text-gray-900">tool</mark>'
      )
      expect(result).toContain('This')
      expect(result).toContain('is very useful for developers')
    })

    it('handles multiple search terms', () => {
      const input = 'JavaScript and TypeScript are both programming languages'
      const query = 'script'
      const result = sanitizeAndHighlight(input, query)

      // Should highlight 'script' in both JavaScript and TypeScript (case-insensitive)
      expect(result).toContain(
        '<mark class="bg-yellow-200 text-gray-900">Script</mark>'
      )
      expect(result).not.toContain('alert')
    })
  })
})
