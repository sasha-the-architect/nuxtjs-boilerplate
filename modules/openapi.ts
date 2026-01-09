import {
  defineNuxtModule,
  addServerHandler,
  addRouteMiddleware,
} from '@nuxt/kit'
import { resolve } from 'path'

export default defineNuxtModule({
  meta: {
    name: 'openapi',
    configKey: 'openapi',
  },
  setup(_options, _nuxt) {
    // Add the OpenAPI spec route
    addServerHandler({
      route: '/api-docs/spec.json',
      handler: resolve('./server/api/api-docs/spec.get.ts'),
    })

    // Add the Swagger UI route
    addServerHandler({
      route: '/api-docs',
      handler: resolve('./server/api/api-docs/index.get.ts'),
    })

    // Add a middleware to handle API key validation if needed
    addRouteMiddleware({
      name: 'api-auth',
      path: resolve('./middleware/api-auth.ts'),
      global: false,
    })
  },
})
