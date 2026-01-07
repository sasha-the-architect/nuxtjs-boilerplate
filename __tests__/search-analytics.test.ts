import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchAnalytics from '~/components/SearchAnalytics.vue'

// Mock the fetch API
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('SearchAnalytics Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('renders correctly with loading state initially', async () => {
    // Mock a delayed response to allow loading state to show
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          totalSearches: 100,
          successRate: 95,
          zeroResultCount: 5,
          avgResponseTime: 150,
          searchTrends: [
            { date: '2023-01-01', count: 10 },
            { date: '2023-01-02', count: 15 },
          ],
          popularSearches: [
            { query: 'test', count: 5 },
            { query: 'vue', count: 3 },
          ],
          zeroResultQueries: [{ query: 'nonexistent', count: 2 }],
          performanceMetrics: {
            fastSearches: 70,
            mediumSearches: 20,
            slowSearches: 10,
          },
        },
        dateRange: {
          start: '2023-01-01',
          end: '2023-01-30',
        },
      }),
      ok: true,
    })

    const wrapper = mount(SearchAnalytics, {
      global: {
        stubs: ['SearchSuggestions', 'SavedSearches'], // Stub any child components if needed
      },
    })

    // Initially should show loading state
    expect(wrapper.find('.animate-spin').exists()).toBe(true)

    // Wait for the data to load
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // After loading, should show the analytics data
    expect(wrapper.find('.animate-spin').exists()).toBe(false)
    expect(wrapper.text()).toContain('Total Searches')
    expect(wrapper.text()).toContain('100')
  })

  it('handles API error gracefully', async () => {
    // Mock an API error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = mount(SearchAnalytics)

    // Wait for error handling
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Should show error message
    expect(wrapper.text()).toContain('Error loading search analytics')
    expect(wrapper.find('button').text()).toBe('Retry')
  })

  it('displays search analytics data correctly', async () => {
    const mockData = {
      success: true,
      data: {
        totalSearches: 125,
        successRate: 92,
        zeroResultCount: 8,
        avgResponseTime: 180,
        searchTrends: [
          { date: '2023-01-01', count: 12 },
          { date: '2023-01-02', count: 18 },
          { date: '2023-01-03', count: 15 },
        ],
        popularSearches: [
          { query: 'javascript', count: 12 },
          { query: 'vuejs', count: 8 },
          { query: 'nuxt', count: 5 },
        ],
        zeroResultQueries: [
          { query: 'nonexistent query', count: 3 },
          { query: 'unknown term', count: 1 },
        ],
        performanceMetrics: {
          fastSearches: 80,
          mediumSearches: 15,
          slowSearches: 5,
        },
      },
      dateRange: {
        start: '2023-01-01',
        end: '2023-01-30',
      },
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
    })

    const wrapper = mount(SearchAnalytics)

    // Wait for data to load
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Check that data is displayed
    expect(wrapper.text()).toContain('125')
    expect(wrapper.text()).toContain('92%')
    expect(wrapper.text()).toContain('8')
    expect(wrapper.text()).toContain('180ms')
    expect(wrapper.text()).toContain('javascript')
    expect(wrapper.text()).toContain('nonexistent query')
  })

  it('fetches data with correct time range', async () => {
    const mockData = {
      success: true,
      data: {
        totalSearches: 50,
        successRate: 100,
        zeroResultCount: 0,
        avgResponseTime: 120,
        searchTrends: [],
        popularSearches: [],
        zeroResultQueries: [],
        performanceMetrics: {
          fastSearches: 50,
          mediumSearches: 0,
          slowSearches: 0,
        },
      },
      dateRange: {
        start: '2023-01-01',
        end: '2023-01-07',
      },
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
    })

    const wrapper = mount(SearchAnalytics)

    // Check that fetch was called with default 30 days
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/search?days=30')

    // Change time range to 7 days
    await wrapper.find('select').setValue('7')

    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/search?days=7')
  })
})
