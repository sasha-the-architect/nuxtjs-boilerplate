import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCard from '../components/ResourceCard.vue'
import { createTestResource } from '../tests/factories/resource'

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

describe('Integration Tests', () => {
  describe('ResourceCard Integration', () => {
    const testResource = createTestResource()

    beforeEach(() => {
      // Clean up any mocks before each test
      vi.clearAllMocks()
    })

    it('renders resource data correctly with proper structure', () => {
      const wrapper = mount(ResourceCard, {
        props: {
          title: testResource.title,
          description: testResource.description,
          benefits: testResource.benefits,
          url: testResource.url,
        },
        global: {
          components: {
            NuxtLink: mockNuxtLink,
            SocialShare: mockSocialShare,
          },
        },
      })

      // Check that the resource data is displayed correctly
      expect(wrapper.find('h3').text()).toContain(testResource.title)
      expect(wrapper.find('p').text()).toContain(testResource.description)
      testResource.benefits.forEach(benefit => {
        expect(wrapper.text()).toContain(benefit)
      })

      // Check that the link is properly rendered
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe(testResource.url)
      expect(link.attributes('target')).toBe('_blank')
    })

    it('handles different prop configurations', () => {
      const customResource = createTestResource({
        title: 'Custom Title',
        description: 'Custom Description',
        buttonLabel: 'Custom Button',
        newTab: false,
      })

      const wrapper = mount(ResourceCard, {
        props: {
          title: customResource.title,
          description: customResource.description,
          benefits: customResource.benefits,
          url: customResource.url,
          buttonLabel: customResource.buttonLabel,
          newTab: customResource.newTab,
        },
        global: {
          components: {
            NuxtLink: mockNuxtLink,
            SocialShare: mockSocialShare,
          },
        },
      })

      // Check that custom props are used
      expect(wrapper.text()).toContain(
        customResource.buttonLabel || 'Visit Resource'
      )
      const link = wrapper.find('a')
      expect(link.attributes('target')).toBe('_self') // Should be _self when newTab is false
    })

    it('handles missing optional props gracefully', () => {
      const wrapper = mount(ResourceCard, {
        props: {
          title: testResource.title,
          description: testResource.description,
          benefits: testResource.benefits,
          url: testResource.url,
          // Intentionally omitting optional props
        },
        global: {
          components: {
            NuxtLink: mockNuxtLink,
            SocialShare: mockSocialShare,
          },
        },
      })

      // Should still render correctly with defaults
      expect(wrapper.find('h3').text()).toContain(testResource.title)
      expect(wrapper.find('p').text()).toContain(testResource.description)
    })
  })

  describe('Error Handling', () => {
    it('handles invalid props gracefully', () => {
      // Test with null/undefined values
      const wrapper = mount(ResourceCard, {
        props: {
          title: null as any,
          description: null as any,
          benefits: null as any,
          url: null as any,
        },
        global: {
          components: {
            NuxtLink: mockNuxtLink,
            SocialShare: mockSocialShare,
          },
        },
      })

      // Should handle null values gracefully without crashing
      expect(wrapper.exists()).toBe(true)
    })
  })
})
