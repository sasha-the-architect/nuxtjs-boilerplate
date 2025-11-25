import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCard from '../ResourceCard.vue'

// Mock NuxtLink globally to avoid issues with Nuxt app instance
const mockNuxtLink = {
  name: 'NuxtLink',
  template: '<a :href="to"><slot /></a>',
  props: ['to'],
}

// Mock SocialShare component
const mockSocialShare = {
  name: 'SocialShare',
  template: '<div class="social-share">Social Share</div>',
  props: ['title', 'description', 'url', 'resourceType'],
}

describe('ResourceCard', () => {
  const defaultProps = {
    title: 'Test Resource',
    description: 'Test description',
    benefits: ['Benefit 1', 'Benefit 2'],
    url: 'https://example.com',
  }

  it('renders correctly with required props', () => {
    const wrapper = mount(ResourceCard, {
      props: defaultProps,
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    expect(wrapper.find('h3').text()).toContain('Test Resource')
    expect(wrapper.find('p').text()).toContain('Test description')
    expect(wrapper.text()).toContain('Benefit 1')
    expect(wrapper.text()).toContain('Benefit 2')
  })

  it('renders button with correct label', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        buttonLabel: 'Custom Button',
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    expect(wrapper.text()).toContain('Custom Button')
  })

  it('opens link in new tab by default', () => {
    const wrapper = mount(ResourceCard, {
      props: defaultProps,
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_blank')
  })

  it('opens link in same tab when newTab is false', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        newTab: false,
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_self')
  })
})
