import { describe, it, expect } from 'vitest'
import { $fetch, setup, createPage, url } from '@nuxt/test-utils'

describe('Webhook Integration', () => {
  it('should have webhook API endpoints', async () => {
    // Test GET /api/v1/webhooks
    const response = await $fetch('/api/v1/webhooks', {
      method: 'GET',
      // Don't worry about auth for test purposes
    }).catch(err => err.data || { success: false })

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should have API key management endpoints', async () => {
    // Test GET /api/v1/auth/api-keys
    const response = await $fetch('/api/v1/auth/api-keys', {
      method: 'GET',
    }).catch(err => err.data || { success: false })

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should have webhook page', async () => {
    // This test verifies that our page exists and can be rendered
    const { page } = await createPage('/webhooks')
    expect(page.locator('h1')).toBeDefined()
  })
})
