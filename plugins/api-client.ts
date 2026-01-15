/**
 * API Client Plugin
 *
 * Provides ApiClient instance globally throughout the application.
 * This ensures consistent HTTP communication with proper error handling,
 * authentication, and type safety.
 *
 * Architecture Principles:
 * - Dependency Inversion: Composables depend on ApiClient abstraction
 * - Single Source of Truth: All HTTP operations go through ApiClient
 * - Testability: ApiClient can be mocked in tests
 *
 * Usage:
 * ```typescript
 * const { $apiClient } = useNuxtApp()
 * const response = await $apiClient.get<Resource[]>('/api/v1/resources')
 * if (response.success) {
 *   console.log(response.data)
 * }
 * ```
 */

import { createFetchApiClient } from '~/utils/api-client'

export default defineNuxtPlugin(() => {
  const apiClient = createFetchApiClient(globalThis.fetch)

  return {
    provide: {
      apiClient,
    },
  }
})
