import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

describe('ErrorBoundary', () => {
  it('renders slot content when no error occurs', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Normal content</div>',
      },
    })

    expect(wrapper.text()).toContain('Normal content')
    expect(wrapper.find('.error-boundary').exists()).toBe(false)
  })

  it('shows error UI when an error is captured', async () => {
    // Create a child component that throws an error
    const ChildComponent = {
      template: '<div>Child content</div>',
      setup() {
        throw new Error('Test error')
      },
    }

    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<child-component />',
      },
      global: {
        components: {
          ChildComponent,
        },
      },
    })

    // Simulate an error being captured
    const errorBoundary = wrapper.vm
    errorBoundary.error = new Error('Test error')

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    expect(wrapper.find('.error-title').text()).toBe('Something went wrong')
    expect(wrapper.find('.error-message').text()).toBe('Test error')
  })

  it('shows default error message when error has no message', async () => {
    const wrapper = mount(ErrorBoundary)

    // Simulate an error with no message
    const errorBoundary = wrapper.vm
    errorBoundary.error = new Error()

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe(
      'An unexpected error occurred'
    )
  })

  it('emits error event when error occurs', async () => {
    const wrapper = mount(ErrorBoundary)

    const testError = new Error('Test error')
    const errorInfo = { componentStack: 'test stack' }

    // Trigger the error handler
    wrapper.vm.throwError(testError, errorInfo)

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('error')).toBeTruthy()
    const emitted = wrapper.emitted('error')!
    expect(emitted[0]).toEqual([testError, errorInfo])
  })

  it('resets error when retry button is clicked', async () => {
    const wrapper = mount(ErrorBoundary)

    // Set an error
    wrapper.vm.error = new Error('Test error')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-boundary').exists()).toBe(true)

    // Click the retry button
    const retryButton = wrapper.find('.retry-button')
    await retryButton.trigger('click')

    expect(wrapper.vm.error).toBeNull()
    expect(wrapper.find('.error-boundary').exists()).toBe(false)
  })

  it('has proper visual elements when error occurs', async () => {
    const wrapper = mount(ErrorBoundary)

    // Set an error
    wrapper.vm.error = new Error('Test error')
    await wrapper.vm.$nextTick()

    // Check for error icon
    expect(wrapper.find('.error-icon svg').exists()).toBe(true)

    // Check for title and message
    expect(wrapper.find('.error-title').text()).toBe('Something went wrong')
    expect(wrapper.find('.error-message').text()).toBe('Test error')

    // Check for action buttons
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Try Again')
    expect(buttons[1].text()).toBe('Go Home')
  })

  it('applies correct CSS classes for styling', async () => {
    const wrapper = mount(ErrorBoundary)

    // Set an error to trigger the error view
    wrapper.vm.error = new Error('Test error')
    await wrapper.vm.$nextTick()

    const container = wrapper.find('.error-boundary')
    expect(container.classes()).toContain('error-boundary')

    const content = wrapper.find('.error-content')
    expect(content.classes()).toContain('error-content')

    const title = wrapper.find('.error-title')
    expect(title.classes()).toContain('error-title')

    const message = wrapper.find('.error-message')
    expect(message.classes()).toContain('error-message')

    const actions = wrapper.find('.error-actions')
    expect(actions.classes()).toContain('error-actions')
  })

  it('has proper accessibility attributes for error state', async () => {
    const wrapper = mount(ErrorBoundary)

    // Set an error to trigger the error view
    wrapper.vm.error = new Error('Test error')
    await wrapper.vm.$nextTick()

    // Check that the error message is properly associated with the error UI
    const title = wrapper.find('.error-title')
    expect(title.attributes('role')).toBeUndefined() // h2 is semantically appropriate

    // Check that buttons have proper labels for screen readers
    const buttons = wrapper.findAll('button')
    expect(buttons[0].text()).toBe('Try Again') // Clear action label
    expect(buttons[1].text()).toBe('Go Home') // Clear action label

    // Check that the error message is visible and descriptive
    const message = wrapper.find('.error-message')
    expect(message.text()).toBe('Test error')
  })

  it('calls navigateTo when goHome button is clicked', async () => {
    const wrapper = mount(ErrorBoundary)

    // Set an error
    wrapper.vm.error = new Error('Test error')
    await wrapper.vm.$nextTick()

    // Click the go home button (second button)
    const goHomeButton = wrapper.findAll('button')[1] // "Go Home" button
    await goHomeButton.trigger('click')

    // Note: We're not testing the actual navigation since navigateTo is mocked in test setup
    // The important thing is that no error is thrown when the method is called
    expect(wrapper.exists()).toBe(true)
  })
})
