import DOMPurify from 'dompurify'

const FORBID_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'img',
  'link',
  'meta',
  'base',
  'basefont',
  'frame',
  'frameset',
  'ilayer',
  'layer',
  'bgsound',
  'title',
  'style',
  'svg',
  'audio',
  'video',
  'canvas',
  'applet',
  'area',
  'map',
  'object',
  'param',
  'source',
  'track',
  'keygen',
  'output',
  'progress',
  'meter',
  'details',
  'summary',
  'menu',
  'menuitem',
  'dialog',
  'a',
  'strong',
  'b',
  'i',
  'em',
  'u',
  'span',
  'div',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'br',
  'hr',
] as const

const FORBID_ATTR = [
  'src',
  'href',
  'style',
  'onload',
  'onerror',
  'onclick',
  'onmouseover',
  'onmouseout',
  'onfocus',
  'onblur',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'ondblclick',
  'ondrag',
  'ondragend',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondragstart',
  'ondrop',
  'onmousedown',
  'onmouseenter',
  'onmouseleave',
  'onmousemove',
  'onmouseout',
  'onmouseover',
  'onmouseup',
  'onwheel',
  'onpause',
  'onplay',
  'onplaying',
  'onprogress',
  'onratechange',
  'onseeked',
  'onseeking',
  'onstalled',
  'onsuspend',
  'ontimeupdate',
  'onvolumechange',
  'onwaiting',
  'onafterprint',
  'onbeforeprint',
  'onbeforeunload',
  'onerror',
  'onhashchange',
  'onload',
  'onmessage',
  'onoffline',
  'ononline',
  'onpagehide',
  'onpageshow',
  'onpopstate',
  'onresize',
  'onscroll',
  'onstorage',
  'onunload',
  'data',
  'formaction',
  'xmlns',
  'xlink:href',
  'usemap',
  'ismap',
  'action',
  'code',
  'codebase',
  'classid',
  'pluginspage',
  'pluginurl',
  'declare',
  'standby',
  'id',
  'name',
] as const

const FORBID_CONTENTS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'img',
  'link',
  'meta',
  'base',
  'basefont',
  'frame',
  'frameset',
  'ilayer',
  'layer',
  'bgsound',
  'title',
  'style',
  'svg',
] as const

const SANITIZE_CONFIG = {
  FORBID_TAGS,
  FORBID_ATTR,
  FORBID_CONTENTS,
  SANITIZE_DOM: true,
} as const

/**
 * Sanitizes content to prevent XSS attacks using multiple layers of protection
 * @param content - The content to sanitize
 * @returns Sanitized content safe for HTML rendering
 */
export const sanitizeForXSS = (content: string): string => {
  if (!content) return content

  // First layer: Preprocessing to remove dangerous content
  let preprocessed = content

  // Remove script tags and their content while preserving whitespace
  // Match <script>content</script> or <script/> and replace with same whitespace
  preprocessed = preprocessed.replace(
    /(\s*)<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
    '$1'
  )
  preprocessed = preprocessed.replace(/<\s*script[^>]*\/?\s*>/gi, '')

  // Remove other dangerous tags that might have been missed
  preprocessed = preprocessed.replace(
    /<\s*(iframe|object|embed|form|input|button|img|link|meta|base|basefont|frame|frameset|ilayer|layer|bgsound|title|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ''
  )
  preprocessed = preprocessed.replace(
    /<\s*(iframe|object|embed|form|input|button|img|link|meta|base|basefont|frame|frameset|ilayer|layer|bgsound|title|style)[^>]*\/?\s*>/gi,
    ''
  )

  // Remove SVG tags which can contain malicious code, but preserve their text content
  preprocessed = preprocessed.replace(
    /<\s*svg[^>]*>[\s\S]*?<\s*\/\s*svg\s*>/gi,
    match => {
      // Extract text content from between SVG tags, removing any nested HTML tags
      return match.replace(/<[^>]*>/g, '')
    }
  )
  preprocessed = preprocessed.replace(/<\s*svg[^>]*\/?\s*>/gi, '')

  // Remove any remaining dangerous patterns
  preprocessed = preprocessed.replace(/<!--[\s\S]*?-->/g, '') // Remove comments that might contain code
  preprocessed = preprocessed.replace(/<![\s\S]*?>/g, '') // Remove any other declarations

  const sanitized = DOMPurify.sanitize(preprocessed, {
    ALLOWED_TAGS: ['mark'],
    ALLOWED_ATTR: ['class'],
    ...SANITIZE_CONFIG,
  })

  // Third layer: Additional sanitization to remove any dangerous patterns that might remain
  return sanitized
    .replace(/<\s*a[^>]*>([\s\S]*?)<\s*\/\s*a\s*>/gi, '$1') // Remove anchor tags but preserve their content
    .replace(/<\s*a[^>]*\/?\s*>/gi, '') // Remove self-closing anchor tags
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove any event handlers
    .replace(/script/gi, '') // Additional protection against script substrings
    .replace(/iframe/gi, '') // Additional protection
    .replace(/object/gi, '') // Additional protection
    .replace(/embed/gi, '') // Additional protection
    .replace(/img/gi, '') // Additional protection
    .replace(/svg/gi, '') // Additional protection
    .replace(/vbs/gi, '') // Additional protection
    .replace(/&#(\d+);?/g, '') // Remove HTML entities that might be used for encoding
    .replace(/&#[xX]([0-9a-fA-F]+);?/g, '') // Remove hex HTML entities
}

/**
 * Sanitizes and highlights search terms in content while preventing XSS
 * @param text - The text to highlight
 * @param searchQuery - The search query to highlight
 * @returns HTML string with highlighted terms, safely sanitized
 */
export const sanitizeAndHighlight = (
  text: string,
  searchQuery: string
): string => {
  if (!searchQuery || !text) return text || ''

  // First, sanitize the input text to prevent XSS
  const sanitizedText = sanitizeForXSS(text)

  // Escape special regex characters in search query
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  // Create highlighted text - only highlighting the already sanitized text
  const highlighted = sanitizedText.replace(
    regex,
    '<mark class="bg-yellow-200 text-gray-900">$&</mark>'
  )

  const fullySanitized = DOMPurify.sanitize(highlighted, {
    ALLOWED_TAGS: ['mark'],
    ALLOWED_ATTR: ['class'],
    ...SANITIZE_CONFIG,
  })

  // Return the fully sanitized HTML
  return fullySanitized
}
