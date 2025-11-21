import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '@/components/SearchBar.vue'

describe('SearchBar', () => {
  it('renders correctly with empty value', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
    })

    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('value')).toBe('')
    expect(wrapper.find('button').exists()).toBe(false) // Clear button should not show when empty
  })

  it('renders with initial value', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test search',
      },
    })

    expect(wrapper.find('input').attributes('value')).toBe('test search')
    expect(wrapper.find('button').exists()).toBe(true) // Clear button should show when has value
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.find('input')
    await input.setValue('new search text')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([
      'new search text',
    ])
  })

  it('emits search event on input', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.find('input')
    await input.setValue('search query')

    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual(['search query'])
  })

  it('clears search when clear button is clicked', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'search to clear',
      },
    })

    const clearButton = wrapper.find('button')
    await clearButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([''])

    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual([''])
  })

  it('displays clear button only when modelValue is not empty', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
    })

    // Initially no clear button
    expect(wrapper.find('button').exists()).toBe(false)

    // After setting value, clear button appears
    await wrapper.setProps({ modelValue: 'test' })
    expect(wrapper.find('button').exists()).toBe(true)

    // After clearing value, clear button disappears
    await wrapper.setProps({ modelValue: '' })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.find('input')
    expect(input.attributes('aria-label')).toBe('Search resources')
    expect(input.attributes('placeholder')).toBe(
      'Search resources by name, description, tags...'
    )
  })
})
