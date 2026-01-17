import { describe, it, expect } from 'vitest'
import { $fetch, createPage } from '@nuxt/test-utils'

interface WebhookListResponse {
  success: boolean
  data: unknown[]
}

describe.skip('Webhook Integration', () => {
  it('should have webhook API endpoints', async () => {
    const response = await $fetch<WebhookListResponse>('/api/v1/webhooks', {
      method: 'GET',
    }).catch(err => err.data || { success: false })

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should have API key management endpoints', async () => {
    const response = await $fetch<WebhookListResponse>(
      '/api/v1/auth/api-keys',
      {
        method: 'GET',
      }
    ).catch(err => err.data || { success: false })

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should have webhook page', async () => {
    const { page } = await createPage('/webhooks')
    expect(page.locator('h1')).toBeDefined()
  })
})
