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
  console.log('Testing URL validation functionality...\n')

  // Test single URL validation
  console.log('1. Testing single URL validation:')
  try {
    const result = await validateUrl('https://httpbin.org/status/200')
    console.log('   Result:', result)
    console.log('   Status:', result.status)
    console.log('   Is Accessible:', result.isAccessible)
  } catch (error) {
    console.log('   Error:', error.message)
  }

  console.log('\n2. Testing invalid URL:')
  try {
    const result = await validateUrl('invalid-url')
    console.log('   Result:', result)
  } catch (error) {
    console.log('   Error:', error.message)
  }

  console.log('\n3. Testing multiple URLs:')
  try {
    const results = await validateUrls([
      'https://httpbin.org/status/200',
      'https://httpbin.org/status/404',
      'https://httpbin.org/status/500',
    ])
    console.log(
      '   Results:',
      results.map(r => ({
        url: r.url,
        status: r.status,
        isAccessible: r.isAccessible,
      }))
    )
  } catch (error) {
    console.log('   Error:', error.message)
  }

  console.log('\n4. Testing isUrlHealthy function:')
  console.log('   isUrlHealthy(200):', isUrlHealthy(200))
  console.log('   isUrlHealthy(404):', isUrlHealthy(404))
  console.log('   isUrlHealthy(301):', isUrlHealthy(301))
  console.log('   isUrlHealthy(null):', isUrlHealthy(null))

  console.log('\n5. Testing resource health tracking:')
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
    console.log('   Health status updated:', {
      id: healthStatus.id,
      isHealthy: healthStatus.isHealthy,
      lastStatus: healthStatus.lastStatus,
    })

    const retrievedStatus = getResourceHealthStatus('test-1')
    console.log('   Retrieved status:', {
      id: retrievedStatus?.id,
      isHealthy: retrievedStatus?.isHealthy,
      lastStatus: retrievedStatus?.lastStatus,
    })

    const stats = getResourceHealthStats()
    console.log('   Health stats:', stats)
  } catch (error) {
    console.log('   Error in health tracking:', error.message)
  }

  console.log('\nURL validation functionality test completed!')
}

// Run the test
testUrlValidation().catch(console.error)
