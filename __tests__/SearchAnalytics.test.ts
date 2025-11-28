import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchAnalytics from '~/components/SearchAnalytics.vue'

// Mock the fetch API
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('SearchAnalytics', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Mock a successful API response
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            totalSearches: 100,
            successRate: 0.85,
            zeroResultCount: 15,
            avgResponseTime: 120.5,
            dailySearches: [
              { date: '2023-01-01', count: 10 },
              { date: '2023-01-02', count: 15 },
            ],
            popularSearches: [{ query: 'test query', count: 5 }],
            zeroResultQueries: [{ query: 'no results', count: 3 }],
            searchPerformance: {
              fastQueries: 70,
              mediumQueries: 20,
              slowQueries: 10,
              fastQueryPercentage: 0.7,
              mediumQueryPercentage: 0.2,
              slowQueryPercentage: 0.1,
            },
          },
          dateRange: {
            start: '2023-01-01',
            end: '2023-01-07',
          },
        }),
    })
  })

  it('renders correctly', async () => {
    const wrapper = await mount(SearchAnalytics)

    // Wait for async operations to complete
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.search-analytics').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Search Analytics')
  })

  it('displays search overview cards', async () => {
    const wrapper = await mount(SearchAnalytics)

    // Wait for async operations to complete
    await wrapper.vm.$nextTick()

    // Check that the cards are rendered with data
    const cards = wrapper.findAll('.bg-gray-50.p-4.rounded-lg')
    expect(cards).toHaveLength(4)

    // Check that total searches is displayed
    expect(wrapper.text()).toContain('100')
  })

  it('handles API error gracefully', async () => {
    // Mock an API error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = await mount(SearchAnalytics)

    // Wait for async operations to complete
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick() // Additional tick for error handling

    // Check that error state is displayed
    expect(wrapper.text()).toContain('Error loading search analytics')
  })

  it('handles API response with error data', async () => {
    // Mock an API response with error data
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: false,
          message: 'Invalid data',
        }),
    })

    const wrapper = await mount(SearchAnalytics)

    // Wait for async operations to complete
    await wrapper.vm.$nextTick()

    // Check that error state is displayed
    expect(wrapper.text()).toContain('Error loading search analytics')
  })

  it('loads data with default time range', async () => {
    const wrapper = await mount(SearchAnalytics)

    // Wait for async operations to complete
    await wrapper.vm.$nextTick()

    // Check that fetch was called with the default time range
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/search?days=7')
  })

  it('updates data when time range is changed', async () => {
    const wrapper = await mount(SearchAnalytics)

    // Wait for initial load
    await wrapper.vm.$nextTick()

    // Change the time range
    const select = wrapper.find('select')
    await select.setValue('30')

    // Check that fetch was called again with new time range
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/search?days=30')
  })
})
