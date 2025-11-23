import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCardSkeleton from '@/components/ResourceCardSkeleton.vue'

describe('ResourceCardSkeleton', () => {
  it('renders the skeleton with correct structure', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Check main container
    const container = wrapper.find('.bg-white')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('p-6')
    expect(container.classes()).toContain('rounded-lg')
    expect(container.classes()).toContain('shadow')
    expect(container.classes()).toContain('animate-pulse')

    // Check icon placeholder
    const iconPlaceholder = wrapper.find('.flex-shrink-0 .bg-gray-200')
    expect(iconPlaceholder.exists()).toBe(true)
    expect(iconPlaceholder.classes()).toContain('w-12')
    expect(iconPlaceholder.classes()).toContain('h-12')
    expect(iconPlaceholder.classes()).toContain('rounded')

    // Check title placeholder
    const titlePlaceholder = wrapper.find('.h-5')
    expect(titlePlaceholder.exists()).toBe(true)
    expect(titlePlaceholder.classes()).toContain('bg-gray-200')
    expect(titlePlaceholder.classes()).toContain('rounded')
    expect(titlePlaceholder.classes()).toContain('w-3/4')
    expect(titlePlaceholder.classes()).toContain('mb-3')

    // Check description placeholders (there are 3 elements with h-4 bg-gray-200: 2 descriptions + 1 in benefits section)
    const descriptionPlaceholders = wrapper.findAll('.h-4.bg-gray-200')
    expect(descriptionPlaceholders).toHaveLength(3)

    // Check benefits section
    const benefitsSection = wrapper.find('.mt-3.bg-gray-50')
    expect(benefitsSection.exists()).toBe(true)
    expect(benefitsSection.classes()).toContain('p-3')
    expect(benefitsSection.classes()).toContain('rounded-md')

    // Check benefits list items
    const benefitItems = wrapper.findAll('.space-y-2 .h-3.bg-gray-200')
    expect(benefitItems).toHaveLength(3)

    // Check button placeholder
    const buttonPlaceholder = wrapper.find('.mt-3 .h-8')
    expect(buttonPlaceholder.exists()).toBe(true)
    expect(buttonPlaceholder.classes()).toContain('bg-gray-200')
    expect(buttonPlaceholder.classes()).toContain('rounded-md')
    expect(buttonPlaceholder.classes()).toContain('w-32')
  })

  it('has proper CSS classes for skeleton animation', () => {
    const wrapper = mount(ResourceCardSkeleton)

    const container = wrapper.find('.animate-pulse')
    expect(container.classes()).toContain('animate-pulse')
  })

  it('has the correct visual elements in the right structure', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Check that the flex structure exists
    const flexContainer = wrapper.find('.flex.items-start')
    expect(flexContainer.exists()).toBe(true)

    // Check that the icon is before the content
    const flexItems = flexContainer.findAll('.flex-shrink-0, .flex-1')
    expect(flexItems).toHaveLength(2)
    expect(flexItems[0].classes()).toContain('flex-shrink-0')
    expect(flexItems[1].classes()).toContain('flex-1')

    // Check that content section exists
    const contentSection = flexItems[1]
    // Find the title element using a more specific approach
    const titleElement = contentSection.find('.h-5')
    expect(titleElement.exists()).toBe(true)
    expect(titleElement.classes()).toContain('bg-gray-200')
    expect(titleElement.classes()).toContain('rounded')
    expect(titleElement.classes()).toContain('w-3/4')
    expect(titleElement.classes()).toContain('mb-3')

    // There are 3 .h-4.bg-gray-200 elements total: 2 descriptions + 1 in benefits section
    const h4Elements = contentSection.findAll('.h-4.bg-gray-200')
    expect(h4Elements).toHaveLength(3) // Total count

    // The first two are the descriptions and they have rounded class
    expect(h4Elements[0].classes()).toContain('rounded')
    expect(h4Elements[1].classes()).toContain('rounded')
    // The third one (in benefits section) also has rounded class

    expect(
      contentSection.find('.mt-3.bg-gray-50.p-3.rounded-md').exists()
    ).toBe(true) // Benefits
    expect(
      contentSection.find('.mt-3 .h-8.bg-gray-200.rounded-md.w-32').exists()
    ).toBe(true) // Button
  })

  it('uses appropriate gray colors for skeleton loading', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Find all skeleton elements
    const skeletonElements = wrapper.findAll('.bg-gray-200')
    expect(skeletonElements.length).toBeGreaterThan(0)

    // Check for background colors used in skeleton
    const skeletonWithBg200 = wrapper.findAll('.bg-gray-200')
    const skeletonWithBg50 = wrapper.findAll('.bg-gray-50')

    expect(skeletonWithBg200.length).toBeGreaterThan(0)
    expect(skeletonWithBg50.length).toBeGreaterThan(0)
  })

  it('has proper rounded styling', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Check various rounded elements
    expect(wrapper.find('.rounded-lg').exists()).toBe(true) // Main container
    expect(wrapper.find('.rounded').exists()).toBe(true) // Title
    expect(wrapper.find('.rounded-md').exists()).toBe(true) // Button
  })

  it('has proper spacing classes', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Check various spacing classes
    expect(wrapper.find('.p-6').exists()).toBe(true) // Padding
    expect(wrapper.find('.mr-4').exists()).toBe(true) // Right margin for icon
    expect(wrapper.find('.mb-3').exists()).toBe(true) // Bottom margin
    expect(wrapper.find('.mb-2').exists()).toBe(true) // Bottom margin
    expect(wrapper.find('.mb-4').exists()).toBe(true) // Bottom margin
    expect(wrapper.find('.mt-3').exists()).toBe(true) // Top margin
  })
})
