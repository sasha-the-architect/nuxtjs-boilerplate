import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

describe('Page Integration Tests', () => {
  it('renders the home page correctly', async () => {
    // This test ensures the main page loads and basic components render
    const component = await mountSuspended(() => import('~/app.vue'))
    expect(component.html()).toContain('Free Resources')
  })

  it('renders resources page with expected structure', async () => {
    // Test that the resources page renders with expected structure
    const component = await mountSuspended(() => import('~/pages/index.vue'))

    // Check for basic structure elements
    expect(component.element).toBeTruthy()
    expect(component.html()).toContain('Free Resources')
  })

  it('renders search page with search functionality', async () => {
    // Test that the search page renders with search bar
    const component = await mountSuspended(() => import('~/pages/search.vue'))

    expect(component.element).toBeTruthy()
    expect(component.html()).toContain('Search')
  })

  it('renders about page with expected content', async () => {
    // Test that the about page renders properly
    const component = await mountSuspended(() => import('~/pages/about.vue'))

    expect(component.element).toBeTruthy()
    expect(component.html()).toContain('About')
  })
})
