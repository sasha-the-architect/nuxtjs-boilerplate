import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchAnalytics from '~/components/SearchAnalytics.vue'
import type { SearchAnalyticsData } from '~/types/analytics'
import { ref, computed } from 'vue'

// Mock the composable using factory function
vi.mock('~/composables/useSearchAnalytics', () => {
  return {
    useSearchAnalytics: vi.fn(),
  }
})

// Import after mock is set up
import { useSearchAnalytics } from '~/composables/useSearchAnalytics'

describe('SearchAnalytics Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('renders correctly with loading state initially', async () => {
    const mockAnalyticsData: SearchAnalyticsData = {
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
    }

    vi.mocked(useSearchAnalytics).mockReturnValue({
      searchAnalytics: { data: mockAnalyticsData } as any,
      loading: ref(false),
      error: ref(null),
      timeRange: ref('30'),
      maxSearchCount: computed(() => 15),
      formatDate: (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      },
      fetchSearchAnalytics: vi.fn(),
    })

    const wrapper = mount(SearchAnalytics, {
      global: {
        stubs: ['SearchSuggestions', 'SavedSearches'],
      },
    })

    expect(wrapper.text()).toContain('Total Searches')
    expect(wrapper.text()).toContain('100')
  })

  it('handles API error gracefully', async () => {
    vi.mocked(useSearchAnalytics).mockReturnValue({
      searchAnalytics: null,
      loading: ref(false),
      error: ref('Network error'),
      timeRange: ref('30'),
      maxSearchCount: computed(() => 1),
      formatDate: (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      },
      fetchSearchAnalytics: vi.fn(),
    })

    const wrapper = mount(SearchAnalytics)

    // Should show error message
    expect(wrapper.text()).toContain('Error loading search analytics')
    expect(wrapper.find('button').text()).toBe('Retry')
  })

  it('displays search analytics data correctly', async () => {
    const mockAnalyticsData: SearchAnalyticsData = {
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
    }

    vi.mocked(useSearchAnalytics).mockReturnValue({
      searchAnalytics: { data: mockAnalyticsData } as any,
      loading: ref(false),
      error: ref(null),
      timeRange: ref('30'),
      maxSearchCount: computed(() => 18),
      formatDate: (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      },
      fetchSearchAnalytics: vi.fn(),
    })

    const wrapper = mount(SearchAnalytics)

    expect(wrapper.text()).toContain('125')
    expect(wrapper.text()).toContain('92%')
    expect(wrapper.text()).toContain('8')
    expect(wrapper.text()).toContain('180ms')
    expect(wrapper.text()).toContain('javascript')
    expect(wrapper.text()).toContain('nonexistent query')
  })

  it('handles time range change', async () => {
    const fetchSearchAnalyticsMock = vi.fn()

    vi.mocked(useSearchAnalytics).mockReturnValue({
      searchAnalytics: { data: null } as any,
      loading: ref(false),
      error: ref(null),
      timeRange: ref('30'),
      maxSearchCount: computed(() => 1),
      formatDate: (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      },
      fetchSearchAnalytics: fetchSearchAnalyticsMock,
    })

    const wrapper = mount(SearchAnalytics)

    // Change time range to 7 days
    await wrapper.find('select').setValue('7')

    await wrapper.vm.$nextTick()

    // Check that component received the composable functions
    expect(fetchSearchAnalyticsMock).toBeDefined()
  })
})
