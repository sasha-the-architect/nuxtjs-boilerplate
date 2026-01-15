import { describe, it, expect } from 'vitest'
import {
  addUTMParams,
  generateShareUrls,
  generateResourceShareUrls,
} from '~/utils/shareUtils'

describe('shareUtils', () => {
  describe('addUTMParams', () => {
    it('should add UTM parameters to a valid URL', () => {
      const result = addUTMParams(
        'https://example.com/page',
        'source',
        'medium',
        'campaign'
      )

      expect(result).toBe(
        'https://example.com/page?utm_source=source&utm_medium=medium&utm_campaign=campaign'
      )
    })

    it('should add all UTM parameters when all are provided', () => {
      const result = addUTMParams(
        'https://example.com/page',
        'source',
        'medium',
        'campaign',
        'term',
        'content'
      )

      expect(result).toBe(
        'https://example.com/page?utm_source=source&utm_medium=medium&utm_campaign=campaign&utm_term=term&utm_content=content'
      )
    })

    it('should add only provided UTM parameters', () => {
      const result = addUTMParams(
        'https://example.com/page',
        'source',
        'medium',
        'campaign',
        undefined,
        'content'
      )

      expect(result).toBe(
        'https://example.com/page?utm_source=source&utm_medium=medium&utm_campaign=campaign&utm_content=content'
      )
    })

    it('should preserve existing URL parameters', () => {
      const result = addUTMParams(
        'https://example.com/page?existing=param',
        'source',
        'medium',
        'campaign'
      )

      expect(result).toContain('existing=param')
      expect(result).toContain('utm_source=source')
    })

    it('should return the original URL if URL parsing fails', () => {
      const result = addUTMParams('invalid-url', 'source', 'medium', 'campaign')

      expect(result).toBe('invalid-url')
    })

    it('should handle URLs with existing UTM parameters', () => {
      const result = addUTMParams(
        'https://example.com/page?utm_source=old',
        'newSource',
        'newMedium',
        'newCampaign'
      )

      expect(result).toContain('utm_source=newSource')
      expect(result).toContain('utm_medium=newMedium')
      expect(result).toContain('utm_campaign=newCampaign')
    })
  })

  describe('generateShareUrls', () => {
    const baseUrl = 'https://example.com/resource/123'
    const title = 'Test Resource Title'
    const description = 'Test Resource Description'

    it('should generate all social media share URLs', () => {
      const result = generateShareUrls(baseUrl, title, description)

      expect(result).toHaveProperty('twitter')
      expect(result).toHaveProperty('facebook')
      expect(result).toHaveProperty('linkedin')
      expect(result).toHaveProperty('reddit')
      expect(result).toHaveProperty('email')
    })

    it('should generate a proper Twitter share URL', () => {
      const result = generateShareUrls(baseUrl, title, description)

      expect(result.twitter).toContain('https://twitter.com/intent/tweet')
      expect(result.twitter).toContain(encodeURIComponent(title))
      expect(result.twitter).toContain(encodeURIComponent(baseUrl))
      expect(result.twitter).toContain('FreeResources')
      expect(result.twitter).toContain('WebDevelopment')
    })

    it('should generate a proper Facebook share URL', () => {
      const result = generateShareUrls(baseUrl, title, description)

      expect(result.facebook).toContain(
        'https://www.facebook.com/sharer/sharer.php'
      )
      expect(result.facebook).toContain(encodeURIComponent(baseUrl))
      expect(result.facebook).toContain(
        encodeURIComponent(`${title} - ${description}`)
      )
    })

    it('should generate a proper LinkedIn share URL', () => {
      const result = generateShareUrls(baseUrl, title, description)

      expect(result.linkedin).toContain(
        'https://www.linkedin.com/sharing/share-offsite/'
      )
      expect(result.linkedin).toContain(encodeURIComponent(baseUrl))
      expect(result.linkedin).toContain(encodeURIComponent(title))
      expect(result.linkedin).toContain(encodeURIComponent(description))
    })

    it('should generate a proper Reddit share URL', () => {
      const result = generateShareUrls(baseUrl, title, description)

      expect(result.reddit).toContain('https://www.reddit.com/submit')
      expect(result.reddit).toContain(encodeURIComponent(baseUrl))
      expect(result.reddit).toContain(encodeURIComponent(title))
    })

    it('should generate a proper email share URL', () => {
      const result = generateShareUrls(baseUrl, title, description)

      expect(result.email).toContain('mailto:')
      expect(result.email).toContain(encodeURIComponent(title))
      expect(result.email).toContain(
        'Check out this resource: https://example.com/resource/123'
      )
    })

    it('should work with empty description', () => {
      const result = generateShareUrls(baseUrl, title)

      expect(result.facebook).toContain(encodeURIComponent(`${title} - `))
      expect(result.linkedin).toContain(encodeURIComponent(''))
    })
  })

  describe('generateResourceShareUrls', () => {
    const baseUrl = 'https://example.com/resource/123'
    const title = 'Test Resource Title'
    const description = 'Test Resource Description'

    it('should generate all social media share URLs with resource-specific UTM parameters', () => {
      const result = generateResourceShareUrls(baseUrl, title, description)

      expect(result).toHaveProperty('twitter')
      expect(result).toHaveProperty('facebook')
      expect(result).toHaveProperty('linkedin')
      expect(result).toHaveProperty('reddit')
      expect(result).toHaveProperty('email')
    })

    it('should include resource-specific UTM parameters in the base URL', () => {
      const result = generateResourceShareUrls(baseUrl, title, description)

      // Check that UTM parameters are in the encoded base URL (URL encoded)
      expect(result.twitter).toContain('%3Futm_source%3Dsocial')
      expect(result.twitter).toContain('%26utm_medium%3Dshare')
      expect(result.twitter).toContain('%26utm_campaign%3Dresource-sharing')
    })

    it('should generate a proper Twitter share URL with UTM parameters', () => {
      const result = generateResourceShareUrls(baseUrl, title, description)

      const url = new URL(result.twitter)
      const urlParam = url.searchParams.get('url')
      expect(urlParam).toContain('utm_source=social')
      expect(urlParam).toContain('utm_medium=share')
      expect(urlParam).toContain('utm_campaign=resource-sharing')
    })

    it('should work with empty description', () => {
      const result = generateResourceShareUrls(baseUrl, title)

      expect(result.facebook).toContain(encodeURIComponent(`${title} - `))
      expect(result.linkedin).toContain(encodeURIComponent(''))
    })
  })
})
