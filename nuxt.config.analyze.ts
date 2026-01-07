/* eslint-disable no-undef */
// https://nuxt.com/docs/api/configuration/nuxt-config
import visualizer from 'rollup-plugin-visualizer'

export default defineNuxtConfig({
  extends: './nuxt.config.ts',
  vite: {
    plugins: [
      visualizer({
        filename: './dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  },
})
