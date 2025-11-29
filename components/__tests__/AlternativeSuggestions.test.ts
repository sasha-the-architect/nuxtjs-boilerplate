import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AlternativeSuggestions from '../AlternativeSuggestions.vue'
import type { Resource } from '~/types/resource'

describe('AlternativeSuggestions', () => {
  const mockResource: Resource = {
    id: '1',
    title: 'Test Resource',
    description: 'A test resource',
    benefits: ['Benefit 1'],
    url: 'https://example.com',
    category: 'Testing',
    pricingModel: 'Free',
    difficulty: 'Beginner',
    tags: ['test'],
    technology: ['JavaScript'],
    dateAdded: '2023-01-01',
    popularity: 100,
  }

  const mockAlternatives: Resource[] = [
    {
      id: '2',
      title: 'Alternative Resource 1',
      description: 'An alternative resource',
      benefits: ['Alternative Benefit'],
      url: 'https://alternative1.com',
      category: 'Testing',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['alternative'],
      technology: ['JavaScript'],
      dateAdded: '2023-01-02',
      popularity: 90,
      similarityScore: 0.8,
    },
    {
      id: '3',
      title: 'Alternative Resource 2',
      description: 'Another alternative resource',
      benefits: ['Another Benefit'],
      url: 'https://alternative2.com',
      category: 'Testing',
      pricingModel: 'Paid',
      difficulty: 'Intermediate',
      tags: ['alternative', 'tool'],
      technology: ['TypeScript'],
      dateAdded: '2023-01-03',
      popularity: 80,
      similarityScore: 0.6,
    },
  ]

  it('renders correctly when alternatives are provided', () => {
    const wrapper = mount(AlternativeSuggestions, {
      props: {
        currentResourceId: '1',
        alternatives: mockAlternatives,
      },
    })

    expect(wrapper.find('h2').text()).toBe('Alternative Resources')
    expect(wrapper.findAll('.bg-white').length).toBe(2) // 2 alternative cards
  })

  it('does not render when no alternatives are provided', () => {
    const wrapper = mount(AlternativeSuggestions, {
      props: {
        currentResourceId: '1',
        alternatives: [],
      },
    })

    expect(wrapper.find('h2').exists()).toBe(false)
  })

  it('passes correct props to AlternativeCard components', () => {
    const wrapper = mount(AlternativeSuggestions, {
      props: {
        currentResourceId: '1',
        alternatives: mockAlternatives,
      },
    })

    const alternativeCards = wrapper.findAllComponents({
      name: 'AlternativeCard',
    })
    expect(alternativeCards).toHaveLength(2)

    // Check that the first alternative card receives correct props
    const firstCard = alternativeCards[0]
    expect(firstCard.props('resource')).toEqual(mockAlternatives[0])
    expect(firstCard.props('similarityScore')).toBe(0.8)
    expect(firstCard.props('currentResourceId')).toBe('1')
  })
})
