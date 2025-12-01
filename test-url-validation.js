/**
 * Test script for URL validation functionality
 */

import { validateUrl, validateUrls, isUrlHealthy } from './utils/urlValidation'
import { Resource } from './types/resource'
import {
  updateResourceHealth,
  updateAllResourceHealth,
  getResourceHealthStatus,
  getAllResourceHealthStatuses,
  getResourceHealthStats,
} from './server/utils/resourceHealth'

async function testUrlValidation() {
  // Test single URL validation
  try {
    const result = await validateUrl('https://httpbin.org/status/200')
  } catch (error) {
    // Handle error silently for testing
  }

  // Test invalid URL
  try {
    const result = await validateUrl('invalid-url')
  } catch (error) {
    // Handle error silently for testing
  }

  // Test multiple URLs
  try {
    const results = await validateUrls([
      'https://httpbin.org/status/200',
      'https://httpbin.org/status/404',
      'https://httpbin.org/status/500',
    ])
  } catch (error) {
    // Handle error silently for testing
  }

  // Test resource health tracking
  try {
    const healthStatus = await updateResourceHealth(mockResource)
    const retrievedStatus = getResourceHealthStatus('test-1')
    const stats = getResourceHealthStats()
  } catch (error) {
    // Handle error silently for testing
  }

  // Test invalid URL
  try {
    const result = await validateUrl('invalid-url')
  } catch (error) {
    // Handle error silently for testing
  }

  // Test multiple URLs
  try {
    const results = await validateUrls([
      'https://httpbin.org/status/200',
      'https://httpbin.org/status/404',
      'https://httpbin.org/status/500',
    ])
  } catch (error) {
    // Handle error silently for testing
  }

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

  try {
    const healthStatus = await updateResourceHealth(mockResource)
    const retrievedStatus = getResourceHealthStatus('test-1')
    const stats = getResourceHealthStats()
  } catch (error) {
    // Handle error silently for testing
  }
}

// Run the test
testUrlValidation()
