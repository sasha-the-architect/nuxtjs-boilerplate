import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCard from '@/components/ResourceCard.vue'

// Mock resource data matching component props interface
const mockResourceProps = {
  title: 'Test Resource',
  description: 'This is a test resource description',
  benefits: [
    'Free tier available',
    'No credit card required',
    'Unlimited projects',
  ],
  url: 'https://example.com',
  icon: 'https://example.com/icon.png',
  newTab: true,
  buttonLabel: 'Get Free Access',
}

describe('ResourceCard', () => {
  it('renders resource information correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: mockResourceProps,
    })

    expect(wrapper.find('h3').text()).toBe('Test Resource')
    expect(wrapper.find('p').text()).toBe('This is a test resource description')
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    expect(wrapper.find('a').text()).toContain('Get Free Access')
  })

  it('renders benefits correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: mockResourceProps,
    })

    const benefits = wrapper.findAll('li')
    expect(benefits).toHaveLength(3)
    expect(benefits[0].text()).toBe('Free tier available')
    expect(benefits[1].text()).toBe('No credit card required')
    expect(benefits[2].text()).toBe('Unlimited projects')
  })

  it('displays icon when provided', () => {
    const wrapper = mount(ResourceCard, {
      props: mockResourceProps,
    })

    const icon = wrapper.find('img')
    expect(icon.exists()).toBe(true)
    expect(icon.attributes('src')).toBe('https://example.com/icon.png')
    expect(icon.attributes('alt')).toBe('Test Resource')
  })

  it('opens link in new tab when newTab is true', () => {
    const wrapper = mount(ResourceCard, {
      props: mockResourceProps,
    })

    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.text()).toContain('(new tab)')
  })

  it('opens link in same tab when newTab is false', () => {
    const props = { ...mockResourceProps, newTab: false }
    const wrapper = mount(ResourceCard, {
      props: props,
    })

    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_self')
    expect(link.text()).not.toContain('(new tab)')
  })

  it('uses custom button label when provided', () => {
    const props = { ...mockResourceProps, buttonLabel: 'Custom Button' }
    const wrapper = mount(ResourceCard, {
      props: props,
    })

    expect(wrapper.find('a').text()).toContain('Custom Button')
  })

  it('sanitizes highlighted title to prevent XSS', () => {
    const props = {
      ...mockResourceProps,
      highlightedTitle:
        '<script>alert("xss")</script><mark class="bg-yellow-200">safe text</mark>',
    }
    const wrapper = mount(ResourceCard, {
      props: props,
    })

    const titleElement = wrapper.find('h3 span')
    // The script tag should be removed but the mark tag should remain
    expect(titleElement.html()).toContain('safe text')
    expect(titleElement.html()).not.toContain('alert')
    expect(titleElement.html()).not.toContain('script')
  })

  it('sanitizes highlighted description to prevent XSS', () => {
    const props = {
      ...mockResourceProps,
      highlightedDescription:
        '<script>alert("xss")</script><mark class="bg-yellow-200">safe description</mark>',
    }
    const wrapper = mount(ResourceCard, {
      props: props,
    })

    const descriptionElement = wrapper.find('p span')
    // The script tag should be removed but the mark tag should remain
    expect(descriptionElement.html()).toContain('safe description')
    expect(descriptionElement.html()).not.toContain('alert')
    expect(descriptionElement.html()).not.toContain('script')
  })

  it('allows safe mark tags with proper classes for highlighting', () => {
    const props = {
      ...mockResourceProps,
      highlightedTitle:
        '<mark class="bg-yellow-200 text-gray-900">highlighted text</mark>',
    }
    const wrapper = mount(ResourceCard, {
      props: props,
    })

    const titleElement = wrapper.find('h3 span')
    expect(titleElement.html()).toContain('highlighted text')
    expect(titleElement.html()).toContain('bg-yellow-200')
    expect(titleElement.html()).toContain('text-gray-900')
  })
})
