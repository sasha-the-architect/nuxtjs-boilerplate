import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceFilters from '@/components/ResourceFilters.vue'

describe('ResourceFilters', () => {
  const defaultProps = {
    categories: ['AI Tools', 'Development', 'Design'],
    pricingModels: ['Free', 'Freemium', 'Paid'],
    difficultyLevels: ['Beginner', 'Intermediate', 'Advanced'],
    technologies: ['React', 'Vue', 'Node.js'],
    selectedCategories: [],
    selectedPricingModels: [],
    selectedDifficultyLevels: [],
    selectedTechnologies: [],
  }

  it('renders all filter sections', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    expect(wrapper.find('h3').text()).toBe('Filters')
    expect(wrapper.find('h4').text()).toBe('Category')
    expect(wrapper.findAll('h4')).toHaveLength(4) // Category, Pricing Model, Difficulty, Technology
  })

  it('renders category checkboxes', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    // Find only the labels within the category section
    const categorySection = wrapper.findAll('div.mb-6')[0] // First div.mb-6 is the category section
    const categoryLabels = categorySection.findAll('label')
    expect(categoryLabels).toHaveLength(3) // AI Tools, Development, Design
    expect(categoryLabels[0].text()).toContain('AI Tools')
    expect(categoryLabels[1].text()).toContain('Development')
    expect(categoryLabels[2].text()).toContain('Design')
  })

  it('renders all filter types', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    // Check that all filter types are present
    expect(wrapper.text()).toContain('Pricing Model')
    expect(wrapper.text()).toContain('Difficulty')
    expect(wrapper.text()).toContain('Technology')

    // Check that all filter options are rendered
    expect(wrapper.text()).toContain('Free')
    expect(wrapper.text()).toContain('Freemium')
    expect(wrapper.text()).toContain('Paid')
    expect(wrapper.text()).toContain('Beginner')
    expect(wrapper.text()).toContain('Intermediate')
    expect(wrapper.text()).toContain('Advanced')
    expect(wrapper.text()).toContain('React')
    expect(wrapper.text()).toContain('Vue')
    expect(wrapper.text()).toContain('Node.js')
  })

  it('emits toggle-category event when category checkbox is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    const firstCategoryCheckbox = checkboxes[0] // First category checkbox

    await firstCategoryCheckbox.trigger('change')

    expect(wrapper.emitted('toggle-category')).toBeTruthy()
    expect(wrapper.emitted('toggle-category')![0]).toEqual(['AI Tools'])
  })

  it('emits toggle-pricing-model event when pricing model checkbox is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    const firstPricingCheckbox = checkboxes[3] // First pricing model checkbox

    await firstPricingCheckbox.trigger('change')

    expect(wrapper.emitted('toggle-pricing-model')).toBeTruthy()
    expect(wrapper.emitted('toggle-pricing-model')![0]).toEqual(['Free'])
  })

  it('emits toggle-difficulty-level event when difficulty checkbox is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    const firstDifficultyCheckbox = checkboxes[6] // First difficulty level checkbox

    await firstDifficultyCheckbox.trigger('change')

    expect(wrapper.emitted('toggle-difficulty-level')).toBeTruthy()
    expect(wrapper.emitted('toggle-difficulty-level')![0]).toEqual(['Beginner'])
  })

  it('emits toggle-technology event when technology checkbox is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    const firstTechnologyCheckbox = checkboxes[9] // First technology checkbox

    await firstTechnologyCheckbox.trigger('change')

    expect(wrapper.emitted('toggle-technology')).toBeTruthy()
    expect(wrapper.emitted('toggle-technology')![0]).toEqual(['React'])
  })

  it('emits reset-filters event when reset button is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const resetButton = wrapper.find('button')
    await resetButton.trigger('click')

    expect(wrapper.emitted('reset-filters')).toBeTruthy()
    expect(wrapper.emitted('reset-filters')![0]).toEqual([])
  })

  it('displays correct initial state for selected categories', async () => {
    const propsWithSelections = {
      ...defaultProps,
      selectedCategories: ['AI Tools'],
      selectedPricingModels: ['Free'],
      selectedDifficultyLevels: ['Beginner'],
      selectedTechnologies: ['React'],
    }

    const wrapper = mount(ResourceFilters, {
      props: propsWithSelections,
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')

    // Check that the first category checkbox is checked
    expect(checkboxes[0].element.checked).toBe(true)

    // Check that the first pricing model checkbox is checked
    expect(checkboxes[3].element.checked).toBe(true)

    // Check that the first difficulty level checkbox is checked
    expect(checkboxes[6].element.checked).toBe(true)

    // Check that the first technology checkbox is checked
    expect(checkboxes[9].element.checked).toBe(true)
  })

  it('handles keyboard events for accessibility', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const categoryLabels = wrapper.findAll('label')
    const firstCategoryLabel = categoryLabels[0]

    // Simulate pressing Enter key on a category label
    await firstCategoryLabel.trigger('keydown.enter')

    expect(wrapper.emitted('toggle-category')).toBeTruthy()
    expect(wrapper.emitted('toggle-category')![0]).toEqual(['AI Tools'])

    // Simulate pressing Space key on a category label
    await firstCategoryLabel.trigger('keydown.space')

    // Should have emitted the event again
    expect(wrapper.emitted('toggle-category')).toHaveLength(2)
    expect(wrapper.emitted('toggle-category')![1]).toEqual(['AI Tools'])
  })
})
