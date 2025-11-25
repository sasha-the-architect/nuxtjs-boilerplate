import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ShareButton from '../ShareButton.vue'

// Mock the runtime config
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRuntimeConfig: () => ({
      public: {
        canonicalUrl: 'https://example.com',
      },
    }),
  }
})

// Mock the shareUtils
vi.mock('~/utils/shareUtils', () => ({
  generateResourceShareUrls: vi.fn((url, title, description) => ({
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&hashtags=FreeResources,WebDevelopment`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`Check out ${title} - ${description || ''}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=Check out this resource: ${url}%0D%0A%0D%0A${encodeURIComponent(description || '')}`,
  })),
}))

describe('ShareButton', () => {
  const defaultProps = {
    title: 'Test Resource',
    description: 'Test description',
    url: 'https://example.com/resource',
  }

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('renders correctly with props', () => {
    const wrapper = mount(ShareButton, {
      props: defaultProps,
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('button').attributes('aria-label')).toBe(
      'Share Test Resource'
    )
  })

  it('toggles share menu when clicked', async () => {
    const wrapper = mount(ShareButton, {
      props: defaultProps,
    })

    // Initially, the share menu should not be visible
    expect(wrapper.find('.absolute').exists()).toBe(false)

    // Click the share button
    await wrapper.find('button').trigger('click')

    // The share menu should now be visible
    expect(wrapper.find('.absolute').exists()).toBe(true)

    // Click the share button again
    await wrapper.find('button').trigger('click')

    // The share menu should now be hidden
    expect(wrapper.find('.absolute').exists()).toBe(false)
  })

  it('contains all social media links', async () => {
    const wrapper = mount(ShareButton, {
      props: defaultProps,
    })

    // Open the share menu
    await wrapper.find('button').trigger('click')

    // Check that all social media links are present
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(4) // Twitter, LinkedIn, Facebook, Reddit
    expect(links[0].attributes('href')).toContain('twitter.com')
    expect(links[1].attributes('href')).toContain('linkedin.com')
    expect(links[2].attributes('href')).toContain('facebook.com')
    expect(links[3].attributes('href')).toContain('reddit.com')
  })

  it('has copy link button', async () => {
    const wrapper = mount(ShareButton, {
      props: defaultProps,
    })

    // Open the share menu
    await wrapper.find('button').trigger('click')

    // Check for the copy link button
    const copyButton = wrapper.find('button[role="menuitem"]')
    expect(copyButton.exists()).toBe(true)
    expect(copyButton.text()).toContain('Copy link')
  })

  it('copies URL to clipboard when copy button is clicked', async () => {
    // Mock the clipboard API
    const writeTextMock = vi.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const wrapper = mount(ShareButton, {
      props: defaultProps,
    })

    // Open the share menu
    await wrapper.find('button').trigger('click')

    // Click the copy link button
    const copyButton = wrapper.find('button[role="menuitem"]')
    await copyButton.trigger('click')

    // Verify that navigator.clipboard.writeText was called with the URL
    expect(writeTextMock).toHaveBeenCalledWith(defaultProps.url)
  })
})
