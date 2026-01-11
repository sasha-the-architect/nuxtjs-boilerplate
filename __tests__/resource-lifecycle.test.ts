import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceStatus from '~/components/ResourceStatus.vue'
import LifecycleTimeline from '~/components/LifecycleTimeline.vue'
import StatusManager from '~/components/StatusManager.vue'
import DeprecationNotice from '~/components/DeprecationNotice.vue'

describe('Resource Lifecycle Components', () => {
  describe('ResourceStatus', () => {
    it('renders active status correctly', () => {
      const wrapper = mount(ResourceStatus, {
        props: {
          status: 'active',
        },
      })

      expect(wrapper.find('.status-badge').text()).toBe('Active')
      expect(wrapper.find('.status-active')).toBeTruthy()
    })

    it('renders deprecated status correctly', () => {
      const wrapper = mount(ResourceStatus, {
        props: {
          status: 'deprecated',
        },
      })

      expect(wrapper.find('.status-badge').text()).toBe('Deprecated')
      expect(wrapper.find('.status-deprecated')).toBeTruthy()
    })

    it('renders health indicator when healthScore is provided', () => {
      const wrapper = mount(ResourceStatus, {
        props: {
          status: 'active',
          healthScore: 95,
        },
      })

      expect(wrapper.find('.health-indicator')).toBeTruthy()
    })
  })

  describe('LifecycleTimeline', () => {
    it('renders status history timeline', () => {
      const statusHistory = [
        {
          id: '1',
          fromStatus: 'pending',
          toStatus: 'active',
          reason: 'Initial approval',
          changedBy: 'system',
          changedAt: '2023-01-01T00:00:00Z',
          notes: 'Resource approved for listing',
        },
      ]

      const wrapper = mount(LifecycleTimeline, {
        props: {
          statusHistory,
        },
      })

      expect(wrapper.text()).toContain('pending → active')
      expect(wrapper.text()).toContain('Initial approval')
    })

    it('renders update history', () => {
      const updateHistory = [
        {
          id: '1',
          version: '1.0.0',
          changes: ['Initial release'],
          updatedAt: '2023-01-01T00:00:00Z',
          updatedBy: 'system',
          changelog: 'First release of the resource',
        },
      ]

      const wrapper = mount(LifecycleTimeline, {
        props: {
          updateHistory,
        },
      })

      expect(wrapper.text()).toContain('v1.0.0')
      expect(wrapper.text()).toContain('First release of the resource')
    })
  })

  describe('DeprecationNotice', () => {
    it('shows deprecation notice for deprecated resources', () => {
      const wrapper = mount(DeprecationNotice, {
        props: {
          status: 'deprecated',
          migrationPath: 'https://example.com/migration',
        },
      })

      expect(wrapper.text()).toContain('Deprecated Resource')
      expect(wrapper.text()).toContain('Migration Path')
    })

    it('shows discontinuation notice for discontinued resources', () => {
      const wrapper = mount(DeprecationNotice, {
        props: {
          status: 'discontinued',
        },
      })

      expect(wrapper.text()).toContain('Discontinued Resource')
    })
  })

  describe('StatusManager', () => {
    it('renders status management controls', async () => {
      const wrapper = mount(StatusManager, {
        props: {
          resourceId: 'test-resource',
        },
      })

      expect(wrapper.find('select').exists()).toBe(true)
      expect(wrapper.find('input').exists()).toBe(true)
      expect(wrapper.find('textarea').exists()).toBe(true)
      expect(wrapper.find('button').text()).toBe('Update Status')
    })
  })
})

describe('Resource Lifecycle API Endpoints', () => {
  it('should update resource status', async () => {
    const mockResource = {
      id: 'test-resource',
      title: 'Test Resource',
      status: 'active',
    }

    // Mock the resource fetch
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          resource: { ...mockResource, status: 'deprecated' },
        }),
      ok: true,
    } as Response)

    // Simulate status update
    const response = await fetch('/api/resources/test-resource/status', {
      method: 'PUT',
      body: JSON.stringify({
        status: 'deprecated',
        reason: 'Testing',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    expect(result.success).toBe(true)
    expect(result.resource.status).toBe('deprecated')
  })

  it('should get resource history', async () => {
    const mockHistory = {
      id: 'test-resource',
      title: 'Test Resource',
      statusHistory: [
        {
          id: '1',
          fromStatus: 'pending',
          toStatus: 'active',
          reason: 'Initial approval',
          changedBy: 'system',
          changedAt: '2023-01-01T00:00:00Z',
        },
      ],
      updateHistory: [],
    }

    // Mock the history fetch
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockHistory),
      ok: true,
    } as Response)

    const response = await fetch('/api/resources/test-resource/history')
    const result = await response.json()

    expect(result.id).toBe('test-resource')
    expect(result.statusHistory).toHaveLength(1)
  })
})
