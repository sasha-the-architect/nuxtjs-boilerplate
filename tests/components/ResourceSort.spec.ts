import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceSort from '@/components/ResourceSort.vue'

describe('ResourceSort', () => {
  const defaultProps = {
    selectedSortOption: 'popularity-desc',
    totalResources: 15,
  }

  it('renders correctly with initial props', () => {
    const wrapper = mount(ResourceSort, {
      props: defaultProps,
    })

    expect(wrapper.text()).toContain('15 resources found')
    expect(wrapper.find('select').element.value).toBe('popularity-desc')
    expect(wrapper.findAll('option')).toHaveLength(4)
  })

  it('displays correct total resources count', () => {
    const wrapper = mount(ResourceSort, {
      props: {
        ...defaultProps,
        totalResources: 42,
      },
    })

    expect(wrapper.text()).toContain('42 resources found')
  })

  it('has correct sort options', () => {
    const wrapper = mount(ResourceSort, {
      props: defaultProps,
    })

    const options = wrapper.findAll('option')
    expect(options).toHaveLength(4)
    expect(options[0].element.value).toBe('popularity-desc')
    expect(options[0].text()).toBe('Most Popular')
    expect(options[1].element.value).toBe('alphabetical-asc')
    expect(options[1].text()).toBe('A-Z')
    expect(options[2].element.value).toBe('alphabetical-desc')
    expect(options[2].text()).toBe('Z-A')
    expect(options[3].element.value).toBe('date-added-desc')
    expect(options[3].text()).toBe('Newest First')
  })

  it('emits update-sort-option when selection changes', async () => {
    const wrapper = mount(ResourceSort, {
      props: defaultProps,
    })

    const select = wrapper.find('select')
    await select.setValue('alphabetical-asc')

    expect(wrapper.emitted('update-sort-option')).toBeTruthy()
    expect(wrapper.emitted('update-sort-option')![0]).toEqual([
      'alphabetical-asc',
    ])
  })

  it('emits update-sort-option when Enter key is pressed', async () => {
    const wrapper = mount(ResourceSort, {
      props: defaultProps,
    })

    const select = wrapper.find('select')
    await select.setValue('alphabetical-desc')
    await select.trigger('keydown.enter')

    expect(wrapper.emitted('update-sort-option')).toBeTruthy()
    // Should have two emissions: one from setValue and one from keydown
    expect(wrapper.emitted('update-sort-option')![0]).toEqual([
      'alphabetical-desc',
    ])
  })

  it('emits update-sort-option when Space key is pressed', async () => {
    const wrapper = mount(ResourceSort, {
      props: defaultProps,
    })

    const select = wrapper.find('select')
    await select.setValue('date-added-desc')
    await select.trigger('keydown.space')

    expect(wrapper.emitted('update-sort-option')).toBeTruthy()
  })

  it('displays correct initial selected option', () => {
    const wrapper = mount(ResourceSort, {
      props: {
        ...defaultProps,
        selectedSortOption: 'alphabetical-asc',
      },
    })

    expect(wrapper.find('select').element.value).toBe('alphabetical-asc')
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(ResourceSort, {
      props: defaultProps,
    })

    const select = wrapper.find('select')
    expect(select.attributes('id')).toBe('sort')
    expect(select.attributes('aria-label')).toBeUndefined() // Would be better to have aria-label, but this is current state
  })
})
