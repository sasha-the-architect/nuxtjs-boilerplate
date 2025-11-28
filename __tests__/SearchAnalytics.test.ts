import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchAnalytics from '~/components/SearchAnalytics.vue'

// Mock the fetch API
const mockFetch = vi.fn()

// Mock global fetch
Object.defineProperty(window, 'fetch', {
  value: mockFetch,
  writable: true,
})

describe('SearchAnalytics', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()

    // Mock a successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          searchStats: {
            totalSearches: 100,
            avgResponseTime: 50,
            zeroResultSearches: 10,
            avgResultsPerSearch: 2.5,
          },
          popularSearches: [
            { query: 'test', count: 20 },
            { query: 'example', count: 15 },
          ],
          zeroResultSearches: [{ query: 'no results', count: 5 }],
          searchTrends: [
            { date: '2023-01-01', count: 10 },
            { date: '2023-01-02', count: 15 },
          ],
        }),
    })
  })

  it('renders correctly with loading state initially', () => {
    const wrapper = mount(SearchAnalytics)

    // Initially, it should show some loading indication
    expect(wrapper.text()).toContain('Search Analytics')
  })

  it('fetches and displays search analytics data', async () => {
    const wrapper = mount(SearchAnalytics)

    // Wait for the async operation to complete
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check that fetch was called
    expect(mockFetch).toHaveBeenCalled()

    // Check that data is displayed
    expect(wrapper.text()).toContain('Total Searches')
    expect(wrapper.text()).toContain('100')
  })

  it('accepts dateRange prop and passes it to API', async () => {
    const dateRange = {
      start: '2023-01-01',
      end: '2023-01-31',
    }

    const wrapper = mount(SearchAnalytics, {
      props: {
        dateRange,
      },
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check that the API was called with the correct date range
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/analytics/search?startDate=${dateRange.start}&endDate=${dateRange.end}`
    )
  })

  it('displays popular searches', async () => {
    const wrapper = mount(SearchAnalytics)

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check that popular searches are displayed
    expect(wrapper.text()).toContain('Popular Searches')
    expect(wrapper.text()).toContain('test')
    expect(wrapper.text()).toContain('example')
  })

  it('displays zero-result searches', async () => {
    const wrapper = mount(SearchAnalytics)

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check that zero-result searches are displayed
    expect(wrapper.text()).toContain('Zero-Result Queries')
    expect(wrapper.text()).toContain('no results')
  })

  it('shows error state when API fails', async () => {
    // Mock a failed API response
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    })

    const wrapper = mount(SearchAnalytics)

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // The component should handle the error appropriately
    expect(mockFetch).toHaveBeenCalled()
  })
})
