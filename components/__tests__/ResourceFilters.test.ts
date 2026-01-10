import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceFilters from '../ResourceFilters.vue'

describe('ResourceFilters', () => {
  const defaultProps = {
    categories: ['Testing', 'Development', 'Design'],
    pricingModels: ['Free', 'Paid', 'Freemium'],
    difficultyLevels: ['Beginner', 'Intermediate', 'Advanced'],
    technologies: ['Vue', 'React', 'Angular'],
    tags: ['tag1', 'tag2', 'tag3'],
    benefits: ['benefit1', 'benefit2', 'benefit3'],
    selectedCategories: [],
    selectedPricingModels: [],
    selectedDifficultyLevels: [],
    selectedTechnologies: [],
    selectedTags: [],
    selectedBenefits: [],
  }

  it('renders all filter sections correctly', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    expect(wrapper.find('h3').text()).toBe('Filters')
    expect(wrapper.text()).toContain('Category')
    expect(wrapper.text()).toContain('Pricing Model')
    expect(wrapper.text()).toContain('Difficulty')
    expect(wrapper.text()).toContain('Technology')
  })

  it('renders all category options', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    defaultProps.categories.forEach(category => {
      expect(wrapper.text()).toContain(category)
    })
  })

  it('renders all pricing model options', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    defaultProps.pricingModels.forEach(pricingModel => {
      expect(wrapper.text()).toContain(pricingModel)
    })
  })

  it('renders all difficulty level options', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    defaultProps.difficultyLevels.forEach(difficulty => {
      expect(wrapper.text()).toContain(difficulty)
    })
  })

  it('renders all technology options', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    defaultProps.technologies.forEach(technology => {
      expect(wrapper.text()).toContain(technology)
    })
  })

  it('shows reset button', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const resetButton = wrapper.find('button')
    expect(resetButton.exists()).toBe(true)
    expect(resetButton.text()).toBe('Reset all')
  })

  it('emits reset-filters event when reset button is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const resetButton = wrapper.find('button')
    await resetButton.trigger('click')

    expect(wrapper.emitted('reset-filters')).toBeTruthy()
  })

  it('emits toggle-category event when a category checkbox is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const categoryCheckbox = wrapper.findAll('input[type="checkbox"]')[0] // First category
    await categoryCheckbox.trigger('change')

    expect(wrapper.emitted('toggle-category')).toBeTruthy()
    expect(wrapper.emitted('toggle-category')![0]).toEqual(['Testing'])
  })

  it('emits toggle-pricing-model event when a pricing model checkbox is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const pricingCheckbox = wrapper.findAll('input[type="checkbox"]')[3] // First pricing model
    await pricingCheckbox.trigger('change')

    expect(wrapper.emitted('toggle-pricing-model')).toBeTruthy()
    expect(wrapper.emitted('toggle-pricing-model')![0]).toEqual(['Free'])
  })

  it('emits toggle-difficulty-level event when a difficulty checkbox is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const difficultyCheckbox = wrapper.findAll('input[type="checkbox"]')[6] // First difficulty level
    await difficultyCheckbox.trigger('change')

    expect(wrapper.emitted('toggle-difficulty-level')).toBeTruthy()
    expect(wrapper.emitted('toggle-difficulty-level')![0]).toEqual(['Beginner'])
  })

  it('emits toggle-technology event when a technology checkbox is clicked', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const technologyCheckbox = wrapper.findAll('input[type="checkbox"]')[9] // First technology
    await technologyCheckbox.trigger('change')

    expect(wrapper.emitted('toggle-technology')).toBeTruthy()
    expect(wrapper.emitted('toggle-technology')![0]).toEqual(['Vue'])
  })

  it('shows checkboxes as unchecked by default', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    checkboxes.forEach(checkbox => {
      expect(checkbox.element.checked).toBe(false)
    })
  })

  it('shows checkboxes as checked when selected in props', () => {
    const propsWithSelections = {
      ...defaultProps,
      selectedCategories: ['Testing'],
      selectedPricingModels: ['Free'],
      selectedDifficultyLevels: ['Beginner'],
      selectedTechnologies: ['Vue'],
    }

    const wrapper = mount(ResourceFilters, {
      props: propsWithSelections,
    })

    // First category checkbox should be checked
    expect(wrapper.findAll('input[type="checkbox"]')[0].element.checked).toBe(
      true
    )
    // First pricing checkbox should be checked
    expect(wrapper.findAll('input[type="checkbox"]')[3].element.checked).toBe(
      true
    )
    // First difficulty checkbox should be checked
    expect(wrapper.findAll('input[type="checkbox"]')[6].element.checked).toBe(
      true
    )
    // First technology checkbox should be checked
    expect(wrapper.findAll('input[type="checkbox"]')[9].element.checked).toBe(
      true
    )
  })

  it('displays result counts when facetCounts are provided', () => {
    const propsWithCounts = {
      ...defaultProps,
      facetCounts: {
        category_Testing: 5,
        pricing_Free: 10,
        difficulty_Beginner: 8,
        technology_Vue: 3,
      },
    }

    const wrapper = mount(ResourceFilters, {
      props: propsWithCounts,
    })

    // Check that counts are displayed for the first options in each category
    expect(wrapper.html()).toContain('5') // Testing category count
    expect(wrapper.html()).toContain('10') // Free pricing count
    expect(wrapper.html()).toContain('8') // Beginner difficulty count
    expect(wrapper.html()).toContain('3') // Vue technology count
  })

  it('shows 0 as count when facetCounts are provided but specific option is not in counts', () => {
    const propsWithPartialCounts = {
      ...defaultProps,
      facetCounts: {
        category_Testing: 5,
        // Missing 'Development' and 'Design' counts
      },
    }

    const wrapper = mount(ResourceFilters, {
      props: propsWithPartialCounts,
    })

    // Testing category should show 5, others should show 0
    const countElements = wrapper.findAll('span.ml-2.text-xs')
    expect(countElements[0].text()).toBe('5') // Testing
    expect(countElements[1].text()).toBe('0') // Development (not in counts)
    expect(countElements[2].text()).toBe('0') // Design (not in counts)
  })

  it('shows 0 as count when no facetCounts are provided', () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    // All counts should be 0 when no facetCounts are provided
    const countElements = wrapper.findAll('span.ml-2.text-xs')
    countElements.forEach(countElement => {
      expect(countElement.text()).toBe('0')
    })
  })

  it('handles keyboard events for accessibility', async () => {
    const wrapper = mount(ResourceFilters, {
      props: defaultProps,
    })

    // Test Enter key on first category label
    const firstLabel = wrapper.findAll('label')[0]
    await firstLabel.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('toggle-category')).toBeTruthy()
    expect(wrapper.emitted('toggle-category')![0]).toEqual(['Testing'])

    // Test Space key on first pricing model label
    const secondLabel = wrapper.findAll('label')[3] // First pricing model
    await secondLabel.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('toggle-pricing-model')).toBeTruthy()
    expect(wrapper.emitted('toggle-pricing-model')![0]).toEqual(['Free'])
  })

  it('has proper ARIA labels for accessibility', () => {
    const propsWithCounts = {
      ...defaultProps,
      facetCounts: {
        category_Testing: 5,
      },
    }

    const wrapper = mount(ResourceFilters, {
      props: propsWithCounts,
    })

    // Check that the first checkbox has the proper ARIA label
    const firstCheckbox = wrapper.findAll('input[type="checkbox"]')[0]
    expect(firstCheckbox.attributes('aria-label')).toBe(
      'Filter by Testing (5 results)'
    )
  })
})
