/**
 * Utility functions for social sharing
 */

/**
 * Add UTM parameters to a URL
 */
export const addUTMParams = (
  url: string,
  source: string,
  medium: string,
  campaign: string,
  term?: string,
  content?: string
): string => {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('utm_source', source)
    urlObj.searchParams.set('utm_medium', medium)
    urlObj.searchParams.set('utm_campaign', campaign)

    if (term) urlObj.searchParams.set('utm_term', term)
    if (content) urlObj.searchParams.set('utm_content', content)

    return urlObj.toString()
  } catch (error) {
    // If URL parsing fails, return the original URL
    return url
  }
}

/**
 * Generate social media share URLs with UTM parameters
 */
export const generateShareUrls = (
  baseUrl: string,
  title: string,
  description?: string
) => {
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || '')
  const encodedBaseUrl = encodeURIComponent(baseUrl)

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedBaseUrl}&hashtags=FreeResources,WebDevelopment`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedBaseUrl}&quote=${encodedTitle} - ${encodedDescription}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedBaseUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    reddit: `https://www.reddit.com/submit?url=${encodedBaseUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=Check out this resource: ${baseUrl}%0D%0A%0D%0A${encodedDescription}`,
  }
}

/**
 * Generate resource-specific share URLs with UTM parameters
 */
export const generateResourceShareUrls = (
  baseUrl: string,
  title: string,
  description?: string
) => {
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || '')
  const encodedBaseUrl = encodeURIComponent(
    addUTMParams(baseUrl, 'social', 'share', 'resource-sharing')
  )

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedBaseUrl}&hashtags=FreeResources,WebDevelopment`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedBaseUrl}&quote=${encodedTitle} - ${encodedDescription}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedBaseUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    reddit: `https://www.reddit.com/submit?url=${encodedBaseUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=Check out this resource: ${baseUrl}%0D%0A%0D%0A${encodedDescription}`,
  }
}
