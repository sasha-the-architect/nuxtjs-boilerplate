import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BookmarkButton from '~/components/BookmarkButton.vue'
import { Resource } from '~/composables/useResources'

// Mock the useBookmarks composable
vi.mock('~/composables/useBookmarks', () => ({
  useBookmarks: () => ({
    isBookmarked: vi.fn().mockReturnValue(false),
    toggleBookmark: vi.fn(),
    addNoteToBookmark: vi.fn(),
    addTagsToBookmark: vi.fn(),
    removeBookmark: vi.fn(),
    getBookmarks: [],
    exportBookmarks: vi.fn(),
    importBookmarks: vi.fn(),
    clearBookmarks: vi.fn(),
    loading: false,
  }),
}))

describe('BookmarkButton', () => {
  const mockResource: Resource = {
    id: 'test-1',
    title: 'Test Resource',
    description: 'Test description',
    benefits: ['Benefit 1'],
    url: 'https://example.com',
    category: 'Test',
    pricingModel: 'Free',
    difficulty: 'Beginner',
    tags: ['test'],
    technology: ['Vue'],
    dateAdded: '2023-01-01',
    popularity: 5,
  }

  it('renders correctly', () => {
    const wrapper = mount(BookmarkButton, {
      props: {
        resource: mockResource,
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('shows empty bookmark icon when resource is not bookmarked', () => {
    const wrapper = mount(BookmarkButton, {
      props: {
        resource: mockResource,
      },
    })

    // The component should show an outline bookmark icon when not bookmarked
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('calls toggleBookmark when clicked', async () => {
    const { toggleBookmark } = await import('~/composables/useBookmarks')
    const wrapper = mount(BookmarkButton, {
      props: {
        resource: mockResource,
      },
    })

    await wrapper.find('button').trigger('click')
    expect(toggleBookmark).toHaveBeenCalledWith(mockResource)
  })
})
