/**
 * Composable for managing focus in accessible components
 */

export const useFocusManagement = () => {
  /**
   * Trap focus within an element - useful for modals and dropdowns
   */
  const trapFocus = (element: HTMLElement | null) => {
    if (!element) return

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey && document.activeElement === firstFocusable) {
        // If shift-tabbing from first element, go to last
        lastFocusable.focus()
        e.preventDefault()
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        // If tabbing from last element, go to first
        firstFocusable.focus()
        e.preventDefault()
      }
    }

    // Focus the first element to start
    firstFocusable.focus()

    // Add event listener to trap focus
    element.addEventListener('keydown', handleKeyDown)

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }

  /**
   * Focus the first focusable element in a container
   */
  const focusFirstElement = (container: HTMLElement | null) => {
    if (!container) return

    const firstFocusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement | null

    if (firstFocusable) {
      firstFocusable.focus()
    }
  }

  /**
   * Move focus to an element and scroll if needed
   */
  const focusElement = (element: HTMLElement | null) => {
    if (element) {
      element.focus({ preventScroll: false })
    }
  }

  return {
    trapFocus,
    focusFirstElement,
    focusElement,
  }
}
