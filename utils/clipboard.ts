/**
 * Clipboard Utilities
 *
 * Provides safe, cross-browser clipboard operations.
 * Handles both modern Clipboard API and fallback to execCommand.
 *
 * Architecture Principles:
 * - Single Responsibility: Only handles clipboard operations
 * - Fallback Support: Graceful degradation for older browsers
 * - Error Handling: Robust error handling with user feedback
 */

/**
 * Result of clipboard operation
 */
export interface ClipboardResult {
  success: boolean
  error?: string
}

/**
 * Copy text to clipboard using modern Clipboard API
 *
 * @param text - Text to copy
 * @returns Promise that resolves to ClipboardResult
 */
async function copyWithClipboardApi(text: string): Promise<ClipboardResult> {
  try {
    await navigator.clipboard.writeText(text)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown clipboard error',
    }
  }
}

/**
 * Copy text to clipboard using execCommand fallback
 * Used for browsers that don't support modern Clipboard API
 *
 * @param text - Text to copy
 * @returns ClipboardResult
 */
function copyWithExecCommand(text: string): ClipboardResult {
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      opacity: 0;
      pointer-events: none;
    `
    document.body.appendChild(textArea)
    textArea.select()
    textArea.setSelectionRange(0, 99999)
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (!successful) {
      throw new Error('execCommand copy failed')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown clipboard error',
    }
  }
}

/**
 * Copy text to clipboard with automatic fallback
 * Tries modern Clipboard API first, falls back to execCommand
 *
 * @param text - Text to copy
 * @returns Promise that resolves to ClipboardResult
 *
 * @example
 * ```typescript
 * const result = await copyToClipboard('https://example.com')
 * if (result.success) {
 *   console.log('Copied to clipboard')
 * } else {
 *   console.error('Failed to copy:', result.error)
 * }
 * ```
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  // Try modern Clipboard API first
  const modernResult = await copyWithClipboardApi(text)
  if (modernResult.success) {
    return modernResult
  }

  // Fallback to execCommand for older browsers
  return copyWithExecCommand(text)
}
