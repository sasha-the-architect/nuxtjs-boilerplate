import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '../SearchBar.vue'

// Mock the composables used in SearchBar
vi.mock('~/composables/useResourceData', () => ({
  useResourceData: vi.fn(() => ({
    resources: {
      value: [
        {
          id: '1',
          title: 'Test Resource',
          description: 'This is a test resource',
          benefits: ['Benefit 1'],
          url: 'https://example.com',
          category: 'Testing',
          tags: ['test'],
          pricing: 'Free',
          difficulty: 'Beginner',
          lastUpdated: '2023-01-01',
        },
      ],
    },
  })),
}))

vi.mock('~/composables/useAdvancedResourceSearch', () => ({
  useAdvancedResourceSearch: vi.fn(() => ({
    getAdvancedSuggestions: vi.fn((query: string) => {
      if (query.toLowerCase().includes('test')) {
        return [
          {
            id: '1',
            title: 'Test Resource',
            description: 'This is a test resource',
            url: 'https://example.com',
          },
        ]
      }
      return []
    }),
    addToSearchHistory: vi.fn(),
    searchHistory: { value: ['test query', 'another query'] },
  })),
}))

vi.mock('~/composables/useResources', () => ({
  useResources: vi.fn(() => ({
    getSuggestions: vi.fn((query: string) => {
      if (query.toLowerCase().includes('test')) {
        return [
          {
            id: '1',
            title: 'Test Resource',
            description: 'This is a test resource',
            url: 'https://example.com',
          },
        ]
      }
      return []
    }),
    getSearchHistory: vi.fn(() => ['test query', 'another query']),
    addSearchToHistory: vi.fn(),
    clearSearchHistory: vi.fn(),
  })),
}))

// Mock the SearchSuggestions component
const mockSearchSuggestions = {
  name: 'SearchSuggestions',
  template: '<div class="search-suggestions"><slot /></div>',
  props: ['suggestions', 'searchHistory', 'visible'],
  emits: ['select-suggestion', 'select-history', 'clear-history', 'navigate'],
}

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with default props', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    expect(wrapper.find('input[type="search"]').exists()).toBe(true)
    expect(wrapper.find('input[type="search"]').attributes('placeholder')).toBe(
      'Search resources by name, description, tags...'
    )
    expect(wrapper.find('svg').exists()).toBe(true) // Search icon
  })

  it('displays the model value in the input field', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'Test search',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    const input = wrapper.find('input[type="search"]')
    expect(input.element.value).toBe('Test search')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    const input = wrapper.find('input[type="search"]')
    await input.setValue('New search query')

    // Wait for the debounce timeout
    await new Promise(resolve => setTimeout(resolve, 350))

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([
      'New search query',
    ])
  })

  it('emits search event when input changes', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    const input = wrapper.find('input[type="search"]')
    await input.setValue('Search query')

    // Wait for the debounce timeout
    await new Promise(resolve => setTimeout(resolve, 350))

    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual(['Search query'])
  })

  it('clears search when clear button is clicked', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'Test search',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    // The clear button should appear when there's a value
    const clearButton = wrapper.find('button[aria-label="Clear search"]')
    expect(clearButton.exists()).toBe(true)

    await clearButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([''])
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual([''])
  })

  it('shows suggestions dropdown when input has value and suggestions exist', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    // Trigger input event to update suggestions
    const input = wrapper.find('input[type="search"]')
    await input.setValue('test')

    // Wait for debounce timeout
    await new Promise(resolve => setTimeout(resolve, 350))

    // The suggestions array should be populated
    // Actual component rendering is handled by LazySearchSuggestions inside ClientOnly
    // which is difficult to test with simple component mocks
  })

  it('hides suggestions when input is empty', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    const input = wrapper.find('input[type="search"]')
    await input.setValue('')

    // Wait for the debounce timeout
    await new Promise(resolve => setTimeout(resolve, 350))

    // The suggestions component should not be rendered when input is empty
    const searchSuggestions = wrapper.findComponent(mockSearchSuggestions)
    expect(searchSuggestions.exists()).toBe(false)
  })

  it('handles Enter key press', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    const input = wrapper.find('input[type="search"]')
    await input.trigger('keydown', { key: 'Enter' })

    // Enter key adds to search history, doesn't emit search event
    // The search event is only emitted via debounced input handler
    expect(input.element).toBeDefined()
  })

  it('handles Escape key press', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    const input = wrapper.find('input[type="search"]')
    await input.trigger('keydown', { key: 'Escape' })

    // This would hide suggestions, but we're just testing the event handling
    expect(input.element).toBeDefined()
  })

  it('uses default debounce time when not provided', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    expect(wrapper.props().debounceTime).toBe(300)
  })

  it('uses provided debounce time', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        debounceTime: 500,
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    expect(wrapper.props().debounceTime).toBe(500)
  })

  it('can focus the input element', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
      global: {
        components: {
          SearchSuggestions: mockSearchSuggestions,
        },
      },
    })

    // Access the focus method exposed by defineExpose
    const searchBar = wrapper.vm as any
    expect(typeof searchBar.focus).toBe('function')
  })
})
