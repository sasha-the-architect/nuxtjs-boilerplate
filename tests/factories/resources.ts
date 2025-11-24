export const createResource = (overrides = {}) => ({
  id: `test-resource-${Date.now()}`,
  title: 'Test Resource',
  description: 'Test Description',
  benefits: ['Test Benefit'],
  url: 'https://example.com',
  category: 'Test Category',
  tags: ['test'],
  createdAt: new Date().toISOString(),
  submittedBy: 'test-user',
  ...overrides,
})
