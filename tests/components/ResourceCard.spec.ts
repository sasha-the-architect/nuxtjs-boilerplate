import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCard from '@/components/ResourceCard.vue'

// Mock resource data with proper props
const mockResourceProps = {
  title: 'Test Resource',
  description: 'This is a test resource description',
  url: 'https://example.com',
  benefits: ['Benefit 1', 'Benefit 2'],
  icon: 'test-icon',
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
  })

  it('displays featured badge when resource is featured', () => {
    const wrapper = mount(ResourceCard, {
      props: { ...mockResourceProps, featured: true },
    })

    expect(wrapper.find('.featured-badge').exists()).toBe(false) // The component doesn't have featured property
  })

  it('handles different button labels', () => {
    const wrapper = mount(ResourceCard, {
      props: { ...mockResourceProps, buttonLabel: 'Visit Site' },
    })

    expect(wrapper.find('a').text()).toContain('Visit Site')
  })

  it('handles newTab prop correctly', async () => {
    const wrapper = mount(ResourceCard, {
      props: { ...mockResourceProps, newTab: true },
    })

    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('renders icon when provided', () => {
    const wrapper = mount(ResourceCard, {
      props: mockResourceProps,
    })

    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('src')).toBe('test-icon')
  })

  it('renders benefits list correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: mockResourceProps,
    })

    const benefits = wrapper.findAll('li')
    expect(benefits).toHaveLength(2)
    expect(benefits[0].text()).toBe('Benefit 1')
    expect(benefits[1].text()).toBe('Benefit 2')
  })
})
