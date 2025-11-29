import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SavedSearchManager from '~/components/SavedSearchManager.vue'

describe('SavedSearchManager', () => {
  const createWrapper = (props = {}) => {
    return mount(SavedSearchManager, {
      props: {
        savedSearches: [],
        currentQuery: '',
        ...props,
      },
      global: {
        components: {
          // No external components to mock in this case
        },
      },
    })
  }

  it('renders correctly', () => {
    const wrapper = createWrapper()
    expect(
      wrapper.find('input[placeholder="Name your search..."]').exists()
    ).toBe(true)
    expect(wrapper.find('button').text()).toBe('Save Search')
  })

  it('disables save button when no query or name', async () => {
    const wrapper = createWrapper({ currentQuery: '' })
    const saveButton = wrapper.find('button')

    expect(saveButton.attributes('disabled')).toBe('')

    // Enable button when both query and name exist
    await wrapper.setProps({ currentQuery: 'test query' })
    await wrapper.setData({ newSavedSearchName: 'Test Search' })

    expect(saveButton.attributes('disabled')).toBe(undefined)
  })

  it('emits save-search event when save button is clicked', async () => {
    const wrapper = createWrapper({ currentQuery: 'test query' })
    const input = wrapper.find('input[placeholder="Name your search..."]')
    const button = wrapper.find('button')

    await input.setValue('My Test Search')
    await button.trigger('click')

    expect(wrapper.emitted('save-search')).toBeTruthy()
    expect(wrapper.emitted('save-search')![0]).toEqual([
      'My Test Search',
      'test query',
    ])
  })

  it('emits save-search event when Enter is pressed in input', async () => {
    const wrapper = createWrapper({ currentQuery: 'test query' })
    const input = wrapper.find('input[placeholder="Name your search..."]')

    await input.setValue('My Test Search')
    await input.trigger('keydown.enter')

    expect(wrapper.emitted('save-search')).toBeTruthy()
    expect(wrapper.emitted('save-search')![0]).toEqual([
      'My Test Search',
      'test query',
    ])
  })

  it('shows saved searches list when saved searches exist', async () => {
    const savedSearches = [
      { name: 'AI Tools', query: 'AI AND tools', createdAt: new Date() },
      { name: 'Web Hosting', query: 'web hosting', createdAt: new Date() },
    ]

    const wrapper = createWrapper({ savedSearches, currentQuery: 'test' })

    // Check that saved searches are displayed
    expect(wrapper.findAll('div[title^="Search:"]').length).toBe(2)
    expect(wrapper.text()).toContain('AI Tools')
    expect(wrapper.text()).toContain('Web Hosting')
  })

  it('emits use-saved-search event when a saved search is clicked', async () => {
    const savedSearch = {
      name: 'AI Tools',
      query: 'AI AND tools',
      createdAt: new Date(),
    }
    const wrapper = createWrapper({
      savedSearches: [savedSearch],
      currentQuery: 'test',
    })

    const searchButton = wrapper.find('button[title^="Search:"]')
    await searchButton.trigger('click')

    expect(wrapper.emitted('use-saved-search')).toBeTruthy()
    expect(wrapper.emitted('use-saved-search')![0]).toEqual([savedSearch])
  })

  it('emits remove-saved-search event when delete button is clicked', async () => {
    const savedSearch = {
      name: 'AI Tools',
      query: 'AI AND tools',
      createdAt: new Date(),
    }
    const wrapper = createWrapper({
      savedSearches: [savedSearch],
      currentQuery: 'test',
    })

    const deleteButton = wrapper.findAll(
      'button[aria-label^="Remove saved search"]'
    )[0]
    await deleteButton.trigger('click')

    expect(wrapper.emitted('remove-saved-search')).toBeTruthy()
    expect(wrapper.emitted('remove-saved-search')![0]).toEqual(['AI AND tools'])
  })

  it('shows edit modal when edit button is clicked', async () => {
    const savedSearch = {
      name: 'AI Tools',
      query: 'AI AND tools',
      createdAt: new Date(),
    }
    const wrapper = createWrapper({
      savedSearches: [savedSearch],
      currentQuery: 'test',
    })

    const editButton = wrapper.findAll(
      'button[aria-label^="Edit saved search"]'
    )[0]
    await editButton.trigger('click')

    // Check if the modal appears
    expect(wrapper.find('.fixed').exists()).toBe(true)
    expect(wrapper.find('input').element.value).toBe('AI Tools')
  })

  it('emits update-saved-search event when update is confirmed', async () => {
    const savedSearch = {
      name: 'AI Tools',
      query: 'AI AND tools',
      createdAt: new Date(),
    }
    const wrapper = createWrapper({
      savedSearches: [savedSearch],
      currentQuery: 'test',
    })

    // Open edit modal
    const editButton = wrapper.findAll(
      'button[aria-label^="Edit saved search"]'
    )[0]
    await editButton.trigger('click')

    // Change the name in the modal
    const input = wrapper.find('input')
    await input.setValue('Updated AI Tools')

    // Click update button
    const updateButton = wrapper.find('button').wrappers[0]
    await updateButton.trigger('click')

    expect(wrapper.emitted('update-saved-search')).toBeTruthy()
    expect(wrapper.emitted('update-saved-search')![0]).toEqual([
      'AI AND tools',
      'Updated AI Tools',
      'AI AND tools',
    ])
  })

  it('formats date correctly', () => {
    const wrapper = createWrapper()
    const date = new Date(2023, 0, 15) // January 15, 2023

    const formatted = wrapper.vm.formatDate(date)
    expect(formatted).toContain('Jan')
    expect(formatted).toContain('15')
  })
})
