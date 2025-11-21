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
})
