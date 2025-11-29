import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AdvancedSearchBar from '~/components/AdvancedSearchBar.vue'

// Mock the composables
vi.mock('~/composables/useResourceData', () => ({
  useResourceData: () => ({
    resources: []
  })
}))

vi.mock('~/composables/useAdvancedResourceSearch', () => ({
  useAdvancedResourceSearch: () => ({
    getAdvancedSuggestions: vi.fn(() => []),
    addToSearchHistory: vi.fn(),
    searchHistory: { value: [] },
    parseQuery: vi.fn(() => ({ terms: [], operators: [], filters: {} })),
  })
}))

vi.mock('~/composables/useResources', () => ({
  useResources: () => ({
    getSuggestions: vi.fn(() => []),
    getSearchHistory: vi.fn(() => []),
    addSearchToHistory: vi.fn(),
    clearSearchHistory: vi.fn(),
  })
}))

vi.mock('~/composables/useSearchHistory', () => ({
  useSearchHistory: () => ({
    searchHistory: { value: [] },
    getRecentSearches: vi.fn(() => []),
    addSearchToHistory: vi.fn(),
    clearSearchHistory: vi.fn(),
    removeSearchFromHistory: vi.fn(),
    getTopSearches: vi.fn(() => []),
    getSearchesInTimeRange: vi.fn(() => []),
  })
}))

describe('AdvancedSearchBar', () => {
  const createWrapper = (props = {}) => {
    return mount(AdvancedSearchBar, {
      props: {
        modelValue: '',
        debounceTime: 300,
        enableAdvancedFeatures: true,
        ...props
      },
      global: {
        components: {
          // Mock components that are used in the template
          SearchSuggestions: {
            template: '<div><slot /></div>',
            props: ['suggestions', 'searchHistory', 'visible']
          }
        }
      }
    })
  }

  it('renders correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('#advanced-search-input').exists()).toBe(true)
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')
    
    await input.setValue('test query')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['test query'])
  })

  it('emits search event when input changes', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')
    
    await input.setValue('test query')
    
    // Wait for debounce timeout
    await new Promise(resolve => setTimeout(resolve, 350))
    
    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('shows validation indicator for invalid queries', async () => {
    // Mock parseQuery to return invalid syntax
    vi.mocked(() => import('~/composables/useAdvancedResourceSearch').then(mod => mod.useAdvancedResourceSearch))
      .mockReturnValueOnce({
        getAdvancedSuggestions: vi.fn(() => []),
        addToSearchHistory: vi.fn(),
        searchHistory: { value: [] },
        parseQuery: vi.fn(() => ({ terms: [], operators: [], filters: {} })),
      })
    
    const wrapper = createWrapper()
    
    // Test with unbalanced quotes which should be invalid
    await wrapper.setProps({ modelValue: 'test "unbalanced' })
    
    // The input should have the invalid class
    const input = wrapper.find('#advanced-search-input')
    expect(input.classes()).toContain('border-red-500')
  })

  it('shows help tooltip when F1 is pressed', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')
    
    await input.trigger('keydown', { key: 'F1' })
    
    expect(wrapper.vm.showHelpTooltip).toBe(true)
  })

  it('shows help tooltip when Shift + ? is pressed', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')
    
    await input.trigger('keydown', { key: '?', shiftKey: true })
    
    expect(wrapper.vm.showHelpTooltip).toBe(true)
  })

  it('clears search when clear button is clicked', async () => {
    const wrapper = createWrapper({ modelValue: 'test query' })
    const clearButton = wrapper.find('button[aria-label="Clear search"]')
    
    await clearButton.trigger('click')
    
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([''])
    expect(wrapper.emitted('search')![0]).toEqual([''])
  })

  it('has proper accessibility attributes', () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')
    
    expect(input.attributes('aria-label')).toBe('Advanced search resources')
    expect(input.attributes('aria-describedby')).toBe('advanced-search-results-info')
  })
})
  }

  it('renders correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('#advanced-search-input').exists()).toBe(true)
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')

    await input.setValue('test query')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['test query'])
  })

  it('emits search event when input changes', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')

    await input.setValue('test query')

    // Wait for debounce timeout
    await new Promise(resolve => setTimeout(resolve, 350))

    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('shows validation indicator for invalid queries', async () => {
    // Mock parseQuery to return invalid syntax
    vi.mocked(() =>
      import('~/composables/useAdvancedResourceSearch').then(
        mod => mod.useAdvancedResourceSearch
      )
    ).mockReturnValueOnce({
      getAdvancedSuggestions: vi.fn(() => []),
      addToSearchHistory: vi.fn(),
      searchHistory: { value: [] },
      parseQuery: vi.fn(() => ({ terms: [], operators: [], filters: {} })),
    })

    const wrapper = createWrapper()

    // Test with unbalanced quotes which should be invalid
    await wrapper.setProps({ modelValue: 'test "unbalanced' })

    // The input should have the invalid class
    const input = wrapper.find('#advanced-search-input')
    expect(input.classes()).toContain('border-red-500')
  })

  it('shows help tooltip when F1 is pressed', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')

    await input.trigger('keydown', { key: 'F1' })

    expect(wrapper.vm.showHelpTooltip).toBe(true)
  })

  it('shows help tooltip when Shift + ? is pressed', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')

    await input.trigger('keydown', { key: '?', shiftKey: true })

    expect(wrapper.vm.showHelpTooltip).toBe(true)
  })

  it('clears search when clear button is clicked', async () => {
    const wrapper = createWrapper({ modelValue: 'test query' })
    const clearButton = wrapper.find('button[aria-label="Clear search"]')

    await clearButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')![0]).toEqual([''])
    expect(wrapper.emitted('search')![0]).toEqual([''])
  })

  it('has proper accessibility attributes', () => {
    const wrapper = createWrapper()
    const input = wrapper.find('#advanced-search-input')

    expect(input.attributes('aria-label')).toBe('Advanced search resources')
    expect(input.attributes('aria-describedby')).toBe(
      'advanced-search-results-info'
    )
  })
})
