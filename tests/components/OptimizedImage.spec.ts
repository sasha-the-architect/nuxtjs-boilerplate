import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OptimizedImage from '~/components/OptimizedImage.vue'

// Stub NuxtImg for this test
const NuxtImgStub = {
  name: 'NuxtImg',
  props: [
    'src',
    'alt',
    'width',
    'height',
    'format',
    'loading',
    'sizes',
    'quality',
    'class',
    'provider',
  ],
  template: '<div></div>',
  emits: ['load', 'error'],
}

describe('OptimizedImage', () => {
  const defaultMountOptions = {
    global: {
      stubs: {
        NuxtImg: NuxtImgStub,
      },
    },
  }

  it('renders NuxtImg component with correct props', () => {
    const wrapper = mount(OptimizedImage, {
      ...defaultMountOptions,
      props: {
        src: '/test-image.jpg',
        alt: 'Test Image',
        width: 200,
        height: 150,
      },
    })

    const img = wrapper.findComponent({ name: 'NuxtImg' })
    expect(img.exists()).toBe(true)
    expect(img.props('src')).toBe('/test-image.jpg')
    expect(img.props('alt')).toBe('Test Image')
    expect(img.props('width')).toBe(200)
    expect(img.props('height')).toBe(150)
  })

  it('applies default values for optional props', () => {
    const wrapper = mount(OptimizedImage, {
      ...defaultMountOptions,
      props: {
        src: '/test-image.jpg',
        alt: 'Test Image',
      },
    })

    const img = wrapper.findComponent({ name: 'NuxtImg' })
    expect(img.props('format')).toBe('webp')
    expect(img.props('loading')).toBe('lazy')
    expect(img.props('sizes')).toBe('100vw')
    expect(img.props('quality')).toBe(80)
    expect(img.props('provider')).toBe('ipx')
  })

  it('applies custom prop values', () => {
    const wrapper = mount(OptimizedImage, {
      ...defaultMountOptions,
      props: {
        src: '/test-image.jpg',
        alt: 'Test Image',
        format: 'jpeg',
        loading: 'eager',
        sizes: '50vw',
        quality: 90,
        imgClass: 'custom-class',
        provider: 'cloudinary',
      },
    })

    const img = wrapper.findComponent({ name: 'NuxtImg' })
    expect(img.props('format')).toBe('jpeg')
    expect(img.props('loading')).toBe('eager')
    expect(img.props('sizes')).toBe('50vw')
    expect(img.props('quality')).toBe(90)
    expect(img.props('class')).toBe('custom-class')
    expect(img.props('provider')).toBe('cloudinary')
  })

  it('emits load event when image loads', async () => {
    const wrapper = mount(OptimizedImage, {
      ...defaultMountOptions,
      props: {
        src: '/test-image.jpg',
        alt: 'Test Image',
      },
    })

    const img = wrapper.findComponent({ name: 'NuxtImg' })
    await img.vm.$emit('load')

    expect(wrapper.emitted('load')).toBeTruthy()
  })

  it('emits error event when image fails to load', async () => {
    const wrapper = mount(OptimizedImage, {
      ...defaultMountOptions,
      props: {
        src: '/test-image.jpg',
        alt: 'Test Image',
      },
    })

    const img = wrapper.findComponent({ name: 'NuxtImg' })
    const errorEvent = new Event('error')
    await img.vm.$emit('error', errorEvent)

    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')![0]).toEqual([errorEvent])
  })

  it('handles string error events', async () => {
    const wrapper = mount(OptimizedImage, {
      ...defaultMountOptions,
      props: {
        src: '/test-image.jpg',
        alt: 'Test Image',
      },
    })

    const img = wrapper.findComponent({ name: 'NuxtImg' })
    await img.vm.$emit('error', 'error occurred')

    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')![0]).toEqual(['error occurred'])
  })

  it('passes through width and height as numbers or strings', () => {
    const wrapper = mount(OptimizedImage, {
      ...defaultMountOptions,
      props: {
        src: '/test-image.jpg',
        alt: 'Test Image',
        width: '200px',
        height: '150px',
      },
    })

    const img = wrapper.findComponent({ name: 'NuxtImg' })
    expect(img.props('width')).toBe('200px')
    expect(img.props('height')).toBe('150px')
  })

  it('has all required props defined', () => {
    const wrapper = mount(OptimizedImage, {
      ...defaultMountOptions,
      props: {
        src: '/test-image.jpg',
        alt: 'Test Image',
      },
    })

    const img = wrapper.findComponent({ name: 'NuxtImg' })

    // Check that src and alt are passed through
    expect(img.props('src')).toBe('/test-image.jpg')
    expect(img.props('alt')).toBe('Test Image')
  })

  it('applies imgClass prop correctly', () => {
    const wrapper = mount(OptimizedImage, {
      ...defaultMountOptions,
      props: {
        src: '/test-image.jpg',
        alt: 'Test Image',
        imgClass: 'w-full h-auto rounded-md',
      },
    })

    const img = wrapper.findComponent({ name: 'NuxtImg' })
    expect(img.props('class')).toBe('w-full h-auto rounded-md')
  })
})
