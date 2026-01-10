/**
 * Test script for URL validation functionality
 */

import { validateUrl, validateUrls, isUrlHealthy } from './utils/urlValidation'
import {
  updateResourceHealth,
  getResourceHealthStatus,
  getResourceHealthStats,
} from './server/utils/resourceHealth'

async function testUrlValidation() {
  // Test single URL validation
  await validateUrl('https://httpbin.org/status/200').catch(() => {})

  // Test invalid URL
  await validateUrl('invalid-url').catch(() => {})

  // Test multiple URLs
  await validateUrls([
    'https://httpbin.org/status/200',
    'https://httpbin.org/status/404',
    'https://httpbin.org/status/500',
  ]).catch(() => {})

  // Test isUrlHealthy function
  isUrlHealthy(200)
  isUrlHealthy(404)
  isUrlHealthy(301)
  isUrlHealthy(null)

  // Test resource health tracking
  const mockResource = {
    id: 'test-1',
    title: 'Test Resource',
    description: 'A test resource',
    benefits: ['Benefit 1'],
    url: 'https://httpbin.org/status/200',
    category: 'Testing',
    pricingModel: 'Free',
    difficulty: 'Beginner',
    tags: ['test'],
    technology: ['test'],
    dateAdded: '2023-01-01',
    popularity: 5,
  }

  await updateResourceHealth(mockResource).catch(() => {})
  getResourceHealthStatus('test-1')
  getResourceHealthStats()
}

// Run the test
testUrlValidation()
