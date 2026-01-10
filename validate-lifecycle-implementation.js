#!/usr/bin/env node

/**
 * Validation script to check if the Resource Status and Lifecycle Management implementation is complete
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log(
  '🔍 Validating Resource Status and Lifecycle Management Implementation...\n'
)

const validationChecks = [
  {
    name: 'Resource Interface Update',
    check: () => {
      const resourceTypesPath = path.join(__dirname, 'types/resource.ts')
      const content = fs.readFileSync(resourceTypesPath, 'utf8')
      const hasStatusField = content.includes(
        "status?: 'active' | 'deprecated' | 'discontinued' | 'updated' | 'pending'"
      )
      const hasStatusChangeInterface = content.includes(
        'interface StatusChange'
      )
      const hasResourceUpdateInterface = content.includes(
        'interface ResourceUpdate'
      )
      const hasHealthCheckInterface = content.includes('interface HealthCheck')

      return {
        success:
          hasStatusField &&
          hasStatusChangeInterface &&
          hasResourceUpdateInterface &&
          hasHealthCheckInterface,
        details: {
          hasStatusField,
          hasStatusChangeInterface,
          hasResourceUpdateInterface,
          hasHealthCheckInterface,
        },
      }
    },
  },

  {
    name: 'API Endpoints Creation',
    check: () => {
      const endpoints = [
        'server/api/resources/[id]/status.put.ts',
        'server/api/resources/[id]/history.get.ts',
        'server/api/resources/[id]/health.post.ts',
        'server/api/resources/lifecycle.get.ts',
        'server/api/resources/bulk-status.post.ts',
        'server/api/health-checks.get.ts',
      ]

      const results = endpoints.map(endpoint => {
        const exists = fs.existsSync(path.join(__dirname, endpoint))
        return { endpoint, exists }
      })

      const allExist = results.every(r => r.exists)
      return {
        success: allExist,
        details: results,
      }
    },
  },

  {
    name: 'Components Creation',
    check: () => {
      const components = [
        'components/ResourceStatus.vue',
        'components/LifecycleTimeline.vue',
        'components/HealthMonitor.vue',
        'components/StatusManager.vue',
        'components/DeprecationNotice.vue',
      ]

      const results = components.map(component => {
        const exists = fs.existsSync(path.join(__dirname, component))
        return { component, exists }
      })

      const allExist = results.every(r => r.exists)
      return {
        success: allExist,
        details: results,
      }
    },
  },

  {
    name: 'ResourceCard Component Update',
    check: () => {
      const resourceCardPath = path.join(
        __dirname,
        'components/ResourceCard.vue'
      )
      const content = fs.readFileSync(resourceCardPath, 'utf8')
      const hasStatusProp = content.includes('status?:')
      const hasHealthScoreProp = content.includes('healthScore?:')
      const hasResourceStatusImport = content.includes(
        "import ResourceStatus from '~/components/ResourceStatus.vue'"
      )
      const hasStatusDisplay = content.includes('<ResourceStatus')

      return {
        success:
          hasStatusProp &&
          hasHealthScoreProp &&
          hasResourceStatusImport &&
          hasStatusDisplay,
        details: {
          hasStatusProp,
          hasHealthScoreProp,
          hasResourceStatusImport,
          hasStatusDisplay,
        },
      }
    },
  },

  {
    name: 'Resource Detail Page Update',
    check: () => {
      const resourceDetailPath = path.join(
        __dirname,
        'pages/resources/[id].vue'
      )
      const content = fs.readFileSync(resourceDetailPath, 'utf8')
      const hasImports =
        content.includes(
          "import ResourceStatus from '~/components/ResourceStatus.vue'"
        ) &&
        content.includes(
          "import LifecycleTimeline from '~/components/LifecycleTimeline.vue'"
        ) &&
        content.includes(
          "import HealthMonitor from '~/components/HealthMonitor.vue'"
        ) &&
        content.includes(
          "import DeprecationNotice from '~/components/DeprecationNotice.vue'"
        )
      const hasStatusDisplay =
        content.includes('<ResourceStatus') &&
        content.includes(':status="resource.status"')
      const hasDeprecationNotice = content.includes('<DeprecationNotice')
      const hasLifecycleTimeline = content.includes('<LifecycleTimeline')
      const hasHealthMonitor = content.includes('<HealthMonitor')
      const hasHistoryFetch = content.includes('fetchResourceHistory')

      return {
        success:
          hasImports &&
          hasStatusDisplay &&
          hasDeprecationNotice &&
          hasLifecycleTimeline &&
          hasHealthMonitor &&
          hasHistoryFetch,
        details: {
          hasImports,
          hasStatusDisplay,
          hasDeprecationNotice,
          hasLifecycleTimeline,
          hasHealthMonitor,
          hasHistoryFetch,
        },
      }
    },
  },
]

let allPassed = true

validationChecks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.name}`)
  const result = check.check()

  if (result.success) {
    console.log('   ✅ PASSED')
  } else {
    console.log('   ❌ FAILED')
    allPassed = false
  }

  if (result.details) {
    Object.entries(result.details).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        console.log(`      ${value ? '✅' : '❌'} ${key}`)
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            console.log(
              `      ${item.exists ? '✅' : '❌'} ${item.endpoint || item.component}`
            )
          }
        })
      }
    })
  }

  console.log('')
})

console.log(
  `\n${allPassed ? '🎉 All validations passed!' : '❌ Some validations failed!'}`
)
console.log(`Status: ${allPassed ? 'SUCCESS' : 'FAILURE'}`)

process.exit(allPassed ? 0 : 1)
