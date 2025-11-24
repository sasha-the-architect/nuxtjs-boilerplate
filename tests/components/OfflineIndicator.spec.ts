import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, onUnmounted } from 'vue'
import OfflineIndicator from '~/components/OfflineIndicator.vue'

describe('OfflineIndicator', () => {
  let originalOnLine: boolean

  beforeEach(() => {
    // Store original navigator.onLine
    originalOnLine = (navigator as any).onLine
  })

  afterEach(() => {
    // Restore original navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
    })
    vi.clearAllMocks()
  })

  it('does not show when online', () => {
    // Mock navigator to be online before mounting
    vi.stubGlobal('onLine', true)

    const wrapper = mount(OfflineIndicator)

    // The indicator should not be visible when online
    expect(wrapper.find('.fixed.top-0').exists()).toBe(false)

    // Restore original value
    vi.unstubAllGlobals()
  })

  it('shows when offline', async () => {
    // Mock navigator to be offline before mounting
    vi.stubGlobal('onLine', false)

    const wrapper = mount(OfflineIndicator)

    // Wait for component to update after mount
    await wrapper.vm.$nextTick()

    // The indicator should be visible when offline
    expect(wrapper.find('.fixed.top-0').exists()).toBe(true)
    expect(wrapper.find('.bg-yellow-100').exists()).toBe(true)
    expect(wrapper.text()).toContain(
      'You are offline. Some features may be limited.'
    )

    // Restore original value
    vi.unstubAllGlobals()
  })

  it('has correct styling classes when visible', async () => {
    // Mock navigator to be offline before mounting
    vi.stubGlobal('onLine', false)

    const wrapper = mount(OfflineIndicator)

    // Wait for component to update after mount
    await wrapper.vm.$nextTick()

    const indicator = wrapper.find('.fixed.top-0')
    expect(indicator.exists()).toBe(true)

    // Check positioning and styling classes
    expect(indicator.classes()).toContain('fixed')
    expect(indicator.classes()).toContain('top-0')
    expect(indicator.classes()).toContain('left-0')
    expect(indicator.classes()).toContain('right-0')
    expect(indicator.classes()).toContain('bg-yellow-100')
    expect(indicator.classes()).toContain('border-b')
    expect(indicator.classes()).toContain('border-yellow-300')
    expect(indicator.classes()).toContain('p-2')
    expect(indicator.classes()).toContain('z-50')

    // Restore original value
    vi.unstubAllGlobals()
  })

  it('has correct content structure', async () => {
    // Mock navigator to be offline before mounting
    vi.stubGlobal('onLine', false)

    const wrapper = mount(OfflineIndicator)

    // Wait for component to update after mount
    await wrapper.vm.$nextTick()

    // Check container structure
    const container = wrapper.find(
      '.max-w-7xl.mx-auto.px-4.flex.items-center.justify-center'
    )
    expect(container.exists()).toBe(true)

    // Check icon
    const icon = wrapper.find('svg.h-5.w-5.text-yellow-600.mr-2')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('h-5')
    expect(icon.classes()).toContain('w-5')
    expect(icon.classes()).toContain('text-yellow-600')
    expect(icon.classes()).toContain('mr-2')

    // Check text message
    const textElement = wrapper.find('.text-yellow-800.text-sm.font-medium')
    expect(textElement.exists()).toBe(true)
    expect(textElement.text()).toBe(
      'You are offline. Some features may be limited.'
    )

    // Restore original value
    vi.unstubAllGlobals()
  })

  it('responds to online/offline events', async () => {
    // Mock navigator to be online initially
    vi.stubGlobal('onLine', true)

    const wrapper = mount(OfflineIndicator)

    // Initially should not be visible
    expect(wrapper.find('.fixed.top-0').exists()).toBe(false)

    // Restore and set to offline to trigger event listener
    vi.unstubAllGlobals()
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    })

    // Trigger the offline event
    window.dispatchEvent(new Event('offline'))

    // Wait for Vue to update
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should now be visible
    expect(wrapper.find('.fixed.top-0').exists()).toBe(true)

    // Change to online
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    })

    // Trigger the online event
    window.dispatchEvent(new Event('online'))

    // Wait for Vue to update
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should no longer be visible
    expect(wrapper.find('.fixed.top-0').exists()).toBe(false)
  })

  it('cleans up event listeners on unmount', () => {
    // Mock navigator to be offline before mounting
    vi.stubGlobal('onLine', false)

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const wrapper = mount(OfflineIndicator)

    // Check that event listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    )
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    )

    // Unmount the component
    wrapper.unmount()

    // Check that event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    )

    // Restore original value
    vi.unstubAllGlobals()
  })
})
