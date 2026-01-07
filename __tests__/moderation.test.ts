import { describe, it, expect } from 'vitest'
import {
  runQualityChecks,
  calculateQualityScore,
} from '~/server/utils/quality-checks'

// Mock data for testing
const validResource = {
  id: 'test-123',
  title: 'Test Resource',
  description: 'This is a comprehensive description of the test resource',
  url: 'https://example.com',
  category: 'Development',
  pricingModel: 'Free',
  difficulty: 'Beginner',
  tags: ['javascript', 'web'],
  technology: ['JavaScript', 'React'],
  benefits: ['Easy to use', 'Well documented'],
  dateAdded: new Date().toISOString(),
  popularity: 10,
}

const invalidResource = {
  id: 'test-456',
  title: '',
  description: 'short',
  url: 'invalid-url',
  category: '',
  pricingModel: 'Free',
  difficulty: 'Beginner',
  tags: [],
  technology: [],
  benefits: [],
  dateAdded: new Date().toISOString(),
  popularity: 10,
}

describe('Moderation System - Quality Checks', () => {
  it('should run quality checks on a valid resource', () => {
    const checks = runQualityChecks(validResource)

    // Should have multiple checks
    expect(checks.length).toBeGreaterThan(0)

    // URL validation should pass
    const urlCheck = checks.find(check => check.id === 'url-validation')
    expect(urlCheck).toBeDefined()
    expect(urlCheck?.status).toBe('pass')

    // Required fields should pass
    const titleCheck = checks.find(check => check.id === 'required-title')
    expect(titleCheck).toBeDefined()
    expect(titleCheck?.status).toBe('pass')

    const categoryCheck = checks.find(check => check.id === 'required-category')
    expect(categoryCheck).toBeDefined()
    expect(categoryCheck?.status).toBe('pass')

    // Description length should pass
    const descriptionCheck = checks.find(
      check => check.id === 'description-length'
    )
    expect(descriptionCheck).toBeDefined()
    expect(descriptionCheck?.status).toBe('pass')

    // Spam check should pass
    const spamCheck = checks.find(check => check.id === 'spam-check')
    expect(spamCheck).toBeDefined()
    expect(spamCheck?.status).toBe('pass')

    // Category validation should warn (if not in standard list)
    const categoryValidationCheck = checks.find(
      check => check.id === 'category-validation'
    )
    expect(categoryValidationCheck).toBeDefined()

    // Tags validation should pass (since we have tags)
    const tagsCheck = checks.find(check => check.id === 'tags-validation')
    expect(tagsCheck).toBeDefined()
    expect(tagsCheck?.status).toBe('pass')
  })

  it('should identify issues in an invalid resource', () => {
    const checks = runQualityChecks(invalidResource)

    // URL validation should fail
    const urlCheck = checks.find(check => check.id === 'url-validation')
    expect(urlCheck).toBeDefined()
    expect(urlCheck?.status).toBe('fail')

    // Required fields should fail
    const titleCheck = checks.find(check => check.id === 'required-title')
    expect(titleCheck).toBeDefined()
    expect(titleCheck?.status).toBe('fail')

    const categoryCheck = checks.find(check => check.id === 'required-category')
    expect(categoryCheck).toBeDefined()
    expect(categoryCheck?.status).toBe('fail')

    // Description length should warn
    const descriptionCheck = checks.find(
      check => check.id === 'description-length'
    )
    expect(descriptionCheck).toBeDefined()
    expect(descriptionCheck?.status).toBe('warn')

    // Tags validation should warn (no tags)
    const tagsCheck = checks.find(check => check.id === 'tags-validation')
    expect(tagsCheck).toBeDefined()
    expect(tagsCheck?.status).toBe('warn')
  })

  it('should calculate quality score correctly', () => {
    // Test with all passing checks (should be 100)
    const passingChecks = [
      { id: '1', title: 'Test', description: 'Test', status: 'pass' } as const,
      { id: '2', title: 'Test', description: 'Test', status: 'pass' } as const,
    ]
    expect(calculateQualityScore(passingChecks)).toBe(100)

    // Test with one failure (should be 75)
    const failingChecks = [
      { id: '1', title: 'Test', description: 'Test', status: 'pass' } as const,
      { id: '2', title: 'Test', description: 'Test', status: 'fail' } as const,
    ]
    expect(calculateQualityScore(failingChecks)).toBe(75)

    // Test with warnings (should be 90)
    const warningChecks = [
      { id: '1', title: 'Test', description: 'Test', status: 'pass' } as const,
      { id: '2', title: 'Test', description: 'Test', status: 'warn' } as const,
    ]
    expect(calculateQualityScore(warningChecks)).toBe(90)

    // Test with multiple failures (should be 50)
    const multipleFailingChecks = [
      { id: '1', title: 'Test', description: 'Test', status: 'pass' } as const,
      { id: '2', title: 'Test', description: 'Test', status: 'fail' } as const,
      { id: '3', title: 'Test', description: 'Test', status: 'fail' } as const,
    ]
    expect(calculateQualityScore(multipleFailingChecks)).toBe(50)

    // Test with score going below 0 (should be capped at 0)
    const allFailingChecks = Array(5).fill({
      id: '1',
      title: 'Test',
      description: 'Test',
      status: 'fail',
    } as const)
    expect(calculateQualityScore(allFailingChecks)).toBe(0)
  })

  it('should detect spam keywords in description', () => {
    const spamResource = {
      ...validResource,
      description:
        'This is a spam resource, click here to buy now and get rich quick!',
    }

    const checks = runQualityChecks(spamResource)
    const spamCheck = checks.find(check => check.id === 'spam-check')

    expect(spamCheck).toBeDefined()
    expect(spamCheck?.status).toBe('fail')
    expect(spamCheck?.details).toContain('Spam keywords detected')
  })

  it('should validate category against standard list', () => {
    const validCategoryResource = {
      ...validResource,
      category: 'Development',
    }

    const checks = runQualityChecks(validCategoryResource)
    const categoryCheck = checks.find(
      check => check.id === 'category-validation'
    )

    expect(categoryCheck).toBeDefined()
    expect(categoryCheck?.status).toBe('pass')

    const invalidCategoryResource = {
      ...validResource,
      category: 'Invalid Category',
    }

    const checks2 = runQualityChecks(invalidCategoryResource)
    const categoryCheck2 = checks2.find(
      check => check.id === 'category-validation'
    )

    expect(categoryCheck2).toBeDefined()
    expect(categoryCheck2?.status).toBe('warn')
  })
})
