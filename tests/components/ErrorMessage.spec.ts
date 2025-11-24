import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from '~/components/ErrorMessage.vue'

describe('ErrorMessage', () => {
  it('renders correctly with error type', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        type: 'error',
        title: 'Error Title',
        message: 'Error message',
      },
    })

    expect(wrapper.find('h3').text()).toBe('Error Title')
    expect(wrapper.find('p').text()).toBe('Error message')
    expect(wrapper.classes()).toContain('bg-red-50')
  })

  it('renders correctly with warning type', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        type: 'warning',
        title: 'Warning Title',
        message: 'Warning message',
      },
    })

    expect(wrapper.find('h3').text()).toBe('Warning Title')
    expect(wrapper.find('p').text()).toBe('Warning message')
    expect(wrapper.classes()).toContain('bg-yellow-50')
  })

  it('renders correctly with info type', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        type: 'info',
        title: 'Info Title',
        message: 'Info message',
      },
    })

    expect(wrapper.find('h3').text()).toBe('Info Title')
    expect(wrapper.find('p').text()).toBe('Info message')
    expect(wrapper.classes()).toContain('bg-blue-50')
  })

  it('renders correctly with generic type', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        type: 'generic',
        title: 'Generic Title',
        message: 'Generic message',
      },
    })

    expect(wrapper.find('h3').text()).toBe('Generic Title')
    expect(wrapper.find('p').text()).toBe('Generic message')
    expect(wrapper.classes()).toContain('bg-gray-50')
  })

  it('emits retry event when retry button is clicked', async () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        type: 'error',
        title: 'Error Title',
        message: 'Error message',
        retryAction: true,
      },
    })

    const retryButton = wrapper.find('button')
    await retryButton.trigger('click')

    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('emits dismiss event when dismiss button is clicked', async () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        type: 'error',
        title: 'Error Title',
        message: 'Error message',
        retryAction: true, // Both actions enabled to have 2 buttons
        dismissAction: true,
      },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2) // Should have both retry and dismiss buttons

    const dismissButton = buttons[1] // Second button is dismiss
    await dismissButton.trigger('click')

    expect(wrapper.emitted('dismiss')).toBeTruthy()
  })

  it('does not show actions when showActions is false', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        type: 'error',
        title: 'Error Title',
        message: 'Error message',
        showActions: false,
      },
    })

    expect(wrapper.findAll('button')).toHaveLength(0)
  })
})
